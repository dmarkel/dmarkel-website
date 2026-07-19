# Bloomington Kelley-to-Kirkwood Proof Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a sharp, playable Bloomington proof slice that moves from the authentic 2007 Kelley School exterior through a tree-lined buffer to the opening Kirkwood block at Nick's English Hut, using the unchanged avatar and the approved three-layer scene protocol.

**Architecture:** Keep Houston untouched and create an isolated `bloomington.html` review route. Reuse the shared player, input, camera, viewport, foreground-transform, and scene-geometry modules; add Bloomington-specific artwork, manifest data, asset validation, and a route-specific game module. The proof world is 3,812 source pixels wide, ends at the complete right edge of Nick's, and uses two 1,906 × 825 far/environment sections plus one separately authored 3,812 × 160 ground strip and modular props.

**Tech Stack:** HTML5 Canvas, ES modules, Node's built-in test runner, Python 3, Pillow, NumPy, built-in image generation, GitHub Pages.

## Global Constraints

- Governing specifications: `docs/superpowers/specs/2026-07-14-three-layer-scene-system-design.md` and `docs/superpowers/specs/2026-07-18-bloomington-memory-scene-design.md`.
- The avatar files, outfit, appearance, animation frames, animation timing, physics, keyboard controls, joystick, and jump button remain unchanged.
- The proof depicts one warm spring day in 2007; it contains no graduation activity.
- Kelley uses the documented pre-2014 exterior; no 2014 Hodge Hall renovation or 2017 Career Services Center appears.
- Kirkwood contains a complete Nick's English Hut landmark and period-appropriate street detail; no modern street-closure dining appears.
- Far artwork is fully opaque; ground artwork is fully opaque and pavement-only; prop sprites use clean binary alpha.
- Every bitmap preserves equal horizontal and vertical runtime scale and crisp nearest-neighbor rendering.
- No large building, vehicle, sign, tree, or person crosses the environment-panel boundary at source x = 1,906.
- The environment boundary is a deliberately authored low-detail tree/path buffer.
- The ground begins with clean pavement, uses one consistent seam direction, and contains no plants, furniture, people, buildings, or background fragments.
- Props declare stable ids, source dimensions, `baseY`, world x, and `back` or `walk` depth.
- The proof endpoint is derived from the complete Nick's landmark: source x 3,200 + width 612 = source x 3,812.
- Changed modules and bitmap URLs use cache key `bloomington-1`.
- Do not change `index.html`, `houston.html`, Houston artwork, or Houston runtime behavior.

---

### Task 1: Define the Bloomington Foreground and Endpoint Contract

**Files:**
- Create: `tests/bloomington-foreground.test.js`
- Create: `src/bloomington-foreground.js`

**Interfaces:**
- Consumes: `expandFenceRun` is not needed; Bloomington uses individual proof props only.
- Produces: `ART`, `GROUND_PLANES`, `GROUND`, `ASSETS`, `PROPS`, `LANDMARKS`, and `buildBloomingtonForeground(): { ground, props, backProps, frontProps, endSourceX }`.

- [ ] **Step 1: Write the failing manifest tests**

Create `tests/bloomington-foreground.test.js` with these assertions:

