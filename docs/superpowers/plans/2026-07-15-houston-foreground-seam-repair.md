# Houston Foreground Seam Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three defective Houston foreground panels with edge-safe versions that close the lower visual gap, resolve the freeway naturally, and remove the split foreground airplane.

**Architecture:** Keep the three-layer runtime and all geometry unchanged. Produce versioned replacement PNGs for foreground panels 02–04, validate their alpha and ground contracts, then switch only the isolated Houston review route to the repaired assets.

**Tech Stack:** PNG/RGBA assets, built-in image generation, Pillow asset tests, HTML Canvas, Node test runner, GitHub Pages.

## Global Constraints

- Every repaired panel remains exactly 1906 × 825 pixels.
- The source ground line remains y = 665 with a solid walkable sidewalk across every x-column.
- The avatar, movement, controls, camera, parallax factors, world width, and homepage remain unchanged.
- Project references use versioned repaired files; existing published assets are not overwritten during review.
- Major objects do not cross independently generated panel boundaries.

---

### Task 1: Add failing repaired-asset contracts

**Files:**
- Modify: `tests/test_houston_chapter_assets.py`

**Interfaces:**
- Consumes: Pillow `Image.open(path).convert("RGBA")`
- Produces: contracts for `foreground-02-v2.png`, `foreground-03-v2.png`, and `foreground-04-v2.png`

- [ ] **Step 1: Point the repaired foreground contract at versioned assets**

Define `REPAIRED_FOREGROUND` with the three `-v2.png` paths. Add tests that require 1906 × 825 dimensions, fully opaque ground pixels for every x-column from y = 665 through 824, at least 55% opaque coverage in the rear-edge band of panel 02 (`x=650..1199`, `y=610..664`), and less than 25% opaque coverage in the aircraft seam bands (`foreground-03-v2` right 48 columns and `foreground-04-v2` left 48 columns, `y=300..639`).

- [ ] **Step 2: Run the contract to verify RED**

Run: `python3 tests/test_houston_chapter_assets.py -v`

Expected: FAIL because the three versioned repaired files do not exist.

---

### Task 2: Create and validate repaired foreground artwork

**Files:**
- Create: `assets/backgrounds/houston-chapter/foreground-02-v2.png`
- Create: `assets/backgrounds/houston-chapter/foreground-03-v2.png`
- Create: `assets/backgrounds/houston-chapter/foreground-04-v2.png`
- Create: `tmp/imagegen/houston-seam-repair/*-keyed.png`

**Interfaces:**
- Consumes: existing keyed foreground panels as precise edit targets
- Produces: three transparent RGBA foreground panels satisfying Task 1

- [ ] **Step 1: Edit panel 02**

Preserve all approved objects and ground. Add a low restrained planting/curb treatment across the empty rear sidewalk band without blocking the avatar lane. Keep unused pixels flat `#ff00ff` for removal.

- [ ] **Step 2: Edit panel 03**

Remove the foreground airplane. Reconstruct the apron, fencing, and low landscaping behind it. Make the freeway ramp disappear behind fencing or vegetation rather than ending as an exposed slab. Keep both panel edges free of large crossing objects.

- [ ] **Step 3: Edit panel 04**

Remove the foreground airplane. Continue restrained apron/fence/service details from the left edge and preserve the terminal arrival endpoint. Keep the left edge free of large crossing objects.

- [ ] **Step 4: Remove chroma and verify GREEN**

Run the installed `remove_chroma_key.py` helper with explicit key `#ff00ff`, soft matte, despill, and one-pixel edge contraction for each panel. Run: `python3 tests/test_houston_chapter_assets.py -v`.

Expected: all asset tests PASS.

- [ ] **Step 5: Render the three 390 × 844 defect camera positions**

Render foreground boundaries/camera positions at x = 1786, 4902, and 5598 over the unchanged far/environment layers. Visually confirm no unfinished lower band, severed ramp, foreground plane, alpha fringe, ground break, or new blur.

- [ ] **Step 6: Commit the repaired assets**

Run: `git add tests/test_houston_chapter_assets.py assets/backgrounds/houston-chapter/foreground-02-v2.png assets/backgrounds/houston-chapter/foreground-03-v2.png assets/backgrounds/houston-chapter/foreground-04-v2.png && git commit -m "art: repair Houston foreground transitions"`

---

### Task 3: Switch, verify, and publish the isolated review route

**Files:**
- Modify: `src/houston-game.js`
- Modify: `houston.html`

**Interfaces:**
- Consumes: the three `-v2.png` assets from Task 2
- Produces: repaired `houston.html` GitHub Pages review route

- [ ] **Step 1: Add a failing route assertion**

Run: `rg -n "foreground-(02|03|04)-v2\\.png" src/houston-game.js`

Expected: no matches before the switch.

- [ ] **Step 2: Switch the three chapter paths and cache key**

Replace the foreground 02–04 paths with their versioned names and update the module query string in `houston.html` from `chapter-1` to `chapter-2`. Do not modify `index.html` or `src/game.js`.

- [ ] **Step 3: Run full verification**

Run: `npm test && python3 tests/test_houston_chapter_assets.py -v && node --check src/houston-game.js && git diff --check`.

Expected: all tests PASS and all commands exit 0.

- [ ] **Step 4: Verify responsive browser renders**

Check `houston.html` at 390 × 844 and 844 × 390, including rotation back to portrait and the three repaired camera regions. Confirm no console errors or body overflow.

- [ ] **Step 5: Commit and publish**

Run: `git add src/houston-game.js houston.html && git commit -m "fix: use repaired Houston foreground art" && git push origin main`.

Verify GitHub Pages reports the pushed commit as built, then verify the public mobile route. The homepage must remain unchanged.
