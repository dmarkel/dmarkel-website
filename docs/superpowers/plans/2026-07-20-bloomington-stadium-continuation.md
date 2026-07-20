# Bloomington Stadium Continuation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved Bloomington proof from Nick's English Hut through the remaining spring 2007 Kirkwood corridor to a Memorial Stadium graduation endpoint.

**Architecture:** Append two independently authored 1906 × 825 environment panels to the existing two-panel route. Panel 03 contains complete Kirkwood landmarks and ends in an edge-safe tree-lined buffer; panel 04 contains the complete stadium and graduation activity, with its visible right edge defining the world endpoint. The existing far panorama remains unchanged at 12% parallax, while a new 7624 × 160 ground strip preserves the approved first half and supplies continuous Kirkwood and stadium-plaza surfaces for the extension.

**Tech Stack:** Built-in image generation, Python 3, Pillow, NumPy, JavaScript ES modules, HTML Canvas, Node test runner.

## Global Constraints

- Preserve the current Kelley, Sample Gates, Nick's, avatar, animation, controls, camera, and existing foreground props exactly.
- Keep every environment panel at 1906 × 825 with binary alpha and a common visible grade at source y = 719 before the runtime offset of -54.
- Reserve at least 128 source pixels around the panel 03/04 boundary for open sky, path, low landscaping, or small repeatable detail.
- Do not split a storefront, sign, awning, vehicle, large tree, stadium structure, or graduation group across a panel boundary.
- Keep graduation activity inside the Memorial Stadium panel only.
- Keep the avatar walking line at y = 735 and preserve the approved front/back prop paint order.
- End the world at the complete stadium's visible right architectural edge with no empty travel tail.

---

### Task 1: Add full-route regression contracts

**Files:**
- Modify: `tests/test_bloomington_proof_assets.py`
- Modify: `tests/test_bloomington_route_config.py`
- Modify: `tests/bloomington-foreground.test.js`

**Interfaces:**
- Consumes: `open_rgba(name)`, `buildBloomingtonForeground()`, `CHAPTER_LAYERS`, and `LANDMARKS`.
- Produces: failing tests for environment panels 03/04, the 7624-pixel ground, four environment paths, four offset values, stadium endpoint geometry, and revision 7 cache keys.

- [ ] **Step 1: Write failing asset tests**

Require `environment-03.png` and `environment-04.png` at 1906 × 825, binary alpha, no magenta contamination, visible bottom y = 719, and low upper-edge density in each 128-pixel seam-safe zone. Require `ground-strip-v2.png` at 7624 × 160, full opacity, the first 3812 pixels byte-identical to the approved strip, clean top pavement, and one diagonal joint direction.

- [ ] **Step 2: Write failing route and endpoint tests**

Require four environment paths with `offsetYs: [0, -54, -54, -54]`, `bloomington-7`, and `LANDMARKS.stadium.x + LANDMARKS.stadium.width === buildBloomingtonForeground().endSourceX` where the endpoint is no greater than 7624.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `node --test tests/bloomington-foreground.test.js`

Run: `python3 -m unittest tests.test_bloomington_proof_assets tests.test_bloomington_route_config -v`

Expected: FAIL because the continuation assets, stadium endpoint, and revision 7 do not exist.

### Task 2: Generate and normalize the two continuation panels

**Files:**
- Create: `assets/backgrounds/bloomington-proof/environment-03.png`
- Create: `assets/backgrounds/bloomington-proof/environment-04.png`
- Create: `tools/align_bloomington_environment.py`

**Interfaces:**
- Consumes: image-generation outputs plus `normalize_keyed()` from `tools.normalize_scene_asset`.
- Produces: `align_environment(image, target_bottom=719, align_right=False) -> Image.Image` with exact geometry and binary alpha.

- [ ] **Step 1: Generate panel 03 with the built-in image tool**

Use `environment-02-v4.png` as a style reference. Generate a new high-detail cartoon pixel-art panel on flat `#ff00ff`: complete period-appropriate Kilroy's, Buskirk-Chumley, The Upstairs Pub/Dunnkirk Square, supporting shops, ordinary spring pedestrians and 2007 vehicles; no graduation; no avatar; all major landmarks complete; the final 128 pixels contain only open sky, low landscaping, and path.

- [ ] **Step 2: Generate panel 04 with the built-in image tool**

Use panel 03 and `environment-02-v4.png` as style references. Generate a new high-detail cartoon pixel-art Memorial Stadium arrival on flat `#ff00ff`: complete stadium architecture, crimson commencement banners, graduates in black caps and gowns, families, cameras, flowers, and restrained ceremony organization behind an open walking lane; no football or tailgating; the first 128 pixels are seam-safe; the complete stadium right edge terminates at the image endpoint.

