# Bloomington Kirkwood Grade and Prop Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lower only Kirkwood to the exact sidewalk grade and resize Bloomington curb props to the avatar's responsive scale without moving Sample Gates.

**Architecture:** Build a deterministic `environment-02-v3.png` that shifts the pre-Kirkwood region upward 16 source pixels, then change the panel runtime offset from -70 to -54; this keeps Sample Gates fixed while moving Kirkwood down 16 pixels. Extend `propTransform` with an optional visual-size scale so Bloomington prop positions remain in world space while their dimensions match the avatar scale; existing callers retain the old default.

**Tech Stack:** Python 3, Pillow, NumPy, JavaScript ES modules, Canvas 2D, Node test runner, Python `unittest`, GitHub Pages

## Global Constraints

- Sample Gates effective offset remains -70 source pixels.
- Kirkwood effective offset becomes -54 source pixels.
- Kirkwood source y=719 baseline must meet sidewalk edge y=665.
- Avatar floor remains source y=735.
- Curbside prop baseline remains source y=765.
- Props expand around their horizontal centers and stay anchored at their bases.
- Houston behavior remains unchanged when no visual-size scale is supplied.
- Nick's endpoint remains source x=3812.
- The user-owned untracked `assets/.DS_Store` must not be staged or modified.

---

### Task 1: Build and verify the grade-corrected environment asset

**Files:**
- Create: `tools/build_bloomington_kirkwood_grade.py`
- Create: `assets/backgrounds/bloomington-proof/environment-02-v3.png`
- Modify: `tests/test_bloomington_proof_assets.py`

**Interfaces:**
- Consumes: `environment-02-v2.png` at 1906x825 RGBA
- Produces: `environment-02-v3.png` with split x=815 and a 16-pixel upward shift on x<815

- [ ] **Step 1: Write failing asset tests**

Update `ENVIRONMENT` to use `environment-02-v3.png`. Add a test that compares opaque bounds in the gate and Kirkwood regions:

```python
def opaque_bounds(image, box):
    alpha = np.asarray(image.getchannel("A"))
    left, top, right, bottom = box
    ys, xs = np.nonzero(alpha[top:bottom, left:right] > 0)
    return left + int(xs.min()), top + int(ys.min()), left + int(xs.max()), top + int(ys.max())

def test_grade_corrected_panel_preserves_gates_and_lowers_kirkwood(self):
    source = open_rgba("environment-02-v2.png")
    corrected = open_rgba("environment-02-v3.png")
    source_gates = opaque_bounds(source, (128, 0, 815, 825))
    fixed_gates = opaque_bounds(corrected, (128, 0, 815, 825))
    source_kirkwood = opaque_bounds(source, (815, 0, 1906, 825))
    fixed_kirkwood = opaque_bounds(corrected, (815, 0, 1906, 825))

    self.assertEqual(fixed_gates[1] - 54, source_gates[1] - 70)
    self.assertEqual(fixed_gates[3] - 54, source_gates[3] - 70)
    self.assertEqual(fixed_kirkwood, source_kirkwood)
    self.assertEqual(fixed_kirkwood[3] - 54, 665)
```

Update the Sample Gates test to inspect `environment-02-v3.png`.

- [ ] **Step 2: Run the asset tests and verify the missing-asset failure**

```bash
python3 -m unittest tests.test_bloomington_proof_assets -v
```

Expected: FAIL because `environment-02-v3.png` does not exist.

- [ ] **Step 3: Implement the deterministic builder**

Create a Pillow script with constants `SIZE = (1906, 825)`, `SPLIT_X = 815`, and `LEFT_SHIFT = 16`. It must validate source mode and size, create a transparent RGBA output, paste source `(0, 16, 815, 825)` at `(0, 0)`, paste source `(815, 0, 1906, 825)` at `(815, 0)`, and save the versioned output.

- [ ] **Step 4: Generate the asset and rerun the asset tests**

```bash
python3 tools/build_bloomington_kirkwood_grade.py
python3 -m unittest tests.test_bloomington_proof_assets -v
```

Expected: the script prints the v3 path and all Bloomington asset tests PASS.

- [ ] **Step 5: Commit the deterministic asset correction**

```bash
git add tools/build_bloomington_kirkwood_grade.py tests/test_bloomington_proof_assets.py assets/backgrounds/bloomington-proof/environment-02-v3.png
git commit -m "art: correct Bloomington Kirkwood grade"
```

### Task 2: Separate prop size from world position scale

**Files:**
- Modify: `tests/modular-foreground.test.js`
- Modify: `src/modular-foreground.js`

**Interfaces:**
- Consumes: `propTransform(prop, imageWidth, imageHeight, cameraX, worldScale, sceneY, visualScale?)`
- Produces: a transform whose center and ground anchor are preserved when `visualScale` differs from `worldScale`

- [ ] **Step 1: Write failing visual-scale tests**

Add:

```js
test("prop visual scale preserves its world center and ground anchor", () => {
  const transform = propTransform(
    { x: 2200, baseY: 180, groundY: 665, mirror: false },
    120, 200, 1900, 1.25, -40, 1.5,
  );
  const originalLeft = 2200 * 1.25 - 1900;
  const originalWidth = 120 * 1.25;
  assert.equal(transform.x + transform.width / 2, originalLeft + originalWidth / 2);
  assert.equal(transform.y + 180 * 1.5, -40 + 665 * 1.25);
  assert.equal(transform.width, 180);
  assert.equal(transform.height, 300);
});

test("prop transform rejects invalid visual scale", () => {
  assert.throws(
    () => propTransform({ x: 0, baseY: 0, groundY: 0 }, 1, 1, 0, 1, 0, 0),
    /visual scale/,
  );
});
```

