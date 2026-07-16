# Houston Depth and Airport Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ground all street props correctly, eliminate visible sidewalk repetition and the sparse middle gap, remove floating airport roads, and expose the complete airport environment through the world endpoint.

**Architecture:** Add explicit back/walk planes to the foreground manifest, replace the short ground tile with a long seamless strip, add one continuous middle-verge asset, and replace the second environment panel with road-free art. Compute the environment parallax factor from layer and world extents so both narrative endpoints align without scaling the source panels.

**Tech Stack:** JavaScript ES modules, Canvas 2D, Node test runner, Python 3, Pillow, built-in image generation, PNG assets.

## Global Constraints

- Back plane is source y=665; walking plane is source y=735.
- Fences, terminal architecture, and middle verge use the back plane.
- Planter, bench, cabinet, bike rack, bollards, and lamps use the walking plane.
- Ground strip is 3812 × 160, fully opaque, and has identical first/last columns.
- Environment panels render at native uniform scale with no horizontal stretching.
- Airport environment contains no elevated freeway, floating road, airplane, balloons, or oversized left-edge object.
- Existing avatar animation, movement physics, input, `index.html`, and `src/game.js` remain unchanged.

---

### Task 1: Two Ground Planes and Endpoint-Aligned Geometry

**Files:**
- Modify: `tests/houston-foreground.test.js`
- Modify: `tests/scene-geometry.test.js`
- Modify: `src/houston-foreground.js`
- Modify: `src/scene-geometry.js`

**Interfaces:**
- Produces: `GROUND_PLANES = { back: 665, walk: 735 }`.
- Produces: `endpointAlignedFactor(layerWidth, viewportWidth, worldWidth) -> number`.
- Changes manifest props from raw `groundY` to `plane`; `buildHoustonForeground()` resolves `groundY`.

- [ ] **Step 1: Write failing manifest-plane tests**

Add assertions that fence and terminal props resolve to y=665; `planter`, `bench`, `cabinet`, `bike-rack`, `bollards`, and `street-lamp` resolve to y=735; and every raw `PROPS` entry declares `plane` without declaring `groundY`.

- [ ] **Step 2: Write failing endpoint-factor tests**

```javascript
test("endpoint factor exposes the complete layer without stretching", () => {
  assert.equal(endpointAlignedFactor(3812, 390, 7624), (3812 - 390) / (7624 - 390));
  assert.equal(endpointAlignedFactor(3812, 844, 7624), (3812 - 844) / (7624 - 844));
  assert.equal(endpointAlignedFactor(390, 390, 7624), 0);
});
```

- [ ] **Step 3: Run tests and verify RED**

Run: `node --test tests/houston-foreground.test.js tests/scene-geometry.test.js`
Expected: failures for missing planes and missing `endpointAlignedFactor` export.

- [ ] **Step 4: Implement the plane resolution and geometry helper**

Clamp `(layerWidth - viewportWidth) / (worldWidth - viewportWidth)` to 0..1. Replace raw prop/fence y values with `plane`; resolve `groundY` in `groundProp()` from `GROUND_PLANES[prop.plane]`.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `node --test tests/houston-foreground.test.js tests/scene-geometry.test.js`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/houston-foreground.js src/scene-geometry.js tests/houston-foreground.test.js tests/scene-geometry.test.js
git commit -m "fix: separate Houston foreground ground planes"
```

### Task 2: Long Seamless Ground Strip

**Files:**
- Modify: `tools/build_houston_ground_tile.py`
- Modify: `tests/test_houston_modular_assets.py`
- Create: `assets/backgrounds/houston-modular/ground-strip.png`
- Modify: `src/houston-foreground.js`

**Interfaces:**
- Consumes: the complete `(0, 665, 1906, 825)` ground crop from `foreground-02-v3.png`.
- Produces: `ground-strip.png`, 3812 × 160, opaque and seamless.

- [ ] **Step 1: Change the asset contract and verify RED**

Assert `ground-strip.png` exists at `(3812, 160)`, alpha extrema are `(255,255)`, and columns 0 and 3811 are pixel-identical. Run `python3 tests/test_houston_modular_assets.py -v`; expect a missing-file failure.

- [ ] **Step 2: Build the long strip**

Crop the full 1906-pixel ground section, paste it at x=0, paste its horizontal mirror at x=1906, force alpha to 255, and save `ground-strip.png`. Update `GROUND.path` and width to 3812.

- [ ] **Step 3: Run asset and manifest tests**

Run: `python3 tests/test_houston_modular_assets.py -v && node --test tests/houston-foreground.test.js tests/modular-foreground.test.js`
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add tools/build_houston_ground_tile.py tests/test_houston_modular_assets.py assets/backgrounds/houston-modular/ground-strip.png src/houston-foreground.js
git commit -m "art: replace repeating Houston sidewalk tile"
```

