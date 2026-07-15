# Houston Parallax Walkthrough Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the temporary Canvas backdrop with a long, smooth seven-layer Houston parallax journey that the approved avatar can walk through from Lamar High School to IAH.

**Architecture:** Derive seven aligned full-canvas art layers from the approved concept, using a removable magenta key for transparent overlays. A pure parallax module owns camera following and layer geometry; the game runtime owns responsive sizing, fixed-step updates, asset loading, and Canvas drawing. The playable world is longer than the source panorama, while layer widths are calculated so every depth plane begins at Lamar and reaches IAH at the level endpoint.

**Tech Stack:** Built-in image editing, PNG alpha post-processing, HTML5 Canvas 2D, ECMAScript modules, Node 18 test runner, Python Pillow asset tests, GitHub Pages.

## Global Constraints

- Bright daytime throughout with the approved high-detail cartoon pixel style.
- Preserve the approved Lamar → downtown Houston → IAH composition and widened sidewalk.
- Seven layers: sky, clouds/haze, far landmarks, primary architecture, near environment, foreground accents, and walkable ground.
- World width is at least `5200` CSS pixels and at least four viewport widths.
- Fixed-step physics remains `60 Hz`; sprite animation remains `10 FPS`.
- Canvas image smoothing remains disabled.
- Camera follows smoothly, keeps the avatar near 35% of the viewport after the opening area, and clamps at both level ends.
- Desktop and mobile controls, jump behavior, viewport recovery, and accessibility remain unchanged.
- Every transparent layer must have transparent corners, both transparent and opaque pixels, and no visible magenta fringe.
- Push only after automated tests and desktop/mobile browser smoke tests pass.

---

### Task 1: Produce and Validate Seven Layer Assets

**Files:**
- Reference: `assets/backgrounds/houston-journey-concept-v1.png`
- Create: `assets/backgrounds/houston/layer-01-sky.png`
- Create: `assets/backgrounds/houston/layer-02-clouds.png`
- Create: `assets/backgrounds/houston/layer-03-far-landmarks.png`
- Create: `assets/backgrounds/houston/layer-04-primary-architecture.png`
- Create: `assets/backgrounds/houston/layer-05-near-environment.png`
- Create: `assets/backgrounds/houston/layer-06-foreground-accents.png`
- Create: `assets/backgrounds/houston/layer-07-ground.png`
- Create: `tests/test_parallax_assets.py`

**Interfaces:**
- Consumes: the approved 1906 × 825 concept panorama.
- Produces: seven same-size PNGs. Layer 1 is opaque; layers 2–7 are RGBA overlays.

- [ ] **Step 1: Write the failing asset contract test**

Create `tests/test_parallax_assets.py`:

```python
import unittest
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LAYER_DIR = ROOT / "assets" / "backgrounds" / "houston"
NAMES = [
    "layer-01-sky.png",
    "layer-02-clouds.png",
    "layer-03-far-landmarks.png",
    "layer-04-primary-architecture.png",
    "layer-05-near-environment.png",
    "layer-06-foreground-accents.png",
    "layer-07-ground.png",
]

class ParallaxAssetTests(unittest.TestCase):
    def test_layers_share_dimensions_and_overlays_have_useful_alpha(self):
        images = [Image.open(LAYER_DIR / name).convert("RGBA") for name in NAMES]
        self.assertEqual({image.size for image in images}, {(1906, 825)})
        self.assertTrue(all(image.getpixel((0, 0))[3] == 0 for image in images[1:]))
        for image in images[1:]:
            alpha = image.getchannel("A")
            low, high = alpha.getextrema()
            self.assertEqual(low, 0)
            self.assertGreater(high, 200)

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the asset test and verify it fails**

Run `python3 tests/test_parallax_assets.py -v`.

Expected: FAIL because `assets/backgrounds/houston/` does not exist.

- [ ] **Step 3: Generate the seven layers**

Use built-in image editing once per layer with the approved concept as the edit target. Every layer prompt begins:

```text
Preserve the exact 1906 × 825 framing, pixel grid, object positions, scale, and bright daytime palette of the provided approved Houston panorama. This is one layer of a seven-layer parallax reconstruction. Do not redesign or move retained objects. Remove the avatar from every layer.
```

Use these exact layer instructions:

```text
Layer 1 — sky: Keep only the full pale-blue sky color field and subtle atmospheric color variation. Remove all clouds, buildings, trees, aircraft, ground, text, and objects. Fill the full canvas; no transparency.

Layer 2 — clouds/haze: Keep only clouds, faint atmospheric haze shapes, and the tiny distant flying aircraft. Replace every other pixel with perfectly flat solid #ff00ff, including all borders. No shadows or gradients in the key background.

