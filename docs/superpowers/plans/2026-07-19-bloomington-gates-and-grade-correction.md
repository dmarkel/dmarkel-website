# Bloomington Sample Gates and Street-Grade Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the oversized Kelley students, add complete Sample Gates between Kelley and Kirkwood, and raise the Kirkwood environment panel exactly 70 source pixels so its pedestrians and cars meet the visible street grade.

**Architecture:** Keep the existing two-panel world and add Sample Gates to a versioned edit of the second environment bitmap. Use the existing `panelOffsetYs` argument in `layerPanelTransforms` to draw environment panel 2 at `-70` source pixels while panel 1 remains at `0`; remove the unrelated `student-pair` manifest entry rather than resizing it.

**Tech Stack:** ES modules, Canvas 2D, Node's test runner, Python `unittest`, Pillow/NumPy asset validation, built-in image generation, GitHub Pages.

## Global Constraints

- Preserve the approved avatar, controls, far panels, pavement strip, Kelley panel, front-plane props, and Nick's endpoint at source x=3812.
- Preserve the three ordinary Kirkwood pedestrians and period cars; correct their shared grade instead of removing or editing them individually.
- Sample Gates must be complete within environment panel 2 and must not cross either panel edge.
- Use exact 1906×825 source geometry, crisp high-detail cartoon pixel art, binary alpha, and no visible magenta contamination.
- Do not add graduation activity, modern street-closure dining, current Kelley additions, or a third world panel.

---

### Task 1: Remove the Oversized Kelley Student Prop

**Files:**
- Modify: `tests/bloomington-foreground.test.js`
- Modify: `src/bloomington-foreground.js`

**Interfaces:**
- Consumes: `ASSETS`, `PROPS`, and `buildBloomingtonForeground()` from `src/bloomington-foreground.js`.
- Produces: a foreground manifest with no `student-pair` asset or `kelley-students` prop.

- [ ] **Step 1: Write the failing manifest test**

Replace the existing student assertion with:

```js
assert.ok(scene.backProps.every(({ assetId }) => assetId !== "student-pair"));
assert.ok(!Object.hasOwn(ASSETS, "student-pair"));
assert.ok(PROPS.every(({ id }) => id !== "kelley-students"));
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/bloomington-foreground.test.js`

Expected: FAIL because the manifest still exports and loads `student-pair`.

- [ ] **Step 3: Remove the production manifest entries**

Delete this asset entry:

```js
"student-pair": { path: revision("student-pair.png"), width: 150, height: 150, baseY: 149 },
```

Delete this prop entry:

```js
{ id: "kelley-students", assetId: "student-pair", x: 1280, plane: "back" },
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/bloomington-foreground.test.js`

Expected: all Bloomington foreground tests PASS.

- [ ] **Step 5: Commit the isolated manifest repair**

```bash
git add tests/bloomington-foreground.test.js src/bloomington-foreground.js
git commit -m "fix: remove oversized Bloomington students"
```

### Task 2: Correct the Kirkwood Environment Grade

**Files:**
- Modify: `tests/test_bloomington_route_config.py`
- Modify: `src/bloomington-game.js`

**Interfaces:**
- Consumes: `layerPanelTransforms(..., panelOffsetYs)` from `src/scene-geometry.js`.
- Produces: `CHAPTER_LAYERS.environment.offsetYs` equal to `[0, -70]`, passed unmodified to the transform helper.

- [ ] **Step 1: Write the failing route test**

Add:

