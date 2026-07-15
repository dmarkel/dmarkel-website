import { PHYSICS, SPRITES } from "./config.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const approach = (value, target, amount) => value < target
  ? Math.min(value + amount, target)
  : Math.max(value - amount, target);

export function createPlayer(options = {}) {
  return {
    x: options.x ?? 0,
    y: options.y ?? 0,
    width: options.width ?? 96,
    height: options.height ?? 144,
    vx: options.vx ?? 0,
    vy: options.vy ?? 0,
    facing: options.facing ?? 1,
    grounded: options.grounded ?? false,
    animationTime: 0,
    coyoteRemaining: options.grounded ? PHYSICS.coyoteTime : 0,
    jumpBufferRemaining: 0,
    takeoffRemaining: 0,
    landingRemaining: 0
  };
}

export function selectAnimation(player) {
  if (!player.grounded) {
    if (player.takeoffRemaining > 0) return { sheet: "jump", frame: 0 };
    if (player.vy < -PHYSICS.apexVelocity) return { sheet: "jump", frame: 1 };
    if (Math.abs(player.vy) <= PHYSICS.apexVelocity) return { sheet: "jump", frame: 2 };
    return { sheet: "jump", frame: 3 };
  }
  if (player.landingRemaining > 0) return { sheet: "jump", frame: 4 };
  if (Math.abs(player.vx) > 8) {
    return { sheet: "walk", frame: Math.floor(player.animationTime * SPRITES.walkFps) % SPRITES.walkFrames };
  }
  return { sheet: "walk", frame: SPRITES.idleFrame };
}

export function stepPlayer(player, input, dt, world) {
  const next = { ...player };
  const move = clamp(input.move ?? 0, -1, 1);
  const target = move * PHYSICS.maxSpeed;
  const rate = move === 0 ? PHYSICS.friction : PHYSICS.acceleration;
  next.vx = approach(next.vx, target, rate * dt);
  if (move !== 0) next.facing = Math.sign(move);

  next.animationTime += dt;
  next.takeoffRemaining = Math.max(0, next.takeoffRemaining - dt);
  next.landingRemaining = Math.max(0, next.landingRemaining - dt);
  next.jumpBufferRemaining = input.jumpPressed
    ? PHYSICS.jumpBufferTime
    : Math.max(0, next.jumpBufferRemaining - dt);
  next.coyoteRemaining = next.grounded
    ? PHYSICS.coyoteTime
    : Math.max(0, next.coyoteRemaining - dt);

  if (next.jumpBufferRemaining > 0 && next.coyoteRemaining > 0) {
    next.vy = -PHYSICS.jumpSpeed;
    next.grounded = false;
    next.coyoteRemaining = 0;
    next.jumpBufferRemaining = 0;
    next.takeoffRemaining = PHYSICS.takeoffTime;
    next.landingRemaining = 0;
  }

  next.vy += PHYSICS.gravity * dt;
  next.x += next.vx * dt;
  next.y += next.vy * dt;

  const maxX = Math.max(0, world.width - next.width);
  if (next.x <= 0) {
    next.x = 0;
    if (next.vx < 0) next.vx = 0;
  }
  if (next.x >= maxX) {
    next.x = maxX;
    if (next.vx > 0) next.vx = 0;
  }

  const groundY = world.floorY - next.height;
  if (next.y >= groundY) {
    const landed = !next.grounded && next.vy > 0;
    next.y = groundY;
    next.vy = 0;
    next.grounded = true;
    next.coyoteRemaining = PHYSICS.coyoteTime;
    if (landed) next.landingRemaining = PHYSICS.landingTime;
  } else {
    next.grounded = false;
  }

  return next;
}
