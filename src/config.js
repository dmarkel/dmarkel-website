export const PHYSICS = Object.freeze({
  acceleration: 1800,
  friction: 2200,
  maxSpeed: 320,
  gravity: 2200,
  jumpSpeed: 800,
  coyoteTime: 0.1,
  jumpBufferTime: 0.12,
  takeoffTime: 0.07,
  landingTime: 0.09,
  apexVelocity: 120
});

export const SPRITES = Object.freeze({
  cellWidth: 64,
  cellHeight: 96,
  walkFrames: 8,
  walkFps: 10,
  idleFrame: 2
});

export const PARALLAX_LAYERS = Object.freeze([
  { name: "sky", path: "assets/backgrounds/houston/layer-01-sky.png", factor: 0.02 },
  { name: "clouds", path: "assets/backgrounds/houston/layer-02-clouds.png", factor: 0.10 },
  { name: "far", path: "assets/backgrounds/houston/layer-03-far-landmarks.png", factor: 0.24 },
  { name: "architecture", path: "assets/backgrounds/houston/layer-04-primary-architecture.png", factor: 0.48 },
  { name: "environment", path: "assets/backgrounds/houston/layer-05-near-environment.png", factor: 0.70 },
  { name: "accents", path: "assets/backgrounds/houston/layer-06-foreground-accents.png", factor: 0.86 },
  { name: "ground", path: "assets/backgrounds/houston/layer-07-ground.png", factor: 1.00 },
]);

export const FIXED_STEP = 1 / 60;
