const CAMERA_RATE = 10;
const CAMERA_ANCHOR = 0.35;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));


export function worldWidthFor(viewportWidth) {
  return Math.max(5200, viewportWidth * 4);
}

export function createCamera(x = 0) {
  return { x };
}

export function stepCamera(camera, playerX, viewportWidth, worldWidth, dt) {
  const maxX = Math.max(0, worldWidth - viewportWidth);
  const target = clamp(playerX - viewportWidth * CAMERA_ANCHOR, 0, maxX);
  const blend = 1 - Math.exp(-CAMERA_RATE * dt);
  const x = Math.abs(target - camera.x) < 0.5
    ? target
    : camera.x + (target - camera.x) * blend;
  return { x: clamp(x, 0, maxX) };
}

export function layerGeometry(cameraX, viewportWidth, worldWidth, factor) {
  const travel = Math.max(0, worldWidth - viewportWidth);
  const clampedFactor = clamp(factor, 0, 1);
  const x = cameraX === 0 ? 0 : -cameraX * clampedFactor;
  return {
    x,
    width: viewportWidth + travel * clampedFactor,
  };
}