```js
import test from "node:test";
import assert from "node:assert/strict";

import {
  ART,
  ASSETS,
  GROUND,
  GROUND_PLANES,
  LANDMARKS,
  PROPS,
  buildBloomingtonForeground,
} from "../src/bloomington-foreground.js";

test("Bloomington proof uses the shared source geometry", () => {
  assert.deepEqual(ART, { width: 1906, height: 825, groundLine: 735 });
  assert.equal(GROUND.width, 3812);
  assert.equal(GROUND.height, 160);
  assert.equal(GROUND.topSourceY, 665);
  assert.match(GROUND.path, /ground-strip\.png\?v=bloomington-1$/);
});

test("proof props partition exhaustively into back and walk depth", () => {
  const scene = buildBloomingtonForeground();
  const all = scene.props.map(({ id }) => id).sort();
  const partition = [...scene.backProps, ...scene.frontProps]
    .map(({ id }) => id)
    .sort();

  assert.deepEqual(partition, all);
  assert.ok(scene.backProps.every(({ plane }) => plane === "back"));
  assert.ok(scene.frontProps.every(({ plane }) => plane === "walk"));
  assert.ok(scene.backProps.some(({ assetId }) => assetId === "student-pair"));
  for (const id of [
    "bench", "campus-lamp", "planter", "newspaper-box",
    "parking-meter", "bike-rack",
  ]) {
    assert.ok(scene.frontProps.some(({ assetId }) => assetId === id), id);
  }
});

test("every prop is grounded from its declared asset baseline", () => {
  const scene = buildBloomingtonForeground();
  for (const prop of scene.props) {
    assert.equal(prop.baseY, ASSETS[prop.assetId].baseY, prop.id);
    assert.equal(prop.groundY, GROUND_PLANES[prop.plane], prop.id);
    assert.ok(prop.x >= 0, prop.id);
    assert.ok(prop.x + ASSETS[prop.assetId].width <= 3812, prop.id);
  }
});

test("proof endpoint is the complete Nick's right edge", () => {
  const scene = buildBloomingtonForeground();
  assert.deepEqual(LANDMARKS.nicks, { x: 3200, width: 612 });
  assert.equal(scene.endSourceX, LANDMARKS.nicks.x + LANDMARKS.nicks.width);
  assert.equal(scene.endSourceX, 3812);
});

test("manifest ids and asset paths are valid and unique", () => {
  const ids = PROPS.map(({ id }) => id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(Object.values(ASSETS).every(({ path }) => (
    path.startsWith("assets/backgrounds/bloomington-proof/")
    && path.endsWith("?v=bloomington-1")
  )));
});
```

- [ ] **Step 2: Run the tests and verify the expected module failure**

Run:

```bash
node --test tests/bloomington-foreground.test.js
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/bloomington-foreground.js`.

- [ ] **Step 3: Implement the Bloomington manifest**

Create `src/bloomington-foreground.js` with this source-space contract:

```js
const ROOT = "assets/backgrounds/bloomington-proof";
const revision = (name) => `${ROOT}/${name}?v=bloomington-1`;

export const ART = Object.freeze({ width: 1906, height: 825, groundLine: 735 });
export const GROUND_PLANES = Object.freeze({ back: 665, walk: 735 });
export const GROUND = Object.freeze({
  path: revision("ground-strip.png"),
  width: 3812,
  height: 160,
  topSourceY: 665,
});

export const ASSETS = Object.freeze({
  bench: { path: revision("bench.png"), width: 150, height: 96, baseY: 95 },
  "campus-lamp": { path: revision("campus-lamp.png"), width: 64, height: 190, baseY: 189 },
  planter: { path: revision("planter.png"), width: 128, height: 100, baseY: 99 },
  "newspaper-box": { path: revision("newspaper-box.png"), width: 80, height: 108, baseY: 107 },
  "parking-meter": { path: revision("parking-meter.png"), width: 45, height: 118, baseY: 117 },
  "bike-rack": { path: revision("bike-rack.png"), width: 80, height: 88, baseY: 87 },
  "student-pair": { path: revision("student-pair.png"), width: 150, height: 150, baseY: 149 },
});

export const PROPS = Object.freeze([
  { id: "kelley-students", assetId: "student-pair", x: 1280, plane: "back" },
  { id: "campus-bench", assetId: "bench", x: 520, plane: "walk" },
  { id: "campus-lamp", assetId: "campus-lamp", x: 930, plane: "walk" },
  { id: "campus-planter", assetId: "planter", x: 1450, plane: "walk" },
  { id: "kirkwood-news", assetId: "newspaper-box", x: 2250, plane: "walk" },
  { id: "kirkwood-meter", assetId: "parking-meter", x: 2580, plane: "walk" },
  { id: "kirkwood-rack", assetId: "bike-rack", x: 2910, plane: "walk" },
]);

export const LANDMARKS = Object.freeze({ nicks: { x: 3200, width: 612 } });

function groundProp(prop) {
  const asset = ASSETS[prop.assetId];
  const groundY = GROUND_PLANES[prop.plane];
  if (!asset) throw new Error(`Unknown Bloomington asset: ${prop.assetId}`);
  if (groundY === undefined) throw new Error(`Unknown Bloomington depth plane: ${prop.plane}`);
  return { ...prop, baseY: asset.baseY, groundY, mirror: Boolean(prop.mirror) };
}

export function buildBloomingtonForeground() {
  const props = PROPS.map(groundProp);
  return {
    ground: GROUND,
    props,
    backProps: props.filter(({ plane }) => plane === "back"),
    frontProps: props.filter(({ plane }) => plane === "walk"),
    endSourceX: LANDMARKS.nicks.x + LANDMARKS.nicks.width,
  };
}
```

