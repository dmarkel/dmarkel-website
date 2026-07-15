# Houston Three-Layer Proof Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish an isolated, playable Houston proof slice with three independently authored, sharp, cinematic parallax layers without changing the current homepage.

**Architecture:** Three same-frame source plates form the proof slice: an opaque far panorama, an independently illustrated transparent environment plane, and a transparent foreground plane with the continuous sidewalk. A pure scene-geometry module preserves source aspect ratio, anchors the authored ground line, and applies restrained camera factors; a separate `proof.html` runtime reuses the existing player, input, physics, and viewport modules.

**Tech Stack:** Built-in image editing, PNG chroma-key post-processing, Python Pillow asset tests, HTML5 Canvas 2D, ECMAScript modules, Node 18 test runner, GitHub Pages.

## Global Constraints

- Do not modify the current homepage background or its live runtime during proof-slice development.
- Use exactly three independently authored visual layers: far, environment, and foreground.
- The far layer must be fully opaque and visually complete across the full frame.
- The environment and foreground layers may use alpha only where the far panorama intentionally shows through.
- Use camera factors `0.12`, `0.38`, and `1.00`.
- Never scale width and height by different factors.
- Preserve crisp nearest-neighbor rendering with `imageSmoothingEnabled = false`.
- Crop vertically around the authored ground line on short landscape screens.
- The foreground sidewalk must cover the entire source width.
- The proof slice must include the real walking and jumping avatar and existing desktop/mobile controls.
- Test desktop, portrait mobile, landscape mobile, and landscape-to-portrait recovery.
- Publish the preview at `proof.html`; do not replace `index.html` until the user explicitly approves the proof slice.

---

### Task 1: Produce the Three Proof-Slice Assets

**Files:**
- Create: `assets/backgrounds/houston-proof/far.png`
- Create: `assets/backgrounds/houston-proof/environment.png`
- Create: `assets/backgrounds/houston-proof/foreground.png`
- Create: `tests/test_houston_proof_assets.py`

**Interfaces:**
- Consumes: the approved Houston composition and the avatar's established pixel-art style.
- Produces: three aligned `1906 × 825` RGBA PNGs. `far.png` is fully opaque; `environment.png` and `foreground.png` contain useful transparency.

- [ ] **Step 1: Write the failing asset contract**

Create `tests/test_houston_proof_assets.py`:

