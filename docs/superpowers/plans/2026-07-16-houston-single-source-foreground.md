# Houston Single-Source Foreground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the duplicate Lamar near-ground band and airport terminal hard edge by enforcing one visual source for each.

**Architecture:** The environment layer owns the Lamar school fence and airport terminal architecture. The modular foreground owns the sidewalk, middle street furniture, and airport chain fence. Regression tests enforce the ownership boundary.

**Tech Stack:** ES modules, Canvas 2D, Node test runner, Python unittest/Pillow, GitHub Pages.

## Global Constraints

- Do not change avatar sprites, player physics, input controls, or source ground line 735.
- Do not regenerate environment art unless removal of redundant modular elements fails visual QA.
- Preserve the unrelated untracked `assets/.DS_Store` file.

---

### Task 1: Enforce single-source foreground ownership

**Files:**
- Modify: `tests/houston-foreground.test.js`
- Modify: `src/houston-foreground.js`

**Interfaces:**
- Consumes: `FENCE_RUNS`, `PROPS`, and `buildHoustonForeground()`.
- Produces: a foreground manifest containing only the airport chain fence and no terminal prop.

- [ ] Add tests asserting `FENCE_RUNS` contains no `lamar`/iron run and `PROPS` contains no `terminal` asset.
- [ ] Run `node --test tests/houston-foreground.test.js` and confirm both assertions fail.
- [ ] Remove the Lamar fence run, terminal manifest entry, and terminal prop.
- [ ] Run the focused test and full `npm test` suite.
- [ ] Commit the manifest correction.

### Task 2: Bust stale mobile module caches

**Files:**
- Modify: `tests/test_houston_route_config.py`
- Modify: `houston.html`
- Modify: `src/houston-game.js`
- Modify: `src/houston-foreground.js`

**Interfaces:**
- Consumes: module URLs currently versioned `chapter-6`.
- Produces: consistent `chapter-7` HTML and module import URLs.

- [ ] Change route tests to require `chapter-7`.
- [ ] Run `python3 tests/test_houston_route_config.py -v` and confirm cache-version tests fail.
- [ ] Update HTML and changed imports to `chapter-7`.
- [ ] Run route tests and `node --check src/houston-game.js`.
- [ ] Commit cache wiring.

### Task 3: Visual and deployment verification

**Files:**
- Modify ignored QA helper: `tmp/imagegen/houston-modular/render-modular-atlas.py`
- Output ignored QA image: `tmp/imagegen/houston-modular/modular-atlas.png`

**Interfaces:**
- Consumes: production scene assets and manifest.
- Produces: eight-checkpoint visual evidence matching the browser composition.

- [ ] Update the atlas helper to omit the Lamar modular fence and terminal prop.
- [ ] Render and inspect Lamar, middle, airport transition, and endpoint checkpoints.
- [ ] Run all JavaScript, chroma, modular asset, chapter asset, route, syntax, and diff checks.
- [ ] Verify local portrait, landscape, and rotation-back browser layouts.
- [ ] Push `main`, wait for GitHub Pages to build, and verify the live page serves `chapter-7` with no console errors.

