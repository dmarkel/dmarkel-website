# Playable Avatar Demo Design

## Goal

Create a responsive, full-browser prototype where the approved avatar walks left and right and jumps smoothly using keyboard controls or mobile touch controls. This phase validates character feel, animation timing, and input responsiveness. Story content, platforms, interactions, and parallax scenery remain out of scope.

## Runtime Approach

Use the browser's Canvas 2D API with plain HTML, CSS, and JavaScript. Canvas provides precise sprite cropping, deterministic mirroring, and pixel-perfect rendering without a game-engine dependency. Disable image smoothing for every render so the approved pixel clusters remain crisp at all display sizes.

Use `requestAnimationFrame` for rendering and a fixed 60 Hz timestep with an accumulator for physics. Animation frame timing remains independent: the walk cycle advances at 10 frames per second, while jump art is selected from physical state rather than a looping timer.

## Page Layout

- The canvas fills the browser viewport.
- A restrained atmospheric color field and simple ground plane provide contrast without suggesting the final autobiographical environment.
- A compact instruction panel identifies desktop controls and fades after input.
- On coarse-pointer devices, a virtual joystick appears in the lower-left and a jump button appears in the lower-right.
- The page prevents scrolling and browser gesture interference only while a game control is actively engaged.
- Canvas resize accounts for device pixel ratio and preserves the character's relative horizontal position.

## Controls

Desktop movement accepts Left/Right Arrow and A/D. Jump accepts Space, Up Arrow, and W. Key repeat does not trigger repeated jumps. Keyboard state clears on blur and visibility loss so movement cannot become stuck.

The mobile joystick uses Pointer Events and captures the active pointer. Horizontal displacement maps continuously to movement input, with a dead zone near the center. The jump button also uses Pointer Events and supports simultaneous joystick movement. Pointer cancel and lost capture reset their respective controls. Both controls have accessible labels and visible pressed states.

## Character State

The player state contains position, velocity, facing direction, grounded state, animation state, current frame, coyote-time remaining, jump-buffer remaining, and landing-time remaining.

Horizontal motion uses acceleration toward a maximum speed and friction toward rest. This prevents abrupt starts and stops. The character cannot leave the viewport.

Jumping uses gravity and one upward impulse. A short coyote window accepts a jump immediately after leaving the ground, and a short jump buffer accepts a jump pressed just before landing. A held button does not create midair jumps.

## Animation Selection

- **Idle:** use a stable frame from the approved walk strip.
- **Walk:** use `assets/avatar/avatar-walk-right.png`, eight 64 × 96 cells at 10 FPS.
- **Jump:** use `assets/avatar/avatar-jump-right.png`, five 64 × 96 cells.
- **Left-facing:** mirror right-facing cells at draw time; do not duplicate image assets.

Jump cells are selected by state: takeoff immediately after impulse, ascent while vertical velocity is strongly negative, apex near zero vertical velocity, descent while velocity is positive, and landing briefly after floor contact. The same raised hand therefore stays visible throughout ascent and apex.

## Components

- `index.html`: canvas, loading/error status, instruction panel, joystick, and jump button.
- `styles.css`: full-screen layout, minimal stage styling, responsive touch controls, focus and pressed states.
- `src/config.js`: immutable physics, animation, sprite, and timing constants.
- `src/player.js`: pure player-state creation, input normalization, physics stepping, and animation selection.
- `src/input.js`: keyboard and Pointer Events adapters that expose one normalized input snapshot.
- `src/game.js`: asset loading, fixed-timestep loop, resizing, rendering, mirroring, lifecycle pause/reset, and startup errors.
- `tests/player.test.js`: deterministic tests for acceleration, friction, viewport bounds, jump gating, coyote time, jump buffering, and animation-state selection.

Each module has one responsibility. `src/player.js` has no DOM dependency, allowing its behavior to be tested with Node's built-in test runner.

## Failure Handling

The game waits for both sprite sheets before starting. If an image fails, the loop does not begin and a readable message appears in the page status element. Invalid or excessively large frame deltas are clamped so returning to a backgrounded tab cannot launch the character through the floor. Blur, visibility loss, pointer cancellation, and resize all reset transient input safely.

## Verification

- Automated tests cover pure player physics and state transitions.
- A local browser smoke test confirms assets load, canvas fills the viewport, controls respond, the avatar remains within bounds, and no console errors occur.
- Keyboard testing covers both Arrow/Space and A/D/W mappings.
- Touch-width testing covers joystick dead zone, simultaneous movement and jump, pointer cancellation, and responsive control placement.
- Visual review confirms crisp nearest-neighbor pixels, correct left-facing mirroring, smooth acceleration, planted walk timing, the single-hand raised jump, and no green fringe.

## Acceptance Criteria

- The page runs locally without a build step or third-party runtime dependency.
- The canvas fills desktop and mobile viewports and remains sharp on high-density displays.
- Keyboard and touch controls can walk left, walk right, stop, and jump.
- Movement and physics update at a fixed 60 Hz while walking art advances at 10 FPS.
- The avatar accelerates and decelerates smoothly, stays within the viewport, lands on the floor, and cannot double-jump.
- Coyote time and jump buffering work within their configured windows.
- Walk and jump strips render with the correct cell order, transparent background, consistent facing, and no smoothing or green fringe.
- Losing focus, cancelling a pointer, resizing, or hiding the page does not leave input stuck or destabilize physics.
- Automated tests pass and the local browser smoke test reports no console errors.
