# Playable Avatar Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free, full-browser Canvas demo where the approved avatar walks and jumps smoothly from keyboard or mobile controls.

**Architecture:** Keep physics and animation selection in a pure DOM-free player module tested with Node's built-in test runner. Adapt keyboard and Pointer Events into one normalized input snapshot, while a small game module owns asset loading, fixed-timestep orchestration, responsive Canvas rendering, and lifecycle recovery. Use the existing 64 × 96 walk and jump strips without generating new visual assets.

**Tech Stack:** HTML5 Canvas, CSS, ECMAScript modules, Node 18 built-in test runner, local static HTTP server.

## Global Constraints

- The canvas fills the browser viewport and disables image smoothing.
- Physics uses a fixed 60 Hz timestep; the walk strip advances at 10 FPS.
- Desktop mappings are Left/Right or A/D for movement and Space/Up/W for jump.
- Mobile uses a lower-left Pointer Events joystick and lower-right jump button with accessible labels.
- The eight-frame walk strip and five-state jump strip use 64 × 96 cells; left-facing art is mirrored at render time.
- Movement accelerates and decelerates, respects viewport bounds, lands on one floor, and cannot double-jump.
- Coyote time, jump buffering, blur reset, visibility reset, pointer cancellation, and resize recovery are required.
- No story content, platforms, parallax, third-party runtime dependency, or build step.

---

### Task 1: Implement and Test Player Physics

**Files:**
- Create: `package.json`
- Create: `src/config.js`
- Create: `src/player.js`
- Create: `tests/player.test.js`

**Interfaces:**
- Produces: `createPlayer(options)`, `stepPlayer(player, input, dt, world)`, and `selectAnimation(player)` from `src/player.js`.
- Consumes: normalized `{ move: number, jumpPressed: boolean }` input and `{ width: number, floorY: number }` world dimensions.

- [ ] **Step 1: Create the module package and failing tests**

Create `package.json`:

```json
{
  "name": "dmarkel-avatar-demo",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.js"
  }
}
```

Create `tests/player.test.js`:

```javascript
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
  for (let index = 0; index < 120; index += 1) {
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
```

- [ ] **Step 2: Run the tests and verify the missing-module failure**

Run `npm test`.

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/player.js`.

- [ ] **Step 3: Implement configuration and player state**

Create `src/config.js`:

```javascript
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
```

Create `src/player.js`:

```javascript
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
  if (next.x <= 0) { next.x = 0; if (next.vx < 0) next.vx = 0; }
  if (next.x >= maxX) { next.x = maxX; if (next.vx > 0) next.vx = 0; }

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
```

- [ ] **Step 4: Run tests and commit the physics module**

Run `npm test`; expect seven passing tests and `0` failures.

```bash
git add package.json src/config.js src/player.js tests/player.test.js
git commit -m "feat: add avatar player physics"
```

---

### Task 2: Build Inputs, Canvas Runtime, and Full-Screen UI

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `src/input.js`
- Create: `src/game.js`

**Interfaces:**
- Consumes: `createPlayer`, `stepPlayer`, `selectAnimation`, `FIXED_STEP`, and the approved sprite sheets.
- Produces: a full-viewport playable page with normalized keyboard/joystick input and accessible mobile controls.

- [ ] **Step 1: Create the normalized input adapter**

Create `src/input.js` with keyboard mappings, a continuous horizontal joystick value, one-shot jump queuing, pointer capture, pointer-cancel reset, blur reset, and a `snapshot()` method that consumes the queued jump.

```javascript
const movementKeys = new Set(["ArrowLeft", "ArrowRight", "KeyA", "KeyD"]);
const jumpKeys = new Set(["Space", "ArrowUp", "KeyW"]);

