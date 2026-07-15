# Houston Edge-Safe Foreground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cut-tree boundary, oversized foreground freeway, and semitransparent balloons with edge-safe, physically coherent foreground artwork.

**Architecture:** Create versioned Houston-only foreground panels 01, 03, and 04 plus a jointly authored seam patch for panels 01/02. Keep the runtime geometry and the approved proof route unchanged, then switch only `houston.html` after asset and mobile seam validation.

**Tech Stack:** Built-in image generation, PNG/RGBA, Pillow tests, HTML Canvas, Node test runner, GitHub Pages.

## Global Constraints

- Panels remain exactly 1906 × 825 with solid ground from y = 665 through 824.
- The first seam reserves 96 pixels on both sides for only low repeatable textures.
- No foreground freeway or balloon decoration remains.
- Avatar, controls, camera, parallax factors, far/environment layers, proof route, and homepage remain unchanged.

---

### Task 1: Add failing edge-safe asset contracts

**Files:**
- Modify: `tests/test_houston_chapter_assets.py`

**Interfaces:**
- Consumes: versioned `foreground-01-v3.png`, `foreground-02-v3.png`, `foreground-03-v3.png`, `foreground-04-v3.png`
- Produces: dimension, ground, edge-zone, freeway-removal, and opaque-terminal regression checks

- [ ] Define the four v3 paths and require exact dimensions and fully opaque ground.
- [ ] Require less than 25% opaque coverage in both first-seam edge zones above y = 610.
- [ ] Require panel 03 to have less than 18% opaque coverage in the former freeway mass box `(850, 280, 1500, 590)`.
- [ ] Require panel 04 to have no partial-alpha decorative mass in the former balloon box `(1600, 320, 1835, 665)` by keeping partially transparent pixels under 2%.
- [ ] Run `python3 tests/test_houston_chapter_assets.py -v`; expect failure because v3 assets do not exist.

### Task 2: Produce the edge-safe panels

**Files:**
- Create: `assets/backgrounds/houston-chapter/foreground-01-v3.png`
- Create: `assets/backgrounds/houston-chapter/foreground-02-v3.png`
- Create: `assets/backgrounds/houston-chapter/foreground-03-v3.png`
- Create: `assets/backgrounds/houston-chapter/foreground-04-v3.png`

**Interfaces:**
- Consumes: current foreground panels as edit targets
- Produces: four RGBA panels satisfying Task 1

- [ ] Build a seam-centered first-boundary source from panel 01 right half and panel 02 left half.
- [ ] Re-author the center as continuous sidewalk, low fence, and low planting with no tree or pole crossing the seam; split it back into versioned panels 01 and 02.
- [ ] Remove the entire elevated freeway from panel 03 and reconstruct low airport fencing/service-road scenery.
- [ ] Remove the balloons from panel 04 and reconstruct a clean opaque terminal entrance with planters and bollards.
- [ ] Chroma-remove, seal tiny ground-edge alpha holes, run the asset test, and expect all tests to pass.
- [ ] Render a 390 × 844 seam atlas at the three reported camera positions and reject any vertical cut, floating object, partial-alpha decoration, blur, or ground break.
- [ ] Commit with `git commit -m "art: enforce edge-safe Houston foregrounds"`.

### Task 3: Switch and publish the isolated route

**Files:**
- Modify: `src/houston-game.js`
- Modify: `houston.html`

**Interfaces:**
- Consumes: four v3 foreground assets
- Produces: corrected public Houston review route

- [ ] Verify `src/houston-game.js` has no v3 references before editing.
- [ ] Switch the four foreground paths to v3 and update the module cache key to `chapter-3`.
- [ ] Run `npm test`, the Python asset tests, `node --check src/houston-game.js`, and `git diff --check`.
- [ ] Verify portrait, landscape, rotation, no overflow, and no console errors locally.
- [ ] Commit with `git commit -m "fix: use edge-safe Houston foregrounds"`, push main, verify the Pages commit, and verify the public mobile route.
