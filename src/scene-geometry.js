export function sceneScale(viewportHeight, artHeight) {
  return Math.max(1, viewportHeight / artHeight);
}

export function sceneFloor(viewportHeight, artHeight, groundLine, scale) {
  const familiarFloor = viewportHeight * 0.85;
  const flushFloor = viewportHeight - (artHeight - groundLine) * scale;
  return Math.max(familiarFloor, flushFloor);
}

export function endpointAlignedFactor(layerWidth, viewportWidth, worldWidth) {
  const worldTravel = Math.max(0, worldWidth - viewportWidth);
  if (worldTravel === 0) return 0;
  const layerTravel = Math.max(0, layerWidth - viewportWidth);
  return Math.max(0, Math.min(1, layerTravel / worldTravel));
}

export function sceneWorld(artWidth, artHeight, viewportHeight, groundLine) {
  const scale = sceneScale(viewportHeight, artHeight);
  return {
    width: artWidth * scale,
    height: artHeight * scale,
    scale,
    groundLine,
  };
}

export function layerTransform(
  cameraX,
  viewportWidth,
  worldWidth,
  factor,
  artWidth,
  artHeight,
  scale,
  groundLine,
  floorY,
) {
  const maxCamera = Math.max(0, worldWidth - viewportWidth);
  const safeCamera = Math.max(0, Math.min(maxCamera, cameraX));
  return {
    x: -safeCamera * factor,
    y: floorY - groundLine * scale,
    width: artWidth * scale,
    height: artHeight * scale,
    scaleX: scale,
    scaleY: scale,
  };
}

export function layerPanelTransforms(
  cameraX,
  viewportWidth,
  worldWidth,
  factor,
  panelWidth,
  panelHeight,
  panelCount,
  scale,
  groundLine,
  floorY,
  panelOffsetYs = [],
) {
  const maxCamera = Math.max(0, worldWidth - viewportWidth);
  const safeCamera = Math.max(0, Math.min(maxCamera, cameraX));
  const width = panelWidth * scale;
  const height = panelHeight * scale;
  const originX = -safeCamera * factor;

  return Array.from({ length: panelCount }, (_, index) => ({
    x: originX + index * width,
    y: floorY - groundLine * scale + (panelOffsetYs[index] ?? 0) * scale,
    width,
    height,
    scaleX: scale,
    scaleY: scale,
  }));
}