- [ ] **Step 4: Run the focused and complete JavaScript suites**

Run:

```bash
node --test tests/bloomington-foreground.test.js
npm test
```

Expected: the Bloomington tests pass and the existing suite remains green.

- [ ] **Step 5: Commit the manifest contract**

```bash
git add tests/bloomington-foreground.test.js src/bloomington-foreground.js
git commit -m "feat: define Bloomington proof manifest"
```

---

### Task 2: Add Reusable Bitmap Normalization and Proof Asset Tests

**Files:**
- Create: `tools/normalize_scene_asset.py`
- Create: `tests/test_normalize_scene_asset.py`
- Create: `tests/test_bloomington_proof_assets.py`

**Interfaces:**
- Consumes: Pillow `Image`, `tools.extract_connected_chroma.extract_connected_chroma`.
- Produces: `cover_resize(image, width, height)`, `trim_dark_matte(image, threshold=24)`, `normalize_opaque(source, size, trim_matte)`, and `normalize_keyed(source, size, key, tolerance)`.

- [ ] **Step 1: Write failing normalization tests**

Create `tests/test_normalize_scene_asset.py` that proves:

```python
import unittest
from PIL import Image, ImageDraw

from tools.normalize_scene_asset import cover_resize, trim_dark_matte


class NormalizeSceneAssetTests(unittest.TestCase):
    def test_cover_resize_preserves_target_aspect_without_stretching(self):
        source = Image.new("RGB", (200, 200), "#223344")
        result = cover_resize(source, 400, 100)
        self.assertEqual(result.size, (400, 100))

    def test_dark_matte_is_removed_from_a_wide_generated_strip(self):
        source = Image.new("RGB", (300, 200), "#000000")
        ImageDraw.Draw(source).rectangle((0, 70, 299, 129), fill="#b8a98f")
        result = trim_dark_matte(source)
        self.assertEqual(result.size, (300, 60))
        self.assertGreater(min(result.convert("RGB").getpixel((10, 10))), 24)
```

- [ ] **Step 2: Run the tests and verify the missing-module failure**

Run:

```bash
python3 -m unittest tests/test_normalize_scene_asset.py
```

Expected: FAIL because `tools.normalize_scene_asset` does not exist.

- [ ] **Step 3: Implement deterministic normalization**

Create `tools/normalize_scene_asset.py` with center cover-cropping, nearest-neighbor resize, optional dark-matte trimming, optional border-connected magenta extraction, binary alpha, and a two-pixel transparent border for keyed sprites. The command-line interface is:

```text
python3 tools/normalize_scene_asset.py \
  --input SOURCE \
  --out DESTINATION \
  --width WIDTH \
  --height HEIGHT \
  [--trim-dark-matte] \
  [--key-color '#ff00ff' --tolerance 55 --binary-alpha]
```

The implementation must use `Image.Resampling.NEAREST`, reject an empty matte crop, force opaque assets to alpha 255, and refuse to overwrite unless `--force` is supplied.

- [ ] **Step 4: Run normalization tests**

Run:

```bash
python3 -m unittest tests/test_normalize_scene_asset.py tests/test_connected_chroma.py
```

Expected: all normalization and chroma tests pass.

- [ ] **Step 5: Write proof-asset tests before producing artwork**

Create `tests/test_bloomington_proof_assets.py` with exact path and dimension assertions for:

```python
FAR = ["far-01.png", "far-02.png"]              # each 1906 × 825, opaque
ENVIRONMENT = ["environment-01.png", "environment-02.png"]  # each 1906 × 825
GROUND = "ground-strip.png"                      # 3812 × 160, opaque
PROPS = {
    "bench.png": (150, 96),
    "campus-lamp.png": (64, 190),
    "planter.png": (128, 100),
    "newspaper-box.png": (80, 108),
    "parking-meter.png": (45, 118),
    "bike-rack.png": (80, 88),
    "student-pair.png": (150, 150),
}
```

The tests must reject:

- missing files or wrong dimensions;
- any transparent far or ground pixel;
- a ground top edge with more than 0.3% green-dominant or near-black pixels;
- competing left- and right-leaning ground seam counts;
- environment panels with a large opaque object in the 128-pixel seam bands above source y 560;
- prop alpha values outside `{0, 255}`;
- opaque sprite corners;
- any visible magenta-dominant prop pixel where `red > 90`, `blue > 90`, and `min(red, blue) - green > 35`;
- visible prop coverage below 5% or above 85%.

