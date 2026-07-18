# Lamar Environment Offset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move only the Lamar school environment panel down by 80 source pixels so its visible artwork closes the gap above the shared sidewalk on mobile and desktop.

**Architecture:** Extend the existing pure `layerPanelTransforms` geometry helper with optional per-panel source-space vertical offsets. Store `[80, 0]` on the environment layer, pass it into the helper, and increment the Houston module cache key so browsers receive the new geometry.

**Tech Stack:** Browser Canvas 2D, ES modules, Node.js built-in test runner, Python `unittest`, static GitHub Pages hosting.

## Global Constraints

- Apply the offset only to `assets/backgrounds/houston-proof/environment.png`.
- Use an exact offset of 80 source pixels multiplied by the current scene scale.
- Leave the second environment panel, far layer, modular foreground, sidewalk, avatar, physics, input, and controls unchanged.
- Missing panel offsets must default to zero.
- Inspect the Lamar-to-second-environment seam before publishing.

---

### Task 1: Per-panel environment geometry

**Files:**
- Modify: `tests/scene-geometry.test.js`
- Modify: `src/scene-geometry.js`

**Interfaces:**
- Consumes: `layerPanelTransforms(cameraX, viewportWidth, worldWidth, factor, panelWidth, panelHeight, panelCount, scale, groundLine, floorY, panelOffsetYs?)`
- Produces: panel transform objects whose `y` equals the shared baseline plus `(panelOffsetYs[index] ?? 0) * scale`

- [ ] **Step 1: Write the failing geometry test**

Add this test to `tests/scene-geometry.test.js`:

```js
test("panel transforms scale independent source-space vertical offsets", () => {
  const transforms = layerPanelTransforms(
    1000,
    390,
    7624,
    0.38,
    1906,
    825,
    2,
    1.25,
    735,
    754,
    [80, 0],
  );

  const sharedBaseline = 754 - 735 * 1.25;
  assert.equal(transforms[0].y, sharedBaseline + 100);
  assert.equal(transforms[1].y, sharedBaseline);
});
```

- [ ] **Step 2: Run the focused test and verify red**

Run: `node --test --test-name-pattern="panel transforms scale independent" tests/scene-geometry.test.js`

Expected: FAIL because the current helper ignores the eleventh `panelOffsetYs` argument and both panels use the shared baseline.

- [ ] **Step 3: Implement the optional offsets**

Change the signature and `y` calculation in `src/scene-geometry.js`:

```js
export function layerPanelTransforms(
  cameraX,
  viewportWidth,
  worldWidth,
  factor,
  panelWidth,
  panelHeight,
  panelCount,
  scale,
  groundLine,
  floorY,
  panelOffsetYs = [],
) {
  // Existing camera, size, and origin calculations remain unchanged.
  return Array.from({ length: panelCount }, (_, index) => ({
    x: originX + index * width,
    y: floorY - groundLine * scale + (panelOffsetYs[index] ?? 0) * scale,
    width,
    height,
    scaleX: scale,
    scaleY: scale,
  }));
}
```

- [ ] **Step 4: Run geometry tests and verify green**

Run: `node --test tests/scene-geometry.test.js`

Expected: all geometry tests PASS, including the pre-existing contiguous-panel test that omits offsets.

- [ ] **Step 5: Commit the geometry change**

```bash
git add tests/scene-geometry.test.js src/scene-geometry.js
git commit -m "fix: support per-panel environment offsets"
```

---

### Task 2: Lamar layer configuration and cache delivery

**Files:**
- Modify: `tests/test_houston_route_config.py`
- Modify: `src/houston-game.js`
- Modify: `src/houston-foreground.js`
- Modify: `houston.html`

**Interfaces:**
- Consumes: `layerPanelTransforms(..., panelOffsetYs)` from Task 1
- Produces: `CHAPTER_LAYERS.environment.panelOffsetYs` with the exact value `[80, 0]`; Houston ES-module graph with cache key `chapter-7`

- [ ] **Step 1: Write failing route configuration assertions**

Update `tests/test_houston_route_config.py` to expect chapter 7 in the HTML and module imports, and add:

