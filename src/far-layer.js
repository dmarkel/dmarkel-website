import { endpointAlignedFactor } from './scene-geometry.js?v=chapter-8';

// Preserve authored pixel density. On wide screens, reduce distant travel to
// available overscan instead of magnifying the sky to cover the entire walk.
export function farLayerGeometry(layer, art, world, viewport) {
  const width = layer.width ?? art.width;
  const height = layer.height ?? art.height;
  const sourceWidth = width * layer.paths.length;
  const scale = Math.max(world.scale, viewport.width / sourceWidth);
  return {
    width, height, scale,
    factor: Math.min(layer.factor, endpointAlignedFactor(sourceWidth * scale, viewport.width, world.width)),
  };
}