```python
import unittest
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
LAYER_DIR = ROOT / "assets" / "backgrounds" / "houston-proof"
NAMES = ["far.png", "environment.png", "foreground.png"]


class HoustonProofAssetTests(unittest.TestCase):
    def setUp(self):
        self.images = {
            name: Image.open(LAYER_DIR / name).convert("RGBA")
            for name in NAMES
        }

    def test_layers_share_the_proof_frame(self):
        self.assertEqual({image.size for image in self.images.values()}, {(1906, 825)})

    def test_far_layer_is_fully_opaque(self):
        self.assertEqual(self.images["far.png"].getchannel("A").getextrema(), (255, 255))

    def test_overlays_contain_transparent_and_opaque_pixels(self):
        for name in ("environment.png", "foreground.png"):
            self.assertEqual(self.images[name].getchannel("A").getextrema(), (0, 255))

    def test_foreground_sidewalk_covers_every_column(self):
        foreground = self.images["foreground.png"]
        for x in range(foreground.width):
            column_has_ground = any(
                foreground.getpixel((x, y))[3] > 240
                for y in range(690, foreground.height)
            )
            self.assertTrue(column_has_ground, f"missing sidewalk at x={x}")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the asset contract and verify the missing-file failure**

Run:

```bash
python3 tests/test_houston_proof_assets.py -v
```

Expected: `FileNotFoundError` for `assets/backgrounds/houston-proof/far.png`.

- [ ] **Step 3: Generate the far panorama as a complete original image**

Use built-in image generation with this prompt:

```text
Use case: stylized-concept.
Asset type: opaque far background for a side-scrolling autobiographical pixel game proof slice.
Primary request: Create a completely new, fully painted Houston panorama rather than extracting objects from an existing image. Show a bright daytime sky with layered clouds, distant leafy Houston neighborhoods, a recognizable but stylized downtown Houston skyline, and subtle airport-horizon cues toward the right. Every pixel must contain intentional scenery with no empty flat-color holes.
Style/medium: high-detail cartoon pixel art matching the approved avatar; crisp clusters and hard pixel edges; no blur, painterly smearing, vector shapes, or photorealism.
Composition/framing: exact 1906 × 825 wide side-scroller frame; Lamar atmosphere on the left, downtown presence through the middle, airport direction on the right; distant depth only; ground reference near y=700.
Lighting/mood: bright Texas daytime, optimistic and cinematic.
Constraints: fully opaque edge-to-edge; no avatar; no sidewalk; no foreground fence; no text; no watermark; preserve natural building proportions.
```

Copy the selected output to `assets/backgrounds/houston-proof/far.png`. If the generated width differs by one pixel, pad only the outer right edge without resizing or resampling. Reject any output with blurred edges, distorted buildings, or unpainted regions.

- [ ] **Step 4: Generate the environment as its own original layer**

Use built-in image generation with this prompt:

```text
Use case: stylized-concept.
Asset type: independently authored middle environment plane for a side-scrolling pixel game proof slice.
Primary request: Create a new middle-depth Houston environment containing the Lamar High School facade and grounds on the left, dense neighborhood trees and streets through the center, and nearer downtown structures toward the right. This must be designed as its own parallax plane, not cut out or copied from another panorama.
Style/medium: high-detail cartoon pixel art matching the approved avatar; crisp hard pixel edges; consistent bright daytime palette; no blur or photorealism.
Composition/framing: exact 1906 × 825 frame; retained artwork concentrated from roughly y=250 through y=700; maintain believable building and vehicle proportions; leave intentional open sky around silhouettes.
Scene/backdrop: perfectly flat solid #ff00ff wherever this plane has no artwork, including the top corners and borders.
Constraints: no sidewalk; no avatar; no giant isolated objects; no cast shadow on the key color; do not use #ff00ff in the artwork; no text; no watermark.
```

Save the keyed source under `tmp/imagegen/houston-proof/environment-keyed.png`, then run:

```bash
python "$HOME/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py" \
  --input tmp/imagegen/houston-proof/environment-keyed.png \
  --out assets/backgrounds/houston-proof/environment.png \
  --auto-key border --soft-matte --transparent-threshold 12 \
  --opaque-threshold 220 --despill --edge-contract 1
