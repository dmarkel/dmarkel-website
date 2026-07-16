# Modular Houston Foreground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace four baked Houston foreground panels with one seamless ground tile and continuous world-positioned props and fence runs.

**Architecture:** Keep the far and environment layers unchanged. Add a pure modular-foreground geometry module, a Houston manifest, a seamless ground tile, and transparent prop sprites; render them at factor 1 across the full four-panel world without clipping or changing behavior at the old panel boundaries.

**Tech Stack:** JavaScript ES modules, HTML canvas, Node test runner, Python 3, Pillow, PNG assets, built-in image generation.

## Global Constraints

- World length remains `1906 * 4` source pixels.
- Player walking line remains source y=735.
- Ground tile top is source y=665 and every pixel is opaque.
- Ground tile first and last columns are identical.
- Props use binary alpha and contain zero magenta-dominant visible pixels under `alpha > 0`, `red > 90`, `blue > 90`, and `min(red, blue) - green > 35`.
- Iron fencing contains one explicit Lamar gate and ends before airport chain-link fencing begins.
- Fence runs may not start, stop, or change type within 96 source pixels of x=1906, x=3812, or x=5718.
- Existing far and environment layers, avatar animation, movement physics, jump behavior, `index.html`, and `src/game.js` remain unchanged.

---

### Task 1: Modular Foreground Geometry

**Files:**
- Create: `src/modular-foreground.js`
- Create: `tests/modular-foreground.test.js`

**Interfaces:**
- Produces: `groundTileTransforms(cameraX, viewportWidth, worldWidth, scale, tileWidth, tileHeight, topSourceY, sceneY) -> Array<Transform>`.
- Produces: `propTransform(prop, imageWidth, imageHeight, cameraX, scale, sceneY) -> Transform`.
- Produces: `expandFenceRun(run, components) -> Array<Prop>`.

- [ ] **Step 1: Write failing geometry tests**

```javascript
test('ground tiles cover the viewport with no horizontal gap', () => {
  const transforms = groundTileTransforms(1730, 390, 7624, 1, 400, 160, 665, -18);
  assert.ok(transforms[0].x <= 0);
  assert.ok(transforms.at(-1).x + transforms.at(-1).width >= 390);
  transforms.slice(1).forEach((tile, index) => {
    assert.equal(tile.x, transforms[index].x + transforms[index].width);
  });
});

test('prop base anchor maps to the shared source ground line', () => {
  const transform = propTransform(
    { x: 2200, baseY: 180, groundY: 665, mirror: false },
    120,
    200,
    1900,
    1.25,
    -40,
  );
  assert.equal(transform.y + 180 * 1.25, -40 + 665 * 1.25);
});

test('fence run has explicit start gate and end components', () => {
  const props = expandFenceRun(
    { id: 'lamar', startX: 100, endX: 1300, gateX: 620, groundY: 665 },
    { start: { id: 'iron-start', width: 40 }, middle: { id: 'iron-middle', width: 160 }, gate: { id: 'iron-gate', width: 180 }, end: { id: 'iron-end', width: 40 } },
  );
  assert.equal(props[0].assetId, 'iron-start');
  assert.equal(props.at(-1).assetId, 'iron-end');
  assert.equal(props.filter((prop) => prop.assetId === 'iron-gate').length, 1);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/modular-foreground.test.js`

Expected: module-not-found failure for `src/modular-foreground.js`.

- [ ] **Step 3: Implement the pure geometry functions**

Use source-space positions multiplied by `scale`; subtract scaled camera position only once. Tile from `Math.floor((cameraX / scale) / tileWidth) - 1` through the viewport's right edge. Fence expansion must place the start and end components exactly once, insert the gate at `gateX`, and fill remaining spans with middle components without overlap.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/modular-foreground.test.js`