```python
def test_only_lamar_environment_has_vertical_offset(self):
    source = (ROOT / "src/houston-game.js").read_text()
    self.assertIn("panelOffsetYs: [80, 0]", source)
    self.assertIn("layer.panelOffsetYs", source)
```

- [ ] **Step 2: Run route tests and verify red**

Run: `python3 tests/test_houston_route_config.py -v`

Expected: FAIL because the route still uses chapter 6 and has no `panelOffsetYs` metadata.

- [ ] **Step 3: Configure the environment offset**

In the `environment` entry of `CHAPTER_LAYERS` in `src/houston-game.js`, add:

```js
panelOffsetYs: [80, 0],
```

Pass the metadata as the final `layerPanelTransforms` argument:

```js
      world.floorY,
      layer.panelOffsetYs,
    );
```

- [ ] **Step 4: Increment the browser cache key**

Change every changed module edge from `chapter-6` to `chapter-7`:

```html
<script type="module" src="src/houston-game.js?v=chapter-7"></script>
```

```js
import { ASSETS, buildHoustonForeground } from "./houston-foreground.js?v=chapter-7";
import { groundTileTransforms, propTransform } from "./modular-foreground.js?v=chapter-7";
import { /* existing geometry imports */ } from "./scene-geometry.js?v=chapter-7";
```

In `src/houston-foreground.js`, change its modular-foreground import to `chapter-7` as well.

- [ ] **Step 5: Run route and full automated tests**

Run:

```bash
python3 tests/test_houston_route_config.py -v
npm test
python3 tests/test_connected_chroma.py -v
python3 tests/test_houston_modular_assets.py -v
python3 tests/test_houston_chapter_assets.py -v
node --check src/houston-game.js
git diff --check
```

Expected: all tests PASS, JavaScript syntax is valid, and `git diff --check` is silent.

- [ ] **Step 6: Commit the route configuration**

```bash
git add tests/test_houston_route_config.py src/houston-game.js src/houston-foreground.js houston.html
git commit -m "fix: lower Lamar environment panel"
```

---

### Task 3: Visual seam verification and deployment

**Files:**
- Verify: `houston.html`
- Verify: `assets/backgrounds/houston-proof/environment.png`
- Verify: `assets/backgrounds/houston-chapter/environment-02-v2.png`

**Interfaces:**
- Consumes: the chapter-7 Houston route from Task 2
- Produces: verified local rendering and the published GitHub Pages build on `main`

- [ ] **Step 1: Start the local static server**

Run: `python3 -m http.server 8000`

Expected: the server listens on `http://127.0.0.1:8000` without modifying project files.

- [ ] **Step 2: Inspect the four required route regions**

Open `http://127.0.0.1:8000/houston.html` and inspect at 390x844, then 844x390, then return to 390x844:

1. Lamar school: the lower edge of the school environment reaches behind the sidewalk with no visible gap or repeated strip.
2. Panel transition: no sky-colored or transparent vertical step is visible where the Lamar environment ends and the second environment begins.
3. Downtown: the modular sidewalk and avatar baseline remain unchanged.
4. Airport endpoint: the second environment still reaches the right edge and contains no floating road.

Expected: all four regions are coherent in both orientations; the avatar remains grounded; browser console contains no errors.

- [ ] **Step 3: Run the final verification gate**

Run:

```bash
npm test
python3 tests/test_connected_chroma.py -v
python3 tests/test_houston_modular_assets.py -v
python3 tests/test_houston_chapter_assets.py -v
python3 tests/test_houston_route_config.py -v
node --check src/houston-game.js
git diff --check
git status --short
```

Expected: every test passes; syntax and whitespace checks are clean; only the unrelated untracked `assets/.DS_Store` may remain.

- [ ] **Step 4: Push the verified main branch**

Run: `git push origin main`

Expected: GitHub accepts the new commits and GitHub Pages begins a new deployment.

- [ ] **Step 5: Confirm the published build**

Run: `gh api repos/dmarkel/dmarkel-website/pages/builds/latest`

Expected: the latest Pages build reports `status: built` for the pushed commit. Open the live URL with a commit-specific query string and repeat the portrait Lamar and panel-transition checks.