Layer 3 — far landmarks: Keep only the distant Houston skyline silhouettes and the most distant airport/runway structures, with their original pixel colors and haze. Replace every other pixel with perfectly flat solid #ff00ff, including all borders.

Layer 4 — primary architecture: Keep the Lamar High School building, neighborhood buildings, major nearer downtown towers, freeway masses, IAH terminal, control tower, parked aircraft, and jet bridges. Replace every other pixel with perfectly flat solid #ff00ff, including all borders.

Layer 5 — near environment: Keep middle-distance trees and shrubs, school fence, neighborhood street and cars, runway fencing, service vehicles, runway equipment, and middle-distance light poles. Replace every other pixel with perfectly flat solid #ff00ff, including all borders.

Layer 6 — foreground accents: Keep only the nearest large tree trunk/canopy framing, nearest plants, large foreground poles, barriers, and closest fence accents. Replace every other pixel with perfectly flat solid #ff00ff, including all borders.

Layer 7 — ground: Keep only the entire widened sidewalk, slab seams, curb, and the thin roadway strip below it across the full width. Preserve its exact vertical position. Replace every pixel above the sidewalk with perfectly flat solid #ff00ff, including the top corners.
```

- [ ] **Step 4: Remove the magenta key from layers 2–7**

For each keyed source, run the installed helper with:

```bash
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py" \
  --input <keyed-source.png> \
  --out assets/backgrounds/houston/<layer-name.png> \
  --auto-key border \
  --soft-matte \
  --transparent-threshold 12 \
  --opaque-threshold 220 \
  --despill \
  --edge-contract 1