Expected: all modular geometry tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/modular-foreground.js tests/modular-foreground.test.js
git commit -m "feat: add continuous foreground geometry"
```

### Task 2: Modular Asset Contracts and Seamless Ground

**Files:**
- Create: `tools/build_houston_ground_tile.py`
- Create: `tests/test_houston_modular_assets.py`
- Create: `assets/backgrounds/houston-modular/ground-tile.png`

**Interfaces:**
- Consumes: `assets/backgrounds/houston-chapter/foreground-02-v3.png`.
- Produces: a 400 × 160 opaque tile whose left and right columns are identical.

- [ ] **Step 1: Write failing ground and prop asset contracts**

```python
GROUND = MODULAR / "ground-tile.png"
REQUIRED_PROPS = (
    "iron-start.png", "iron-middle.png", "iron-gate.png", "iron-end.png",
    "chain-start.png", "chain-middle.png", "chain-end.png",
    "planter.png", "cabinet.png", "bench.png", "bike-rack.png",
    "bollards.png", "street-lamp.png", "terminal.png",
)

def test_ground_tile_is_opaque_and_seamless(self):
    image = Image.open(GROUND).convert("RGBA")
    self.assertEqual(image.size, (400, 160))
    self.assertEqual(image.getchannel("A").getextrema(), (255, 255))
    self.assertEqual(list(image.crop((0, 0, 1, 160)).getdata()), list(image.crop((399, 0, 400, 160)).getdata()))

def test_required_props_have_binary_alpha_and_no_magenta_contamination(self):
    for name in REQUIRED_PROPS:
        image = Image.open(MODULAR / name).convert("RGBA")
        alpha = set(image.getchannel("A").getdata())
        self.assertLessEqual(alpha, {0, 255}, name)
        contaminated = sum(a > 0 and r > 90 and b > 90 and min(r, b) - g > 35 for r, g, b, a in image.getdata())
        self.assertEqual(contaminated, 0, name)