- [ ] **Step 6: Run asset tests and verify missing-file failures**

Run:

```bash
python3 -m unittest tests/test_bloomington_proof_assets.py
```

Expected: FAIL with missing paths under `assets/backgrounds/bloomington-proof/`.

- [ ] **Step 7: Commit the normalization and validation harness**

```bash
git add tools/normalize_scene_asset.py tests/test_normalize_scene_asset.py tests/test_bloomington_proof_assets.py
git commit -m "test: define Bloomington proof asset contracts"
```

---

### Task 3: Produce and Approve the Kelley-to-Kirkwood Proof Artwork

**Files:**
- Create: `assets/backgrounds/bloomington-proof/far-01.png`
- Create: `assets/backgrounds/bloomington-proof/far-02.png`
- Create: `assets/backgrounds/bloomington-proof/environment-01.png`
- Create: `assets/backgrounds/bloomington-proof/environment-02.png`
- Create: `assets/backgrounds/bloomington-proof/ground-strip.png`
- Create: `assets/backgrounds/bloomington-proof/bench.png`
- Create: `assets/backgrounds/bloomington-proof/campus-lamp.png`
- Create: `assets/backgrounds/bloomington-proof/planter.png`
- Create: `assets/backgrounds/bloomington-proof/newspaper-box.png`
- Create: `assets/backgrounds/bloomington-proof/parking-meter.png`
- Create: `assets/backgrounds/bloomington-proof/bike-rack.png`
- Create: `assets/backgrounds/bloomington-proof/student-pair.png`
- Create: `tools/render_bloomington_proof_atlas.py`
- Generate but do not commit: `tmp/imagegen/bloomington-proof/*`

**Interfaces:**
- Consumes: the 2006 Kelley exterior and period Nick's references, built-in image generation, `tools/normalize_scene_asset.py`, and `tests/test_bloomington_proof_assets.py`.
- Produces: production-ready proof bitmaps and `tmp/imagegen/bloomington-proof/proof-atlas.png`.

- [ ] **Step 1: Save non-production historical references**

Download the 2006 Kelley photo from Wikimedia Commons and a period-compatible Nick's exterior reference into `tmp/references/bloomington/`. Do not commit reference downloads. Record the source URLs in `tmp/references/bloomington/SOURCES.md` for the work session.

- [ ] **Step 2: Generate the two far panels as one connected visual system**

Use the built-in image generation tool. The first prompt is:

```text
Use case: stylized-concept
Asset type: far parallax panel for a high-detail cartoon pixel-art side-scroller
Primary request: Warm spring 2007 Bloomington, Indiana horizon behind Indiana University. Bright late-afternoon blue sky, restrained soft clouds, distant fresh-green tree canopy, low campus roof silhouettes, no close buildings, no people, no avatar, no text.
Style: crisp high-detail pixel art matching the approved avatar; cinematic and restrained rather than busy.
Composition: 1906×825 scene framing with ground reference at y=735. This is panel 1 of 2. Keep the rightmost 280 source pixels as calm open sky and low tree canopy for a safe transition.
Constraints: fully painted and opaque edge to edge; equal-detail pixel grid; no transparency, no magenta, no blur, no watermark.
```

Generate panel 2 using panel 1 as a style/reference image and require the leftmost 280 source pixels to repeat the same calm sky/canopy transition before introducing a distant Kirkwood roofline. Normalize both to 1906 × 825 with opaque alpha.

- [ ] **Step 3: Generate the environment panels with complete landmarks**

Generate `environment-01.png` using the 2006 Kelley reference:

```text
Use case: precise-object-edit / stylized-concept
Asset type: transparent environment parallax panel
Primary request: Recreate the authentic pre-renovation 2007 Kelley School of Business exterior in warm spring daylight, complete and fully contained in the left and middle of the panel. Include limestone and brick architecture, period signage, spring trees, campus path, and a few distant 2007 students and bicycles. No graduation activity.
Composition: panel 1 of 2, 1906×825 framing, source ground reference y=735. End the building by x≈1500. Reserve the rightmost 300 source pixels for only low shrubs, path, and small tree canopy so no major object crosses the seam.
Background: perfectly flat #ff00ff chroma outside environment subjects. Do not use magenta in subjects.
Constraints: no current Hodge Hall renovation, no Career Services Center, no avatar, no close sidewalk furniture, no watermark, crisp high-detail cartoon pixel art.
```

