import test from "node:test";
import assert from "node:assert/strict";
import { createPlayer, selectAnimation, stepPlayer } from "../src/player.js";

const world = { width: 800, floorY: 500 };
const dt = 1 / 60;

function groundedPlayer() {
  return createPlayer({ x: 200, y: 356, width: 96, height: 144, grounded: true });
}

test("movement accelerates, faces right, and respects maximum speed", () => {
  let player = groundedPlayer();
  for (let index = 0; index < 30; index += 1) {
    player = stepPlayer(player, { move: 1, jumpPressed: false }, dt, world);
  }
  assert.equal(player.facing, 1);
  assert.ok(player.vx > 0);
  assert.ok(player.vx <= 320);
});

test("friction reduces horizontal velocity toward zero", () => {
  const moving = { ...groundedPlayer(), vx: 200 };
  const stopped = stepPlayer(moving, { move: 0, jumpPressed: false }, 0.1, world);
  assert.ok(stopped.vx < moving.vx);
  assert.ok(stopped.vx >= 0);
});

test("viewport bounds clamp both sides", () => {
  const left = stepPlayer({ ...groundedPlayer(), x: -20, vx: -100 }, { move: -1, jumpPressed: false }, dt, world);
  const right = stepPlayer({ ...groundedPlayer(), x: 790, vx: 100 }, { move: 1, jumpPressed: false }, dt, world);
  assert.equal(left.x, 0);
  assert.equal(left.vx, 0);
  assert.equal(right.x, world.width - right.width);
  assert.equal(right.vx, 0);
});

test("grounded jump launches once and blocks a midair second jump", () => {
  const launched = stepPlayer(groundedPlayer(), { move: 0, jumpPressed: true }, dt, world);
  assert.equal(launched.grounded, false);
  assert.ok(launched.vy < 0);
  const second = stepPlayer(launched, { move: 0, jumpPressed: true }, dt, world);
  assert.ok(second.vy > launched.vy);
});

test("coyote time permits a jump immediately after leaving ground", () => {
  const airborne = { ...groundedPlayer(), grounded: false, y: 350, coyoteRemaining: 0.05 };
  const launched = stepPlayer(airborne, { move: 0, jumpPressed: true }, dt, world);
  assert.ok(launched.vy < 0);
});

test("jump buffering launches on the step after landing", () => {
  let player = { ...groundedPlayer(), grounded: false, y: 355, vy: 120, coyoteRemaining: 0 };
  player = stepPlayer(player, { move: 0, jumpPressed: true }, dt, world);
  assert.equal(player.grounded, true);
  player = stepPlayer(player, { move: 0, jumpPressed: false }, dt, world);
  assert.equal(player.grounded, false);
  assert.ok(player.vy < 0);
});

test("animation selection follows walk and jump physical states", () => {
  assert.deepEqual(selectAnimation({ ...groundedPlayer(), vx: 100, animationTime: 0.31, landingRemaining: 0 }), { sheet: "walk", frame: 3 });
  assert.deepEqual(selectAnimation({ ...groundedPlayer(), grounded: false, takeoffRemaining: 0.03, vy: -700 }), { sheet: "jump", frame: 0 });
  assert.deepEqual(selectAnimation({ ...groundedPlayer(), grounded: false, takeoffRemaining: 0, vy: -400 }), { sheet: "jump", frame: 1 });
  assert.deepEqual(selectAnimation({ ...groundedPlayer(), grounded: false, takeoffRemaining: 0, vy: 0 }), { sheet: "jump", frame: 2 });
  assert.deepEqual(selectAnimation({ ...groundedPlayer(), grounded: false, takeoffRemaining: 0, vy: 300 }), { sheet: "jump", frame: 3 });
  assert.deepEqual(selectAnimation({ ...groundedPlayer(), landingRemaining: 0.03 }), { sheet: "jump", frame: 4 });
});