```python
def test_kirkwood_environment_is_raised_to_the_visible_street_grade(self):
    source = (ROOT / "src/bloomington-game.js").read_text()
    self.assertIn("offsetYs: [0, -70]", source)
    self.assertIn("layer.offsetYs", source)
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `python3 -m unittest tests.test_bloomington_route_config.BloomingtonRouteConfigTests.test_kirkwood_environment_is_raised_to_the_visible_street_grade`

Expected: FAIL because no environment offsets are configured or forwarded.

- [ ] **Step 3: Add and forward the per-panel offsets**

Add to the environment layer:

```js
offsetYs: [0, -70],
```

Pass the offsets as the final transform argument:

```js
const transforms = layerPanelTransforms(
  cameraX,
  viewport.width,
  world.width,
  factor,
  ART.width,
  ART.height,
  layer.paths.length,
  world.scale,
  ART.groundLine,
  world.floorY,
  layer.offsetYs,
);
```

- [ ] **Step 4: Run route and geometry tests and verify GREEN**

Run: `python3 -m unittest tests.test_bloomington_route_config && node --test tests/scene-geometry.test.js`

Expected: both suites PASS and panel 1 retains source offset `0`.

- [ ] **Step 5: Commit the grade correction**

```bash
git add tests/test_bloomington_route_config.py src/bloomington-game.js
git commit -m "fix: align Kirkwood environment grade"
```

### Task 3: Add Complete Sample Gates to the Kirkwood Panel

**Files:**
- Create: `tmp/references/bloomington/sample-gates.jpg` (ignored historical reference)
- Create: `tmp/imagegen/bloomington-proof/environment-02-v2-source.png` (ignored generated source)
- Create: `assets/backgrounds/bloomington-proof/environment-02-v2.png`
- Modify: `tests/test_bloomington_proof_assets.py`
- Modify: `tmp/references/bloomington/SOURCES.md` (ignored reference log)

**Interfaces:**
- Consumes: `tmp/imagegen/bloomington-proof/environment-02-source.png`, the Sample Gates reference, `tools/normalize_scene_asset.py`, and the approved environment panel geometry.
- Produces: `environment-02-v2.png`, exact 1906×825 RGBA with complete gates between x=260 and x=900 and preserved Kirkwood/Nick's content.

- [ ] **Step 1: Save a licensed Sample Gates reference**

Download one full frontal or shallow-angle image from the Wikimedia Commons Sample Gates category into `tmp/references/bloomington/sample-gates.jpg`. Record its direct description-page URL and license in `tmp/references/bloomington/SOURCES.md`.

- [ ] **Step 2: Write failing asset-contract tests**

Update `ENVIRONMENT` to use `environment-02-v2.png`. Add a test that asserts a substantial limestone-and-dark-iron landmark occupancy inside `pixels[390:735, 260:900]`, while `pixels[:500, :128, 3]` retains less than 5% visible coverage. Keep the existing geometry, magenta-contamination, and endpoint checks.

- [ ] **Step 3: Run the asset test and verify RED**

Run: `python3 -m unittest tests.test_bloomington_proof_assets`

Expected: FAIL because `environment-02-v2.png` does not exist.

- [ ] **Step 4: Generate the versioned panel edit**

Use the built-in image editor with the current second-panel source as edit target and the Sample Gates photo as architectural reference. Use this production prompt:

```text
Use case: precise-object-edit.
Asset type: transparent-key environment parallax panel for a high-detail cartoon pixel-art side scroller.
Image 1 is the edit target and controls the exact 1906×825 composition, spring 2007 palette, pixel density, Kirkwood storefronts, three ordinary pedestrians, period cars, and complete Nick's English Hut right endpoint. Image 2 is the architectural reference for Indiana University's Sample Gates.
Add the complete Sample Gates only within x=260 through x=900: both limestone pylons, the full iron arch, and the open campus entrance. Keep their authored ground baseline at y=735 so the game-level -70 source offset aligns them to the visible background street grade. Preserve the current pedestrians, cars, storefronts, and Nick's exactly as closely as possible. Keep the leftmost 128 pixels free of large upper objects and keep the full Nick's right architectural frame at x=1906.
Background outside subjects must remain perfectly flat #ff00ff. No avatar, oversized foreground students, graduation activity, modern dining, cropped gate, split landmark, new people, new vehicles, watermark, blur, or photorealism.
```

- [ ] **Step 5: Normalize without stretching**

Run:

```bash
python3 tools/normalize_scene_asset.py \
  --input tmp/imagegen/bloomington-proof/environment-02-v2-source.png \
  --out assets/backgrounds/bloomington-proof/environment-02-v2.png \
  --width 1906 --height 825 --key-color ff00ff --tolerance 70 \
  --binary-alpha --transparent-border 0 --align-visible-right --force
```

- [ ] **Step 6: Inspect the cleaned asset and verify GREEN**

Run: `python3 -m unittest tests.test_bloomington_proof_assets`

Expected: all asset tests PASS. Visually confirm complete gates, preserved pedestrians/cars, clean left seam, and complete Nick's endpoint.

- [ ] **Step 7: Commit the approved versioned artwork**

```bash
git add assets/backgrounds/bloomington-proof/environment-02-v2.png tests/test_bloomington_proof_assets.py
git commit -m "art: add Bloomington Sample Gates panel"
```

### Task 4: Wire, Preview, and Publish the Corrected Route

**Files:**
- Modify: `tests/test_bloomington_route_config.py`
- Modify: `src/bloomington-game.js`
- Modify: `bloomington.html`
- Modify: `tools/render_bloomington_proof_atlas.py`

**Interfaces:**
- Consumes: `environment-02-v2.png`, environment offsets `[0, -70]`, and the unchanged world endpoint.
- Produces: a cache-busted Bloomington page and source-resolution QA atlas using the corrected panel.

- [ ] **Step 1: Write the failing versioned-route assertions**

Require `environment-02-v2.png?v=bloomington-3`, reject `environment-02.png`, and require `bloomington-game.js?v=bloomington-3` in the public HTML.

- [ ] **Step 2: Run the route test and verify RED**

Run: `python3 -m unittest tests.test_bloomington_route_config`

Expected: FAIL on the old panel and cache keys.

- [ ] **Step 3: Wire the versioned asset and cache keys**

Update the second environment path to:

```js
"assets/backgrounds/bloomington-proof/environment-02-v2.png?v=bloomington-3"
```

Update the HTML module URL to `src/bloomington-game.js?v=bloomington-3` and the atlas renderer to load `environment-02-v2.png` with a source-space y offset of `-70`.

- [ ] **Step 4: Verify all automated checks**

Run:

```bash
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
python3 tools/render_bloomington_proof_atlas.py
node --check src/bloomington-game.js
git diff --check
```

Expected: all JavaScript and Python tests PASS, the atlas renders, syntax check exits 0, and the diff check is clean.

- [ ] **Step 5: Verify the actual game in a browser**

Inspect desktop 1440×900, mobile portrait 390×844, and mobile landscape 844×390. Check Kelley without oversized students, complete Sample Gates, Kirkwood pedestrians with visible legs, cars meeting the background street grade, Nick's complete right edge, avatar grounding, one-hand jump, and zero browser warnings/errors.

- [ ] **Step 6: Commit and publish**

```bash
git add bloomington.html src/bloomington-game.js tests/test_bloomington_route_config.py tools/render_bloomington_proof_atlas.py
git commit -m "feat: complete Bloomington Kelley to Kirkwood proof"
git push origin main
```

- [ ] **Step 7: Confirm GitHub Pages**

Wait for the Pages build for the pushed commit to report `built`. Verify the public HTML and `environment-02-v2.png` both return HTTP 200, then provide the cache-busted public review URL.