Generate `environment-02.png` using the cleaned first panel and Nick's reference:

```text
Use case: precise-object-edit / stylized-concept
Asset type: transparent environment parallax panel
Primary request: Continue the same warm spring 2007 Bloomington scene from a low-detail campus-to-city buffer into the opening Kirkwood Avenue block. The leftmost 300 source pixels contain only matching low shrubs, path, and small canopy. Recreate a complete period-appropriate Nick's English Hut storefront from approximately x=1294 through the right edge, with its full right architectural frame visible at x=1906. Include restrained period cars and ordinary pedestrians behind the walking lane. No graduation activity and no modern street-closure dining.
Background: perfectly flat #ff00ff chroma outside environment subjects. Do not use magenta in subjects.
Constraints: no split building, sign, awning, vehicle, tree, or person at either edge; no avatar; no close props; no watermark; same pixel density and palette as panel 1.
```

Normalize each to 1906 × 825, remove only border-connected magenta, despill edges, and force binary alpha.

- [ ] **Step 4: Generate the pavement-only ground strip**

Use this exact prompt:

```text
Use case: precise-object-edit
Asset type: production ground strip for a high-detail pixel-art side-scroller
Primary request: One continuous 3812×160 pavement-only strip. The left half is an Indiana University campus limestone/concrete walking path; a restrained authored transition occurs near the center; the right half is a 2007 Kirkwood sidewalk with curb, drainage channel, and narrow asphalt road edge.
Perspective: every diagonal expansion joint slopes downward to the right like a backslash. Never switch seam direction.
Constraints: begin at the top row with clean pavement; no greenery, furniture, people, vehicles, buildings, signs, fence fragments, background pixels, text, watermark, transparency, or black generator border. Fully opaque. Crisp high-detail pixel art, no blur. Keep drains and cracks restrained and avoid obvious repetition.
```

Trim any generator matte before resizing to 3812 × 160. Blend only the outer 96 columns if needed for compatible edges; do not change the center material transition.

- [ ] **Step 5: Generate isolated modular props**

Issue one built-in image generation call per prop. Every prompt uses:

```text
Create [SUBJECT] as a single isolated high-detail cartoon pixel-art game sprite matching the Bloomington proof palette. Show the complete object, side-on, grounded, with crisp edges and generous padding on a perfectly flat solid #ff00ff background. No cast shadow, floor, scenery, text, watermark, or magenta within the object.
```

Subjects and final dimensions:

- dark wood-and-metal campus bench, 150 × 96;
- classic black IU campus lamp, 64 × 190;
- low limestone spring planter with green leaves and no purple flowers, 128 × 100;
- blue 2007 newspaper vending box with no readable brand text, 80 × 108;
- black single-head parking meter, 45 × 118;
- simple black loop bicycle rack, 80 × 88;
- two ordinary 2007 college students standing and talking, no graduation attire, 150 × 150.

Normalize each sprite, remove border-connected magenta, despill, force binary alpha, add a two-pixel transparent border, and preserve the declared dimensions.

- [ ] **Step 6: Run the proof asset tests and correct source defects only**

Run:

```bash
python3 -m unittest tests/test_bloomington_proof_assets.py
```

Expected: PASS. If a check fails, edit or regenerate the responsible asset; do not mask failures in the renderer and do not weaken the test to accept the defect.

- [ ] **Step 7: Render and inspect the proof atlas**

Create `tools/render_bloomington_proof_atlas.py` to render these checkpoints at 390 × 844 and 844 × 390 equivalents:

- Kelley building center;
- environment boundary at source x 1,906;
- campus-to-Kirkwood ground transition;
- Nick's center and right endpoint;
- avatar behind `walk` props;
- avatar in front of the `student-pair` back prop.

The atlas must use the same transforms and paint order as the runtime. Save output to `tmp/imagegen/bloomington-proof/proof-atlas.png`, inspect at original resolution, and correct every visible seam, floating prop, transparency fringe, perspective switch, empty band, or clipped landmark before continuing.

- [ ] **Step 8: Commit approved proof artwork**

```bash
git add assets/backgrounds/bloomington-proof tools/render_bloomington_proof_atlas.py
git commit -m "art: add Bloomington Kelley to Kirkwood proof"
```

