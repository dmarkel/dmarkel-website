# Bloomington Sample Gates Car and Planter Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the split car from the Sample Gates environment and lower the campus planter so the avatar passes naturally behind it.

**Architecture:** Preserve `environment-02-v3.png` as the immutable approved base. A small transparent patch replaces only the car box and a deterministic builder creates `environment-02-v4.png`; prop geometry gains a planter-only source-space ground offset. Bloomington cache keys advance to revision 6.

**Tech Stack:** Python 3, Pillow, NumPy, JavaScript ES modules, Node test runner, HTML Canvas.

## Global Constraints

- Keep the scene frame exactly 1906 × 825 pixels.
- Preserve binary alpha and every source pixel outside the bounded car replacement box.
- Keep Sample Gates, Kirkwood, Nick's English Hut, world endpoint, avatar, physics, and all non-planter prop coordinates unchanged.
- Preserve the planter's x coordinate, visual scale, and front draw order.

---

### Task 1: Add regression coverage

**Files:**
- Modify: `tests/test_bloomington_proof_assets.py`
- Modify: `tests/bloomington-foreground.test.js`
- Modify: `tests/test_bloomington_route_config.py`

**Interfaces:**
- Consumes: existing `open_rgba()`, `buildBloomingtonForeground()`, and route source checks.
- Produces: failing assertions for `environment-02-v4.png`, absence of car-colored pixels, planter `groundY === 789`, and revision 6 cache keys.

- [ ] **Step 1: Write failing asset and geometry tests**

Require the new asset name, assert that pixels outside `(670, 610, 890, 725)` match v3 exactly, assert the known car box has less than 2% car-magenta pixels, and assert only the planter uses `groundY: 789` while other curb props remain at 765.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test tests/bloomington-foreground.test.js && python3 -m unittest tests.test_bloomington_proof_assets tests.test_bloomington_route_config -v`

Expected: FAIL because v4, revision 6, and the planter offset do not exist.

### Task 2: Build the bounded car-free panel

**Files:**
- Create: `assets/backgrounds/bloomington-proof/environment-02-car-removal-patch.png`
- Create: `tools/build_bloomington_gates_car_removal.py`
- Create: `assets/backgrounds/bloomington-proof/environment-02-v4.png`

**Interfaces:**
- Consumes: `environment-02-v3.png` and a 220 × 115 transparent patch.
- Produces: `build(source_path=SOURCE, patch_path=PATCH, output_path=OUTPUT) -> Path` and a 1906 × 825 RGBA panel.

- [ ] **Step 1: Save the validated patch**

Persist the accepted car-free crop at `(670, 610, 890, 725)` with binary alpha.

- [ ] **Step 2: Implement the deterministic builder**

Validate source and patch geometry, clear only the patch box, alpha-composite the patch at `(670, 610)`, and save v4.

- [ ] **Step 3: Generate v4 and verify the asset tests pass**

Run: `python3 tools/build_bloomington_gates_car_removal.py && python3 -m unittest tests.test_bloomington_proof_assets -v`

Expected: PASS.

### Task 3: Lower only the planter and update the route

**Files:**
- Modify: `src/bloomington-foreground.js`
- Modify: `src/bloomington-game.js`
- Modify: `bloomington.html`

**Interfaces:**
- Consumes: optional `groundOffset` from a prop manifest entry.
- Produces: `groundProp()` values where `groundY = GROUND_PLANES[prop.plane] + (prop.groundOffset ?? 0)`.

- [ ] **Step 1: Add the planter offset**

Set `groundOffset: 24` only on `campus-planter` and incorporate the optional offset in `groundProp()`.

- [ ] **Step 2: Point the environment layer to v4 and advance cache keys**

Use `environment-02-v4.png?v=bloomington-6`, `bloomington-foreground.js?v=bloomington-6`, and `bloomington-game.js?v=bloomington-6`.

- [ ] **Step 3: Run focused tests and verify GREEN**

Run: `node --test tests/bloomington-foreground.test.js && python3 -m unittest tests.test_bloomington_route_config -v`

Expected: PASS.

### Task 4: Verify and publish

**Files:**
- Modify: `tools/render_bloomington_proof_atlas.py`

**Interfaces:**
- Consumes: v4 and the manifest-derived planter anchor.
- Produces: an updated visual QA atlas plus the deployed revision 6 site.

- [ ] **Step 1: Update and inspect the proof atlas**

Render the complete route and confirm there is no car at the Gates and the planter is grounded at the curb in front of the avatar.

- [ ] **Step 2: Run complete verification**

Run: `npm test`, `python3 -m unittest discover -s tests -p 'test_*.py' -v`, and `git diff --check`.

Expected: all tests pass with no diff errors.

- [ ] **Step 3: Browser QA**

Verify portrait traversal, landscape sizing, Sample Gates, planter occlusion, jumping, and Nick's endpoint with zero console warnings or errors.

- [ ] **Step 4: Commit and publish**

Commit only the scoped files, push `main`, wait for GitHub Pages to build the commit, and verify the cache-busted HTML, JavaScript, and v4 PNG return HTTP 200.