```

Copy the opaque sky source directly to `layer-01-sky.png`. If an edit returns a different size, stop and regenerate it rather than stretching it locally.

- [ ] **Step 5: Run asset tests and commit**

Run:

```bash
python3 -m unittest discover -s tests -p 'test_*assets.py' -v
sips -g pixelWidth -g pixelHeight -g format assets/backgrounds/houston/*.png
git diff --check
git add assets/backgrounds/houston tests/test_parallax_assets.py
git commit -m "art: add Houston parallax layers"
```

Expected: the asset contract test passes and all seven PNGs report 1906 × 825.

---

### Task 2: Implement Tested Camera and Layer Geometry

**Files:**
- Create: `src/parallax.js`
- Create: `tests/parallax.test.js`

**Interfaces:**
- Produces: `createCamera()`, `stepCamera(camera, playerX, viewportWidth, worldWidth, dt)`, `layerGeometry(cameraX, viewportWidth, worldWidth, factor)`, `worldWidthFor(viewportWidth)`.
- Consumes: player/world positions in CSS pixels and parallax factors from 0 through 1.

- [ ] **Step 1: Write failing tests**

Create `tests/parallax.test.js`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { createCamera, layerGeometry, stepCamera, worldWidthFor } from "../src/parallax.js";

test("world stays long on desktop and narrow mobile", () => {
  assert.equal(worldWidthFor(390), 5200);
  assert.equal(worldWidthFor(1600), 6400);
});

test("camera follows toward a 35 percent screen anchor and clamps", () => {
  let camera = createCamera();
  for (let index = 0; index < 120; index += 1) {
    camera = stepCamera(camera, 2600, 1000, 5200, 1 / 60);
  }
  assert.ok(Math.abs(camera.x - 2250) < 1);
  camera = stepCamera(camera, 9999, 1000, 5200, 1);
  assert.ok(camera.x > 4199);
});

test("layer geometry aligns both journey endpoints at every depth", () => {
  assert.deepEqual(layerGeometry(0, 1000, 5200, 0.25), { x: 0, width: 2050 });
  assert.deepEqual(layerGeometry(4200, 1000, 5200, 0.25), { x: -1050, width: 2050 });
  assert.deepEqual(layerGeometry(4200, 1000, 5200, 1), { x: -4200, width: 5200 });
});
```

- [ ] **Step 2: Run tests and verify the missing-module failure**

Run `node --test tests/parallax.test.js`; expect `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement the pure parallax module**

Create `src/parallax.js`:

```javascript
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
  const x = Math.abs(target - camera.x) < 0.5 ? target : camera.x + (target - camera.x) * blend;
  return { x: clamp(x, 0, maxX) };
}

export function layerGeometry(cameraX, viewportWidth, worldWidth, factor) {
  const travel = Math.max(0, worldWidth - viewportWidth);
  const clampedFactor = clamp(factor, 0, 1);
  return {
    x: -cameraX * clampedFactor,
    width: viewportWidth + travel * clampedFactor
  };
}
```

- [ ] **Step 4: Run tests and commit**

Run `npm test`; expect all tests to pass.

```bash
git add src/parallax.js tests/parallax.test.js
git commit -m "feat: add parallax camera geometry"
```

---

### Task 3: Integrate the Long Houston World

**Files:**
- Modify: `src/game.js`
- Modify: `src/config.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: seven Houston layer images and all exports from `src/parallax.js`.
- Produces: the existing playable stage with camera-relative player rendering and seven-layer background drawing.

- [ ] **Step 1: Add layer configuration**

Add to `src/config.js`:

```javascript
export const PARALLAX_LAYERS = Object.freeze([
  { name: "sky", path: "assets/backgrounds/houston/layer-01-sky.png", factor: 0.02 },
  { name: "clouds", path: "assets/backgrounds/houston/layer-02-clouds.png", factor: 0.10 },
  { name: "far", path: "assets/backgrounds/houston/layer-03-far-landmarks.png", factor: 0.24 },
  { name: "architecture", path: "assets/backgrounds/houston/layer-04-primary-architecture.png", factor: 0.48 },
  { name: "environment", path: "assets/backgrounds/houston/layer-05-near-environment.png", factor: 0.70 },
  { name: "accents", path: "assets/backgrounds/houston/layer-06-foreground-accents.png", factor: 0.86 },
  { name: "ground", path: "assets/backgrounds/houston/layer-07-ground.png", factor: 1.00 },
]);
```

- [ ] **Step 2: Refactor game state into viewport and level dimensions**

In `src/game.js`, import `PARALLAX_LAYERS` plus the parallax functions. Replace the viewport-sized `world.width` model with:

```javascript
let viewport = { width: 0, height: 0 };
let world = { width: 5200, floorY: 0 };
let camera = createCamera();
let previousCamera = createCamera();
```

During `resize()`, set `viewport` from `readViewport(window)`, set `world.width = worldWidthFor(viewport.width)`, keep `world.floorY = viewport.height - Math.max(64, viewport.height * 0.09)`, preserve the player's absolute level position, and clamp it to `world.width - player.width`.

- [ ] **Step 3: Replace the temporary stage drawing**

Replace `drawStage()` with:

```javascript
function drawParallax(images, cameraX) {
  context.fillStyle = "#8ed6f0";
  context.fillRect(0, 0, viewport.width, viewport.height);
  for (const layer of PARALLAX_LAYERS) {
    const geometry = layerGeometry(cameraX, viewport.width, world.width, layer.factor);
    context.drawImage(images[layer.name], geometry.x, 0, geometry.width, viewport.height);
  }
}
```

Draw the player at `worldX - cameraX`. Preserve its existing interpolation, shadow, mirroring, and sprite selection.

- [ ] **Step 4: Update camera inside the fixed timestep**

Inside each physics step:

```javascript
previousCamera = { ...camera };
player = stepPlayer(player, normalizedInput, FIXED_STEP, world);
camera = stepCamera(camera, player.x + player.width / 2, viewport.width, world.width, FIXED_STEP);
```

Interpolate `camera.x` during rendering exactly as player position is interpolated.

- [ ] **Step 5: Load the layer assets and update copy**

Preload `PARALLAX_LAYERS` together with the two sprite sheets. Change the masthead copy to `Houston · Chapter 01` and `Walk it back.` while keeping the control legend and accessible labels.

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm test
python3 -m unittest discover -s tests -p 'test_*.py' -v
node --check src/game.js
git diff --check
```

Expected: all JavaScript and Python tests pass with no syntax or whitespace errors.

```bash
git add index.html src/config.js src/game.js
git commit -m "feat: add Houston parallax walkthrough"
```

---

### Task 4: Browser Verification and Publish

**Files:**
- Modify only if verification identifies a concrete defect.

- [ ] **Step 1: Verify desktop**

Run the local static server and confirm in Chrome at 1440 × 900: layer images load, Lamar begins at the left, the camera follows smoothly, downtown passes through the center journey, IAH arrives at the right endpoint, the sidewalk never breaks, left-facing mirroring still works, and jump physics remain unchanged.

- [ ] **Step 2: Verify mobile portrait and landscape**

Check 390 × 844 and 844 × 390 layouts. Confirm both controls stay inside safe areas, portrait↔landscape does not expose empty edges, frame pacing remains smooth, and the avatar remains grounded on the sidewalk.

- [ ] **Step 3: Run final verification and publish**

```bash
npm test
python3 -m unittest discover -s tests -p 'test_*.py' -v
git diff --check
git status --short
git push origin main
```

Wait for GitHub Pages to report the pushed commit as `built`, then confirm the public HTML and all seven layer URLs return HTTP 200.