---

### Task 4: Add the Playable Bloomington Review Route

**Files:**
- Create: `tests/test_bloomington_route_config.py`
- Create: `src/bloomington-game.js`
- Create: `bloomington.html`
- Modify: `.gitignore` only if `tmp/` or `.superpowers/` is not already ignored.

**Interfaces:**
- Consumes: `buildBloomingtonForeground`, the two far/environment panels, shared `config.js`, `input.js`, `player.js`, `parallax.js`, `scene-geometry.js`, `modular-foreground.js`, and `viewport.js`.
- Produces: an isolated playable route at `bloomington.html` using cache key `bloomington-1`.

- [ ] **Step 1: Write failing route tests**

Create `tests/test_bloomington_route_config.py` with assertions that:

```python
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class BloomingtonRouteConfigTests(unittest.TestCase):
    def test_route_exists_and_uses_bloomington_cache_key(self):
        html = (ROOT / "bloomington.html").read_text()
        self.assertIn("Bloomington · 2007 proof", html)
        self.assertIn("bloomington-game.js?v=bloomington-1", html)

    def test_game_uses_only_bloomington_scene_art(self):
        source = (ROOT / "src/bloomington-game.js").read_text()
        self.assertIn('from "./bloomington-foreground.js?v=bloomington-1"', source)
        self.assertIn("assets/backgrounds/bloomington-proof/far-01.png", source)
        self.assertIn("assets/backgrounds/bloomington-proof/environment-02.png", source)
        self.assertNotIn("assets/backgrounds/houston", source)

    def test_avatar_and_shared_physics_are_reused(self):
        source = (ROOT / "src/bloomington-game.js").read_text()
        self.assertIn('from "./player.js"', source)
        self.assertIn("assets/avatar/avatar-walk-right.png", source)
        self.assertIn("assets/avatar/avatar-jump-right.png", source)

    def test_world_ends_at_nicks_manifest_edge(self):
        source = (ROOT / "src/bloomington-game.js").read_text()
        self.assertIn("width: FOREGROUND.endSourceX * scene.scale", source)
        self.assertNotIn("width: scene.width * 2", source)

    def test_avatar_is_painted_between_back_and_walk_props(self):
        source = (ROOT / "src/bloomington-game.js").read_text()
        back = "drawProps(images, FOREGROUND.backProps, cameraX);"
        player = "drawPlayer(images, alpha);"
        front = "drawProps(images, FOREGROUND.frontProps, cameraX);"
        self.assertLess(source.index(back), source.index(player))
        self.assertLess(source.index(player), source.index(front))

    def test_home_and_houston_routes_are_unchanged(self):
        self.assertTrue((ROOT / "index.html").exists())
        self.assertTrue((ROOT / "houston.html").exists())
```

- [ ] **Step 2: Run route tests and verify missing-file failures**

Run:

```bash
python3 -m unittest tests/test_bloomington_route_config.py
```

Expected: FAIL because `bloomington.html` and `src/bloomington-game.js` do not exist.

- [ ] **Step 3: Create the Bloomington HTML route**

Copy the proven control structure from `houston.html`, then use:

```html
<title>David — Bloomington 2007 Proof</title>
<main class="stage proof-stage" aria-label="Bloomington 2007 Kelley to Kirkwood proof">
  <canvas id="game" aria-label="A pixel character walking from Kelley School of Business to Kirkwood Avenue"></canvas>
  <header class="masthead">
    <p class="eyebrow">Bloomington · 2007 proof</p>
    <h1>Kelley to Kirkwood.</h1>
  </header>

  <aside id="instructions" class="instructions" aria-label="Controls">
    <span><kbd>←</kbd><kbd>→</kbd> walk</span>
    <span><kbd>space</kbd> jump</span>
  </aside>

  <div id="status" class="status" role="status" aria-live="polite">Preparing Bloomington…</div>

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
<script type="module" src="src/bloomington-game.js?v=bloomington-1"></script>
```

The initial status text is `Preparing Bloomington…`.

- [ ] **Step 4: Create the Bloomington game module from the proven loop**

Copy `src/houston-game.js` to `src/bloomington-game.js`, then make only these route-specific substitutions:

