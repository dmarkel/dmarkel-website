export function sceneScale(viewportHeight, artHeight) {
  return Math.max(1, viewportHeight / artHeight);
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