```

- [ ] **Step 2: Run asset tests and verify RED**

Run: `python3 tests/test_houston_modular_assets.py -v`

Expected: missing-file errors for the new modular assets.

- [ ] **Step 3: Build the seamless ground tile**

Crop source box `(1700, 665, 1900, 825)` from `foreground-02-v3.png`. Create a 400 × 160 tile by placing the crop at x=0 and its horizontal mirror at x=200. Force alpha to 255. This makes the first and last columns identical and the center join symmetric.

- [ ] **Step 4: Run only the ground contract**

Run: `python3 tests/test_houston_modular_assets.py HoustonModularAssetTests.test_ground_tile_is_opaque_and_seamless -v`

Expected: PASS while prop tests remain RED.

- [ ] **Step 5: Commit ground**

```bash
git add tools/build_houston_ground_tile.py tests/test_houston_modular_assets.py assets/backgrounds/houston-modular/ground-tile.png
git commit -m "art: add seamless Houston ground tile"
```

### Task 3: Modular Prop Assets

**Files:**
- Create: `tmp/imagegen/houston-modular/*.png`
- Create: `tools/split_houston_prop_sheets.py`
- Create: `assets/backgrounds/houston-modular/*.png`
- Test: `tests/test_houston_modular_assets.py`

**Interfaces:**
- Consumes: three built-in generated keyed sheets and the existing `foreground-04-v3.png` terminal source.
- Produces: the 14 required production prop sprites named in Task 2.

- [ ] **Step 1: Generate an iron-fence component sheet**

Use the existing Houston foreground as the style reference. Generate four separated objects on flat `#ff00ff`: iron start post, 160-pixel repeatable iron middle, 180-pixel double-door iron gate, and iron end post. All components share one baseline, identical rail heights, and no ground, plants, flowers, text, or shadows.

- [ ] **Step 2: Generate an airport chain-link component sheet**

Generate three separated objects on flat `#ff00ff`: chain-link start post, 200-pixel repeatable middle, and chain-link end post. All components share one baseline and identical top-wire height. Use neutral gray metal with no purple pixels, ground, plants, text, or shadows.

- [ ] **Step 3: Generate a street-prop sheet**

Generate six separated grounded objects on flat `#ff00ff`: low planter with green/yellow/white flowers, utility cabinet, dark bench, bike rack, group of three bollards, and Houston-style street lamp. No object includes sidewalk, ground, cast shadow, purple flowers, text, or watermark.

- [ ] **Step 4: Inspect and split the sheets**

Copy the accepted generated sheets into `tmp/imagegen/houston-modular/`. Use `tools/extract_connected_chroma.py` with `#ff00ff`, tolerance 90, and no floor sealing. Split objects by explicit crop boxes recorded in `tools/split_houston_prop_sheets.py`; trim transparent padding but retain a one-pixel transparent border. Convert every nonzero alpha to 255. Neutralize any remaining magenta-dominant visible pixel by setting red to green and blue to `min(blue, green)`.

- [ ] **Step 5: Extract the terminal sprite**

Crop `(840, 70, 1906, 665)` from `foreground-04-v3.png`, trim transparent padding, add a one-pixel transparent border, and save as `terminal.png`. Its base anchor is its final image height.

- [ ] **Step 6: Run the complete asset contract**

Run: `python3 tests/test_houston_modular_assets.py -v`

Expected: all ground and prop asset tests pass with zero contaminated pixels.

- [ ] **Step 7: Commit props**

```bash
git add tools/split_houston_prop_sheets.py assets/backgrounds/houston-modular tests/test_houston_modular_assets.py
git commit -m "art: add modular Houston foreground props"
```

### Task 4: Houston Foreground Manifest

**Files:**
- Create: `src/houston-foreground.js`
- Create: `tests/houston-foreground.test.js`

**Interfaces:**
- Produces: `GROUND`, `ASSETS`, `FENCE_RUNS`, `PROPS`, `OLD_BOUNDARIES`, and `buildHoustonForeground()`.
- Consumes: `expandFenceRun()` from `src/modular-foreground.js`.

- [ ] **Step 1: Write failing manifest tests**

```javascript
test('all manifest ids are unique and paths are modular assets', () => {
  const scene = buildHoustonForeground();
  const ids = scene.props.map((prop) => prop.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(Object.values(ASSETS).every((asset) => asset.path.startsWith('assets/backgrounds/houston-modular/')));
});

test('fence endpoints avoid every old panel boundary', () => {
  for (const run of FENCE_RUNS) {
    for (const boundary of OLD_BOUNDARIES) {
      assert.ok(Math.abs(run.startX - boundary) > 96);
      assert.ok(Math.abs(run.endX - boundary) > 96);
    }
  }
});

test('iron and chain fences are separated by an intentional open span', () => {
  const iron = FENCE_RUNS.find((run) => run.type === 'iron');
  const chain = FENCE_RUNS.find((run) => run.type === 'chain');
  assert.ok(chain.startX - iron.endX >= 900);
  assert.equal(iron.gateX, 760);
  assert.equal(chain.gateX, undefined);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/houston-foreground.test.js`

Expected: module-not-found failure for `src/houston-foreground.js`.

- [ ] **Step 3: Implement the manifest**

Use an iron run from x=80 to x=3200 with one gate at x=760. Use an open span from x=3200 to x=4700 populated with planters, cabinets, bench, bike rack, bollards, and lamps. Use a chain-link run from x=4700 to x=6250. Place the terminal sprite at x=6450. Keep all prop bases on source y=665 and the complete world within x=0..7624.

- [ ] **Step 4: Run manifest tests and verify GREEN**

Run: `node --test tests/houston-foreground.test.js`

Expected: all manifest tests pass.

- [ ] **Step 5: Commit manifest**

```bash
git add src/houston-foreground.js tests/houston-foreground.test.js
git commit -m "feat: define continuous Houston foreground manifest"
```

### Task 5: Canvas Integration

**Files:**
- Modify: `src/houston-game.js`
- Modify: `houston.html`
- Modify: `tests/test_houston_route_config.py`

**Interfaces:**
- Consumes: modular geometry, manifest, ground tile, and prop assets.
- Produces: the Houston review route without baked foreground panel paths.

- [ ] **Step 1: Extend the failing route tests**

```python
def test_route_imports_modular_foreground(self):
    source = (ROOT / "src/houston-game.js").read_text()
    self.assertIn('from "./houston-foreground.js"', source)

def test_route_no_longer_loads_baked_foreground_panels(self):
    source = (ROOT / "src/houston-game.js").read_text()
    self.assertNotIn('foreground-01-v3.png', source)
    self.assertNotIn('foreground-03-v4.png', source)
```

- [ ] **Step 2: Run route tests and verify RED**

Run: `python3 tests/test_houston_route_config.py -v`

Expected: modular import assertion fails and baked paths remain present.

- [ ] **Step 3: Integrate modular rendering**

Remove the baked foreground entry from `CHAPTER_LAYERS`. Import the Houston manifest and modular transforms. Add modular asset paths to `imagePaths`. After drawing far and environment layers, draw repeating ground tiles and visible props at factor 1, culling transforms outside the viewport. Draw mirrored props with canvas save/translate/scale/restore. Keep `ART.groundLine` at 735 and image smoothing disabled.

- [ ] **Step 4: Update route cache version**

Change the Houston module query to `chapter-5`.

- [ ] **Step 5: Run route, geometry, project, and syntax tests**

```bash
python3 tests/test_houston_route_config.py -v
node --test tests/modular-foreground.test.js tests/houston-foreground.test.js
npm test
node --check src/houston-game.js
```

Expected: every test passes and syntax check exits 0.

- [ ] **Step 6: Commit integration**

```bash
git add src/houston-game.js houston.html tests/test_houston_route_config.py
git commit -m "feat: render modular Houston foreground"
```

### Task 6: Full-World Verification and Publication

**Files:**
- Create or modify test helper: `tmp/imagegen/houston-modular/render-modular-atlas.py`
- Verify unchanged: `index.html`, `src/game.js`

**Interfaces:**
- Consumes: complete local Houston route.
- Produces: visual evidence at every former boundary, fence endpoint, middle transition, and airport endpoint plus the published route.

- [ ] **Step 1: Render a critical-position atlas**

Render 390 × 844 frames centered on x=1906, x=3200, x=3812, x=4700, x=5718, x=6250, and x=7000. Include the avatar with shoes on source y=735. Reject any sidewalk discontinuity, purple artifact, floating prop, clipped object, or unexplained fence start/stop.

- [ ] **Step 2: Verify mobile browser behavior**

Open the local Houston route at 390 × 844, rotate to 844 × 390, and return to 390 × 844. Verify canvas, stage, visual viewport, and document overflow dimensions; verify hidden status and zero console errors.

- [ ] **Step 3: Run the complete verification gate**

```bash
npm test
python3 tests/test_connected_chroma.py -v
python3 tests/test_houston_modular_assets.py -v
python3 tests/test_houston_chapter_assets.py -v
python3 tests/test_houston_route_config.py -v
node --check src/houston-game.js
git diff --check
git diff --quiet 707a258..HEAD -- index.html src/game.js
```

Expected: every command exits 0 and all tests pass.

- [ ] **Step 4: Push and verify GitHub Pages**

Push `main`, wait for the Pages build for the pushed commit to report `built`, then verify the live HTML references `chapter-5`, the JavaScript imports `houston-foreground.js`, and every modular production asset returns HTTP 200.

---

Plan execution is inline because current collaboration policy does not authorize implementation subagents. Use `superpowers:executing-plans` and stop at any failed verification checkpoint.