```js
import { ART, ASSETS, buildBloomingtonForeground } from "./bloomington-foreground.js?v=bloomington-1";
import { groundTileTransforms, propTransform } from "./modular-foreground.js?v=bloomington-1";
import {
  endpointAlignedFactor,
  layerPanelTransforms,
  sceneFloor,
  sceneWorld,
} from "./scene-geometry.js?v=bloomington-1";

const CHAPTER_LAYERS = Object.freeze([
  {
    name: "far",
    paths: [
      "assets/backgrounds/bloomington-proof/far-01.png?v=bloomington-1",
      "assets/backgrounds/bloomington-proof/far-02.png?v=bloomington-1",
    ],
    factor: 0.12,
  },
  {
    name: "environment",
    paths: [
      "assets/backgrounds/bloomington-proof/environment-01.png?v=bloomington-1",
      "assets/backgrounds/bloomington-proof/environment-02.png?v=bloomington-1",
    ],
    factor: 0.38,
  },
]);

const FOREGROUND = buildBloomingtonForeground();
```

Remove the Houston-only `panelOffsetYs`. Keep the existing fixed-step loop, `readViewport`, `applyViewport`, equal scene scale, player interpolation, camera interpolation, image smoothing disabled, input, instruction dismissal, loading error state, ground drawing, prop culling, prop mirroring, and back/avatar/front paint order unchanged.

Set successful status copy to `Bloomington ready.` and loading failures to the existing readable `Could not load …` error path.

- [ ] **Step 5: Run route, syntax, and full suites**

Run:

```bash
python3 -m unittest tests/test_bloomington_route_config.py
node --check src/bloomington-game.js
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the playable proof route**

```bash
git add tests/test_bloomington_route_config.py src/bloomington-game.js bloomington.html
git commit -m "feat: add playable Bloomington proof route"
```

---

### Task 5: Verify the Animated Proof and Publish the Review URL

**Files:**
- Verify: `bloomington.html`
- Verify: all `assets/backgrounds/bloomington-proof/*.png`
- Modify only if a verified defect is found: the directly responsible Bloomington asset, manifest entry, or route file.

**Interfaces:**
- Consumes: the complete proof route and test suites.
- Produces: an explicitly reviewable GitHub Pages URL for the Kelley-to-Kirkwood proof.

- [ ] **Step 1: Run a local server and inspect required viewports**

Start:

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/bloomington.html` and inspect:

- 390 × 844 portrait;
- 844 × 390 landscape;
- rotate back to 390 × 844;
- 1440 × 900 desktop.

At each viewport, confirm the stage and canvas exactly match the visible viewport and the document has no horizontal or vertical overflow.

- [ ] **Step 2: Walk and jump through every proof checkpoint**

Confirm:

- Kelley remains complete and proportionally correct;
- source x 1,906 is a calm tree/path buffer with no clipped landmark;
- the campus-to-Kirkwood ground transition is continuous and uses one seam direction;
- no pavement-top background fragments repeat;
- every prop touches its declared ground plane;
- the student pair remains behind the avatar;
- bench, lamp, planter, newspaper box, meter, and rack pass in front of the avatar;
- Nick's remains complete and its right frame is the exact camera endpoint;
- no empty endpoint tail appears;
- walking and jumping remain smooth;
- there are zero browser warnings or errors.

- [ ] **Step 3: Run final automated verification**

Run fresh:

```bash
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
node --check src/bloomington-game.js
git diff --check
git status --short
```

Expected: JavaScript and Python suites pass, syntax and whitespace checks are clean, and only known unrelated ignored/untracked files remain.

- [ ] **Step 4: Push the approved proof implementation**

```bash
git push origin main
```

- [ ] **Step 5: Verify GitHub Pages and the live module graph**

Poll:

```bash
gh api repos/dmarkel/dmarkel-website/pages/builds/latest \
  --jq '{status: .status, commit: .commit, updated_at: .updated_at}'
```

Wait for `status: built`, then verify:

```bash
COMMIT=$(git rev-parse --short HEAD)
curl -fsS "https://dmarkel.github.io/dmarkel-website/bloomington.html?v=${COMMIT}"
```

The public HTML must serve `bloomington-game.js?v=bloomington-1`, the public game module must reference only Bloomington proof artwork, and the public foreground manifest must derive source endpoint 3,812 from Nick's.

- [ ] **Step 6: Present the proof for explicit approval**

Show the live review URL and a source-resolution proof atlas. Do not generate Sample Gates, the full Kirkwood corridor, or Memorial Stadium graduation artwork until the user explicitly approves this animated Kelley-to-Kirkwood proof.