### Task 3: Continuous Middle Verge and Road-Free Airport Environment

**Files:**
- Create: `assets/backgrounds/houston-modular/middle-verge.png`
- Create: `assets/backgrounds/houston-chapter/environment-02-v2.png`
- Modify: `tests/test_houston_modular_assets.py`
- Modify: `tests/test_houston_chapter_assets.py`
- Modify: `src/houston-foreground.js`

**Interfaces:**
- Produces: one 1500-pixel-wide transparent middle verge grounded on its bottom edge.
- Produces: one 1906 × 825 road-free transparent-sky airport environment panel.

- [ ] **Step 1: Add failing image contracts**

Assert the verge is at least 1400 pixels wide, uses binary alpha, and has zero magenta-dominant visible pixels. Assert `environment-02-v2.png` is exactly 1906 × 825, has transparent sky in its top corners, useful alpha below y=350, and zero magenta contamination.

- [ ] **Step 2: Generate the middle verge source**

Use built-in image generation with the existing Houston art as style reference. Request one continuous restrained low landscaped strip on flat `#ff00ff`, no sidewalk, fence, highway, sign, purple flower, text, cast shadow, or large endpoint object. Remove the chroma key, force binary alpha, trim only vertical padding, and resize uniformly to 1500 pixels wide.

- [ ] **Step 3: Generate the road-free environment source**

Use the current `environment-02.png` as a style/composition reference. Request a 1906 × 825 Houston-to-IAH near environment with transparent-key sky, low commercial buildings transitioning to terminal architecture and landscaping, with no elevated road, overpass, floating access road, airplane, balloons, text, or large left-edge object. Chroma-extract and preserve the 1906 × 825 frame.

- [ ] **Step 4: Inspect both assets and run contracts**

Run: `python3 tests/test_houston_modular_assets.py -v && python3 tests/test_houston_chapter_assets.py -v`
Expected: all tests pass. Visually reject unsupported roads, purple remnants, clipped bases, or large endpoint objects.

- [ ] **Step 5: Add the verge to the manifest and commit**

Add `middle-verge` to `ASSETS` with its measured dimensions and back-plane base. Add one prop at x=3200. Commit assets, tests, and manifest with `art: rebuild Houston middle and airport depth`.

### Task 4: Route Integration and Cache Version

**Files:**
- Modify: `src/houston-game.js`
- Modify: `houston.html`
- Modify: `tests/test_houston_route_config.py`

**Interfaces:**
- Consumes: `endpointAlignedFactor()`, `environment-02-v2.png`, `ground-strip.png`, and manifest verge.
- Produces: chapter-6 Houston route.

- [ ] **Step 1: Add failing route assertions**

Assert the route loads `environment-02-v2.png`, does not load `environment-02.png`, imports `endpointAlignedFactor`, uses the endpoint-aligned factor for `environment`, and HTML references `houston-game.js?v=chapter-6`.

- [ ] **Step 2: Run route tests and verify RED**

Run: `python3 tests/test_houston_route_config.py -v`
Expected: the new asset, geometry, and chapter assertions fail.

- [ ] **Step 3: Integrate the new environment mapping**

Use `endpointAlignedFactor(ART.width * 2 * world.scale, viewport.width, world.width)` for the environment layer at draw time. Retain the far factor at 0.12. Update changed-module imports with `?v=chapter-6` and update HTML cache version.

- [ ] **Step 4: Run route and project tests**

Run: `python3 tests/test_houston_route_config.py -v && npm test && node --check src/houston-game.js && git diff --check`
Expected: every command exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/houston-game.js houston.html tests/test_houston_route_config.py
git commit -m "fix: extend Houston airport through endpoint"
```

### Task 5: Full-World Visual Verification and Publication

**Files:**
- Modify: `tmp/imagegen/houston-modular/render-modular-atlas.py`
- Verify unchanged: `index.html`, `src/game.js`

**Interfaces:**
- Consumes: complete chapter-6 route.
- Produces: visual evidence and live GitHub Pages deployment.

- [ ] **Step 1: Render the critical-position atlas**

Render 390 × 844 views centered at x=3200, 3812, 4700, 5718, 6250, 7000, 7400, and the endpoint. Reject floating props, repeated 400-pixel ground motifs, depth gaps, elevated roads, unsupported structures, clipped airport art, or endpoint blank space.

- [ ] **Step 2: Verify browser rotation and endpoint loading**

Test 390 × 844, 844 × 390, then 390 × 844. Confirm canvas/stage/document dimensions match, status is hidden, and console has zero current warnings/errors.

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

- [ ] **Step 4: Push and verify GitHub Pages**

Push `main`, wait for Pages status `built`, then verify the live route uses chapter 6, matches 390 × 844 without overflow, hides its loading status, and reports zero current warnings/errors.

---

Plan execution is inline because current collaboration policy does not authorize implementation subagents and the user approved direct work on `main`.