```

- [ ] **Step 5: Generate the foreground as its own original layer**

Use built-in image generation with this prompt:

```text
Use case: stylized-concept.
Asset type: independently authored walkable foreground plane for a side-scrolling pixel game proof slice.
Primary request: Create a new continuous Houston sidewalk across the entire frame with slab seams, curb, and a thin road strip. Add carefully spaced close trees, Lamar fencing, shrubs, poles, and small street details near the left and edges, while keeping the central walking lane readable and never permanently hiding the avatar.
Style/medium: high-detail cartoon pixel art matching the approved avatar; crisp hard pixel edges; no blur, painterly texture, or photorealism.
Composition/framing: exact 1906 × 825 frame; sidewalk begins at y=700 and is fully opaque through every x column to the bottom; close details may rise above it but must leave generous playable gaps.
Scene/backdrop: perfectly flat solid #ff00ff above and between foreground artwork.
Constraints: no avatar; no skyline; no school facade; no gap in sidewalk; no cast shadow on the key color; do not use #ff00ff in artwork; no text; no watermark.
```

Save the keyed source under `tmp/imagegen/houston-proof/foreground-keyed.png`, then run the same chroma-key helper to produce `assets/backgrounds/houston-proof/foreground.png`.

- [ ] **Step 6: Validate, visually inspect, and commit the proof assets**

Run:

```bash
python3 tests/test_houston_proof_assets.py -v
sips -g pixelWidth -g pixelHeight -g format assets/backgrounds/houston-proof/*.png
git diff --check
git add assets/backgrounds/houston-proof tests/test_houston_proof_assets.py
git commit -m "art: add three-layer Houston proof assets"
```

Expected: four asset tests pass, all images report `1906 × 825`, and the far image is opaque.

---

### Task 2: Implement Aspect-Safe Scene Geometry

**Files:**
- Create: `src/scene-geometry.js`
- Create: `tests/scene-geometry.test.js`

**Interfaces:**
- Produces: `sceneScale(viewportHeight, artHeight)`, `sceneWorld(artWidth, artHeight, viewportHeight, groundLine)`, and `layerTransform(cameraX, viewportWidth, worldWidth, factor, artWidth, artHeight, scale, groundLine, floorY)`.
- Consumes: source art dimensions, viewport measurements, the authored ground line, camera position, and a layer factor.

- [ ] **Step 1: Write the failing geometry tests**

Create `tests/scene-geometry.test.js`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";

import { layerTransform, sceneScale, sceneWorld } from "../src/scene-geometry.js";


test("scene scaling is uniform and never shrinks proof art", () => {
  assert.equal(sceneScale(390, 825), 1);
  assert.equal(sceneScale(900, 825), 900 / 825);
});

test("world dimensions preserve the source aspect ratio", () => {
  assert.deepEqual(sceneWorld(1906, 825, 390, 700), {
    width: 1906,
    height: 825,
    scale: 1,
    groundLine: 700,
  });
});

test("layer transform anchors the ground and applies restrained travel", () => {
  assert.deepEqual(layerTransform(1000, 390, 1906, 0.38, 1906, 825, 1, 700, 332), {
    x: -380,
    y: -368,
    width: 1906,
    height: 825,
    scaleX: 1,
    scaleY: 1,
  });
});
```

- [ ] **Step 2: Run the tests and verify the module is missing**

Run `node --test tests/scene-geometry.test.js`.

Expected: `ERR_MODULE_NOT_FOUND` for `src/scene-geometry.js`.

- [ ] **Step 3: Implement the minimal aspect-safe geometry**

Create `src/scene-geometry.js`:

```javascript
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
```

- [ ] **Step 4: Run all JavaScript tests and commit**

Run:

```bash
npm test
git diff --check
git add src/scene-geometry.js tests/scene-geometry.test.js
git commit -m "feat: add aspect-safe scene geometry"
```

Expected: all existing and new Node tests pass.

---

### Task 3: Build the Isolated Playable Proof Page

**Files:**
- Create: `proof.html`
- Create: `src/proof-game.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `sceneWorld()` and `layerTransform()` from Task 2; `createInput`, `createPlayer`, `stepPlayer`, `selectAnimation`, `readViewport`, and `applyViewport` from the existing runtime.
- Produces: a separate playable proof page that does not alter `index.html` or `src/game.js`.

- [ ] **Step 1: Create the proof page shell**

Create `proof.html` with this complete page shell:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#091d22">
    <title>David — Houston Three-Layer Proof</title>
    <link rel="stylesheet" href="styles.css?v=proof-1">
  </head>
  <body>
    <main class="stage proof-stage" aria-label="Houston three-layer parallax proof">
      <canvas id="game" aria-label="A pixel character walking through the Houston proof scene"></canvas>
      <header class="masthead">
        <p class="eyebrow">Houston · Proof slice</p>
        <h1>Three layers. No stretching.</h1>
      </header>
      <aside id="instructions" class="instructions" aria-label="Controls">
        <span><kbd>←</kbd><kbd>→</kbd> walk</span>
        <span><kbd>space</kbd> jump</span>
      </aside>
      <div id="status" class="status" role="status" aria-live="polite">Preparing the proof…</div>
      <div class="touch-controls" aria-label="Touch controls">
        <button id="joystick" class="joystick" type="button" aria-label="Move left or right">
          <span class="joystick-track" aria-hidden="true"></span>
          <span id="joystick-knob" class="joystick-knob" aria-hidden="true"></span>
        </button>
        <button id="jump-button" class="jump-button" type="button" aria-label="Jump">
          <span aria-hidden="true">↑</span>
          <small>jump</small>
        </button>
      </div>
    </main>
    <script type="module" src="src/proof-game.js?v=proof-1"></script>
  </body>
</html>
```

- [ ] **Step 2: Implement the proof runtime**

Create `src/proof-game.js` from the existing fixed-step loop in `src/game.js`. Keep its input setup, image loader, player drawing, instruction dismissal, fixed-step frame loop, resize scheduling, visibility handling, and error state byte-for-byte except for the following exact imports, layer configuration, resize geometry, and layer drawing code:

```javascript
const ART = Object.freeze({ width: 1906, height: 825, groundLine: 700 });
const PROOF_LAYERS = Object.freeze([
  { name: "far", path: "assets/backgrounds/houston-proof/far.png", factor: 0.12 },
  { name: "environment", path: "assets/backgrounds/houston-proof/environment.png", factor: 0.38 },
  { name: "foreground", path: "assets/backgrounds/houston-proof/foreground.png", factor: 1 },
]);
```

During resize:

```javascript
const progress = oldWorldWidth > oldViewportWidth
  ? player.x / oldWorldWidth
  : 0.08;
const scene = sceneWorld(ART.width, ART.height, height, ART.groundLine);
world = { width: scene.width, floorY: height * 0.85, scale: scene.scale };
player.x = Math.max(0, Math.min(world.width - player.width, progress * world.width));
```

Draw every layer with one uniform scale:

```javascript
for (const layer of PROOF_LAYERS) {
  const transform = layerTransform(
    cameraX,
    viewport.width,
    world.width,
    layer.factor,
    ART.width,
    ART.height,
    world.scale,
    ART.groundLine,
    world.floorY,
  );
  context.drawImage(
    images[layer.name],
    transform.x,
    transform.y,
    transform.width,
    transform.height,
  );
}
```

Keep fixed-step physics at 60 Hz, sprite animation at 10 FPS, camera interpolation, controls, jump buffering, coyote time, error handling, viewport listeners, and visibility reset behavior unchanged.

- [ ] **Step 3: Add proof-only responsive copy styling**

Append to `styles.css`:

```css
.proof-stage .masthead {
  max-width: min(620px, calc(100vw - 44px));
}

@media (max-width: 560px) {
  .proof-stage h1 {
    max-width: 250px;
    font-size: 25px;
  }
}
```

- [ ] **Step 4: Verify syntax, tests, and page loading**

Run:

```bash
node --check src/proof-game.js
npm test
python3 -m unittest discover -s tests -v
git diff --check
```

Expected: all commands exit zero.

- [ ] **Step 5: Commit the isolated proof page**

```bash
git add proof.html src/proof-game.js styles.css
git commit -m "feat: add playable Houston three-layer proof"
```

---

### Task 4: Responsive Browser QA and Proof Deployment

**Files:**
- Verify: `proof.html`
- Verify: `src/proof-game.js`
- Verify: `assets/backgrounds/houston-proof/*.png`

**Interfaces:**
- Consumes: the committed proof page from Task 3.
- Produces: a reviewable GitHub Pages proof URL while leaving the homepage unchanged.

- [ ] **Step 1: Run the complete committed-tree verification**

Run:

```bash
npm test
python3 -m unittest discover -s tests -v
node --check src/proof-game.js
git diff --check
git status --short
```

Expected: all tests pass and the working tree is clean.

- [ ] **Step 2: Test the local proof page at required viewports**

Serve the repository locally and inspect `proof.html` at:

- Desktop: `1440 × 900`
- Portrait mobile: `390 × 844`
- Landscape mobile: `844 × 390`
- Live transition: `844 × 390` to `390 × 844` without reloading

For every viewport, verify:

- Canvas and stage equal the visible viewport.
- No body overflow exists.
- The far layer covers the entire canvas.
- Architecture retains its proportions.
- Pixel edges remain crisp.
- The sidewalk remains flush with the collision floor.
- Walking causes visible but restrained three-speed motion.
- Jumping uses the approved one-hand-raised sprite.
- No console error is recorded.

- [ ] **Step 3: Confirm the homepage is unchanged**

Open both `/index.html` and `/proof.html`. Confirm the homepage still uses `src/game.js` and the proof page uses `src/proof-game.js`.

- [ ] **Step 4: Push the proof and wait for GitHub Pages**

Run:

```bash
git push origin main
gh api repos/dmarkel/dmarkel-website/pages/builds/latest
```

Wait until the Pages build for the pushed commit reports `"status":"built"` with no error.

- [ ] **Step 5: Verify the public proof URL**

Open:

```text
https://dmarkel.github.io/dmarkel-website/proof.html
```

Verify the status hides after all five images load, the canvas fills the mobile viewport, controls appear, and no console errors occur. Share this proof URL for explicit user approval. Do not change `index.html` or replace the live homepage background in this task.
