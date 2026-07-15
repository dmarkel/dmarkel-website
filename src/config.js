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

export const FIXED_STEP = 1 / 60;
