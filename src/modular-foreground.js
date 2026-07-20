export function groundTileTransforms(
  cameraX,
  viewportWidth,
  worldWidth,
  scale,
  tileWidth,
  tileHeight,
  topSourceY,
  sceneY,
) {
  const maxCamera = Math.max(0, worldWidth - viewportWidth);
  const safeCamera = Math.max(0, Math.min(maxCamera, cameraX));
  const scaledWidth = tileWidth * scale;
  const firstIndex = Math.floor(safeCamera / scaledWidth) - 1;
  const lastIndex = Math.ceil((safeCamera + viewportWidth) / scaledWidth);
  const transforms = [];

  for (let index = firstIndex; index <= lastIndex; index += 1) {
    transforms.push({
      x: index * scaledWidth - safeCamera,
      y: sceneY + topSourceY * scale,
      width: scaledWidth,
      height: tileHeight * scale,
    });
  }
  return transforms;
}

export function propTransform(
  prop,
  imageWidth,
  imageHeight,
  cameraX,
  scale,
  sceneY,
  visualScale = scale,
) {
  if (!Number.isFinite(visualScale) || visualScale <= 0) {
    throw new RangeError(`Invalid prop visual scale: ${visualScale}`);
  }
  const positionedWidth = imageWidth * scale;
  const width = imageWidth * visualScale;
  return {
    x: prop.x * scale - cameraX - (width - positionedWidth) / 2,
    y: sceneY + prop.groundY * scale - prop.baseY * visualScale,
    width,
    height: imageHeight * visualScale,
    mirror: Boolean(prop.mirror),
  };
}

function fillFenceSpan(props, run, component, fromX, toX, suffix) {
  let index = 0;
  let coveredTo = fromX;
  for (let x = fromX; x + component.width <= toX; x += component.width) {
    props.push({
      id: `${run.id}-${suffix}-${index}`,
      assetId: component.id,
      x,
      width: component.width,
      plane: run.plane,
    });
    coveredTo = x + component.width;
    index += 1;
  }
  if (coveredTo < toX) {
    props.push({
      id: `${run.id}-${suffix}-${index}`,
      assetId: component.id,
      x: Math.max(fromX, toX - component.width),
      width: component.width,
      plane: run.plane,
    });
  }
}

export function expandFenceRun(run, components) {
  const props = [{
    id: `${run.id}-start`,
    assetId: components.start.id,
    x: run.startX,
    width: components.start.width,
    plane: run.plane,
  }];
  const contentStart = run.startX + components.start.width;
  const contentEnd = run.endX - components.end.width;

  if (components.gate && Number.isFinite(run.gateX)) {
    fillFenceSpan(props, run, components.middle, contentStart, run.gateX, "left");
    props.push({
      id: `${run.id}-gate`,
      assetId: components.gate.id,
      x: run.gateX,
      width: components.gate.width,
      plane: run.plane,
    });
    fillFenceSpan(
      props,
      run,
      components.middle,
      run.gateX + components.gate.width,
      contentEnd,
      "right",
    );
  } else {
    fillFenceSpan(props, run, components.middle, contentStart, contentEnd, "middle");
  }

  props.push({
    id: `${run.id}-end`,
    assetId: components.end.id,
    x: run.endX - components.end.width,
    width: components.end.width,
    plane: run.plane,
  });
  return props;
}