- [ ] **Step 3: Normalize and align both panels**

Implement `align_environment()` by calling `normalize_keyed(image, (1906, 825), (255, 0, 255), 55)`, shifting the visible alpha bounds vertically so their bottom equals 720 exclusive, and applying `align_visible_right()` only to panel 04. Save both production assets with binary alpha.

- [ ] **Step 4: Run asset tests and verify GREEN**

Run: `python3 -m unittest tests.test_bloomington_proof_assets -v`

Expected: the new panel geometry, alpha, grade, seam, and landmark-presence checks pass.

### Task 3: Build the continuous full-route ground

**Files:**
- Create: `tools/build_bloomington_full_ground.py`
- Create: `assets/backgrounds/bloomington-proof/ground-strip-v2.png`

**Interfaces:**
- Consumes: approved `ground-strip.png` at 3812 × 160.
- Produces: `build(source_path=SOURCE, output_path=OUTPUT) -> Path` and a 7624 × 160 opaque ground strip.

- [ ] **Step 1: Implement deterministic continuation surfaces**

Copy the approved first 3812 pixels unchanged. Build panel 03 from an offset crop of the approved Kirkwood surface so joints retain their downward-right perspective without an immediate repeated seam. Build panel 04 as a warmer stadium plaza variant with the same top edge, curb height, road band, joint slope, and seeded pixel texture; transition colors over 192 source pixels before the stadium panel boundary.

- [ ] **Step 2: Generate and test the strip**

Run: `python3 tools/build_bloomington_full_ground.py`

Run: `python3 -m unittest tests.test_bloomington_proof_assets -v`

Expected: the ground is 7624 × 160, fully opaque, preserves its first half, has clean pavement at the top edge, and uses only the approved joint direction.

### Task 4: Extend the route and endpoint

**Files:**
- Modify: `src/bloomington-foreground.js`
- Modify: `src/bloomington-game.js`
- Modify: `bloomington.html`

**Interfaces:**
- Consumes: four environment panels, `ground-strip-v2.png`, and the stadium alpha bounds.
- Produces: a 7624-source-pixel maximum route whose endpoint is `LANDMARKS.stadium.x + LANDMARKS.stadium.width`.

- [ ] **Step 1: Extend the foreground manifest**

Set `GROUND.path` to revisioned `ground-strip-v2.png`, `GROUND.width` to 7624, preserve all existing props, and add `LANDMARKS.stadium` using the panel-04 visible right edge in full-world coordinates. Derive `endSourceX` from stadium rather than Nick's.

- [ ] **Step 2: Extend runtime layers and copy**

Append environment panels 03 and 04, set `offsetYs: [0, -54, -54, -54]`, retain the two existing far panels, update the masthead to `Bloomington · 2007 chapter` and `Kelley to Memorial Stadium.`, and advance all changed Bloomington module/image URLs to `bloomington-7`.

- [ ] **Step 3: Run focused route tests and verify GREEN**

Run: `node --test tests/bloomington-foreground.test.js tests/scene-geometry.test.js`

Run: `python3 -m unittest tests.test_bloomington_route_config -v`

Expected: the four-panel route, unchanged far panorama, 7624 ground, stadium-derived endpoint, and revision 7 checks pass.

### Task 5: Full-scene atlas, browser QA, and publication

**Files:**
- Modify: `tools/render_bloomington_proof_atlas.py`

**Interfaces:**
- Consumes: all four environment panels, the full ground strip, current props, and stadium endpoint.
- Produces: a full-route atlas and the deployed revision 7 chapter.

- [ ] **Step 1: Expand the atlas**

Add checkpoints for the Nick's departure, panel 03 landmarks, the panel 03/04 seam, stadium graduation, and the exact endpoint. Render every checkpoint with the avatar and current depth order.

- [ ] **Step 2: Inspect and correct only bounded defects**

Reject any stretched landmark, magenta fringe, transparent gap, floating object, buried person or vehicle, mismatched ground line, unsafe seam object, stadium crop, or empty endpoint tail. Apply only bounded image or manifest corrections and rerun the relevant regression test.

- [ ] **Step 3: Run complete verification**

Run: `npm test`

Run: `python3 -m unittest discover -s tests -p 'test_*.py' -v`

Run: `git diff --check`

Expected: all tests pass with no diff errors.

- [ ] **Step 4: Browser QA**

At 390 × 844, walk the complete route through every landmark and endpoint. At 844 × 390, verify loading, movement, and jumping; rotate back to portrait and verify the stage remains flush. Confirm zero console warnings or errors.

- [ ] **Step 5: Commit and publish**

Commit only scoped files, push `main`, wait for GitHub Pages to build the exact commit, and verify the revision 7 HTML, JavaScript, ground, environment-03, and environment-04 resources return HTTP 200 and match local files.