Retain the existing default-scale test to prove Houston compatibility.

- [ ] **Step 2: Run the focused JavaScript test and verify failure**

```bash
node --test tests/modular-foreground.test.js
```

Expected: the new center/size assertions and invalid-scale assertion FAIL.

- [ ] **Step 3: Implement optional visual scale**

Change `propTransform` to default `visualScale = scale`, reject a non-finite or non-positive scale, calculate original and visual widths, subtract half their difference from x, and use `visualScale` for y base offset, width, and height.

- [ ] **Step 4: Run focused tests and verify pass**

```bash
node --test tests/modular-foreground.test.js
```

Expected: all modular foreground tests PASS.

- [ ] **Step 5: Commit the shared geometry change**

```bash
git add tests/modular-foreground.test.js src/modular-foreground.js
git commit -m "feat: support avatar-relative prop scale"
```

### Task 3: Integrate corrected art and prop scale into Bloomington

**Files:**
- Modify: `tests/test_bloomington_route_config.py`
- Modify: `src/bloomington-game.js`
- Modify: `bloomington.html`

**Interfaces:**
- Consumes: `environment-02-v3.png`, offset -54, and optional `visualScale`
- Produces: cache revision `bloomington-5`

- [ ] **Step 1: Write failing integration assertions**

Update route tests to require:

```python
self.assertIn("bloomington-game.js?v=bloomington-5", html)
self.assertIn('from "./modular-foreground.js?v=bloomington-5"', source)
self.assertIn("environment-02-v3.png?v=bloomington-5", source)
self.assertIn("offsetYs: [0, -54]", source)
self.assertIn("sceneY,\n      scale,", source)
```

Keep the existing foreground import, player reuse, paint order, and endpoint assertions.

- [ ] **Step 2: Run the route test and verify failure**

```bash
python3 -m unittest tests.test_bloomington_route_config -v
```

Expected: FAIL on the new asset, offset, visual-scale call, and cache revision.

- [ ] **Step 3: Integrate the corrected environment and avatar scale**

In `src/bloomington-game.js`, load `environment-02-v3.png?v=bloomington-5`, use `offsetYs: [0, -54]`, version the modular foreground import with `bloomington-5`, and pass the current avatar `scale` after `sceneY` in the Bloomington `propTransform` call.

In `bloomington.html`, version the game module with `bloomington-5`.

- [ ] **Step 4: Run route, geometry, and asset tests**

```bash
python3 -m unittest tests.test_bloomington_route_config tests.test_bloomington_proof_assets -v
node --test tests/modular-foreground.test.js tests/bloomington-foreground.test.js
```

Expected: all focused suites PASS.

- [ ] **Step 5: Commit the Bloomington integration**

```bash
git add tests/test_bloomington_route_config.py src/bloomington-game.js bloomington.html
git commit -m "fix: align Bloomington grade and prop scale"
```

### Task 4: Update the visual atlas and publish

**Files:**
- Modify: `tools/render_bloomington_proof_atlas.py`
- Generate only: `tmp/imagegen/bloomington-proof/proof-atlas.png`

**Interfaces:**
- Consumes: corrected environment asset and 1.5x prop visual scale
- Produces: review atlas and verified GitHub Pages deployment

- [ ] **Step 1: Update atlas composition**

Load `environment-02-v3.png` at y=-54. Set front prop baselines to y=765. Resize each prop to 1.5x with nearest-neighbor sampling, offset x by half the width increase, and anchor the resized `baseY` at the unchanged curb line.

- [ ] **Step 2: Generate and inspect the atlas**

```bash
python3 tools/render_bloomington_proof_atlas.py
```

Inspect Kelley, Sample Gates, Kirkwood grade, all six props, and Nick's. Reject moved gates, buried people/cars, floating or undersized props, changed endpoint, blur, or new seams.

- [ ] **Step 3: Run complete verification**

```bash
npm test
python3 -m unittest discover -s tests -p 'test_*.py' -v
git diff --check
git status --short
```

Expected: all tests PASS, diff check is clean, and status lists only the atlas tool change plus user-owned `assets/.DS_Store`.

- [ ] **Step 4: Commit the atlas update**

```bash
git add tools/render_bloomington_proof_atlas.py
git commit -m "chore: update Bloomington proof atlas"
```

- [ ] **Step 5: Verify portrait and landscape browser behavior**

At 390x844 and 844x390, walk through Kelley, Sample Gates, the transition boundary, Kirkwood, all curb props, and Nick's. Confirm Sample Gates do not move, Kirkwood meets the sidewalk, people and cars remain complete, props match avatar scale, the avatar passes behind them, jump remains smooth, and the console has no warnings or errors.

- [ ] **Step 6: Push and verify GitHub Pages**

```bash
git push origin main
```

Wait for the Pages build at the pushed commit to report `built`. Confirm the live HTML loads `bloomington-game.js?v=bloomington-5`, the live game loads `environment-02-v3.png?v=bloomington-5`, and the new asset returns HTTP 200.

Public review URL:

```text
https://dmarkel.github.io/dmarkel-website/bloomington.html?v=bloomington-5
```