export function createInput({ joystick, joystickKnob, jumpButton }) {
  const keys = new Set();
  let joystickValue = 0;
  let jumpQueued = false;
  let joystickPointer = null;

  const resetJoystick = () => {
    joystickPointer = null;
    joystickValue = 0;
    joystickKnob.style.transform = "translate3d(0, 0, 0)";
    joystick.classList.remove("is-active");
  };

  const reset = () => { keys.clear(); jumpQueued = false; resetJoystick(); };
  const relevant = (code) => movementKeys.has(code) || jumpKeys.has(code);

  window.addEventListener("keydown", (event) => {
    if (!relevant(event.code)) return;
    event.preventDefault();
    keys.add(event.code);
    if (jumpKeys.has(event.code) && !event.repeat) jumpQueued = true;
  });
  window.addEventListener("keyup", (event) => { keys.delete(event.code); });
  window.addEventListener("blur", reset);
  document.addEventListener("visibilitychange", () => { if (document.hidden) reset(); });

  const updateJoystick = (event) => {
    if (event.pointerId !== joystickPointer) return;
    const rect = joystick.getBoundingClientRect();
    const radius = rect.width * 0.32;
    const dx = Math.max(-radius, Math.min(radius, event.clientX - (rect.left + rect.width / 2)));
    const normalized = dx / radius;
    joystickValue = Math.abs(normalized) < 0.18 ? 0 : normalized;
    joystickKnob.style.transform = `translate3d(${dx}px, 0, 0)`;
  };
  joystick.addEventListener("pointerdown", (event) => {
    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    joystick.classList.add("is-active");
    updateJoystick(event);
  });
  joystick.addEventListener("pointermove", updateJoystick);
  joystick.addEventListener("pointerup", resetJoystick);
  joystick.addEventListener("pointercancel", resetJoystick);
  joystick.addEventListener("lostpointercapture", resetJoystick);

  const pressJump = (event) => {
    event.preventDefault();
    jumpButton.setPointerCapture(event.pointerId);
    jumpButton.classList.add("is-active");
    jumpQueued = true;
  };
  const releaseJump = () => jumpButton.classList.remove("is-active");
  jumpButton.addEventListener("pointerdown", pressJump);
  jumpButton.addEventListener("pointerup", releaseJump);
  jumpButton.addEventListener("pointercancel", releaseJump);
  jumpButton.addEventListener("lostpointercapture", releaseJump);

  return {
    snapshot() {
      const keyboard = (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0)
        - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
      const result = { move: Math.max(-1, Math.min(1, keyboard + joystickValue)), jumpPressed: jumpQueued };
      jumpQueued = false;
      return result;
    },
    reset
  };
}
```

- [ ] **Step 2: Create the page and styles**

Create `index.html` with a full-screen `canvas#game`, `div#status`, `aside#instructions`, `button#joystick` containing `span#joystick-knob`, and `button#jump-button`. Load `src/game.js` as an ES module.

Create `styles.css` with `html, body` fixed to the viewport, a dark teal atmospheric background, crisp full-size canvas, compact monospace instructions, coarse-pointer-only touch controls, `touch-action: none` on controls, circular translucent joystick/jump surfaces, high-contrast focus rings, safe-area offsets, and pressed-state transforms.

- [ ] **Step 3: Implement the fixed-timestep Canvas game**

Create `src/game.js`. It must preload `assets/avatar/avatar-walk-right.png` and `assets/avatar/avatar-jump-right.png`, report failures in `#status`, resize the backing canvas by device pixel ratio, preserve relative horizontal position, draw an atmospheric gradient and ground line, disable image smoothing, step the pure player with an accumulator capped at `0.1` seconds, crop 64 × 96 frames, mirror left-facing frames with `scale(-1, 1)`, and reset input/timing on visibility loss.

Use a responsive sprite scale clamped from `1.5` to `2.5`, set the floor to `canvas.clientHeight - max(64, 9vh)`, and initialize the avatar at 18% of the viewport width on the floor. Fade the instruction panel after the first movement or jump input.

- [ ] **Step 4: Run automated tests and commit the runtime**

Run `npm test`; expect seven passing player tests plus the existing Python asset tests when run separately.

```bash
git add index.html styles.css src/input.js src/game.js
git commit -m "feat: add playable avatar canvas demo"
```

---

### Task 3: Browser Smoke Test and Final Verification

**Files:**
- Modify only if a smoke-test failure identifies a concrete defect in Task 2 files.

- [ ] **Step 1: Start the local server**

Run `python3 -m http.server 8000` from the repository root and open `http://127.0.0.1:8000/` in the in-app browser.

- [ ] **Step 2: Verify desktop behavior**

Confirm the canvas fills the viewport, both sprite sheets load, no console errors occur, Arrow/Space and A/D/W work, walking mirrors correctly, acceleration and braking are smooth, the raised-hand jump follows takeoff/ascent/apex/descent/landing, bounds hold, and repeated midair jump presses do not double-jump.

- [ ] **Step 3: Verify mobile-width behavior**

At a coarse-pointer/mobile viewport, confirm controls remain inside safe areas, joystick dead zone works, movement and jump can occur simultaneously, pointer cancellation clears input, and the canvas resizes without moving the avatar outside bounds.

- [ ] **Step 4: Run final verification**

```bash
npm test
python -m unittest tests/test_build_jump_preview.py tests/test_build_walk_preview.py -v
git diff --check
git status --short
```

Expected: all JavaScript and Python tests pass, diff check is clean, and only intentional files are modified.
