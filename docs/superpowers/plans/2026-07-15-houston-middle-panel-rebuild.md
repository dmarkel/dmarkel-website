# Houston Middle Panel Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sparse, damaged Houston middle foreground with a dense grounded streetscape, preserve legitimate plant colors during alpha extraction, and align the avatar's feet to the sidewalk walking surface.

**Architecture:** Author a versioned `foreground-03-v4.png` from a new keyed source, then extract its transparency with a project-local border-connected chroma algorithm instead of global magenta dominance. Keep the visual floor configuration in `src/houston-game.js`, switch only the Houston review route to the new asset, and protect the result with synthetic matte tests plus scene-specific image contracts.

**Tech Stack:** JavaScript ES modules, Node test runner, Python 3, Pillow, HTML canvas, PNG assets, built-in image generation.

## Global Constraints

- The rebuilt panel is exactly 1906 × 825 pixels.
- The walking line is source line 735.
- Source lines 665 through 824 contain fully opaque continuous ground.
- The outer 96 source pixels contain only low repeatable scenery.
- No elevated highway, overhead sign, balloons, airplane, people, text, or large seam-crossing object.
- Homepage files `index.html` and `src/game.js` remain unchanged.

---

### Task 1: Border-Connected Chroma Extraction

**Files:**
- Create: `tools/extract_connected_chroma.py`
- Create: `tests/test_connected_chroma.py`

**Interfaces:**
- Consumes: an RGB/RGBA keyed PNG, `#rrggbb` key color, and integer key tolerance.
- Produces: `extract_connected_chroma(image: Image.Image, key: tuple[int, int, int], tolerance: int) -> Image.Image` and a CLI that writes an RGBA PNG.

- [ ] **Step 1: Write the failing synthetic matte tests**

```python
def test_border_background_is_removed_but_enclosed_key_color_survives():
    image = Image.new("RGB", (20, 20), "#ff00ff")
    draw = ImageDraw.Draw(image)
    draw.rectangle((5, 5, 14, 14), fill="#375461")
    draw.rectangle((8, 8, 11, 11), fill="#f10aee")
    result = extract_connected_chroma(image, (255, 0, 255), 35)
    assert result.getpixel((0, 0))[3] == 0
    assert result.getpixel((9, 9))[3] == 255


def test_opaque_ground_remains_opaque():
    image = Image.new("RGB", (20, 20), "#ff00ff")
    ImageDraw.Draw(image).rectangle((0, 14, 19, 19), fill="#9d8e75")
    result = extract_connected_chroma(image, (255, 0, 255), 35)
    assert all(result.getpixel((x, y))[3] == 255 for x in range(20) for y in range(14, 20))
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `python3 tests/test_connected_chroma.py -v`

Expected: import failure because `tools.extract_connected_chroma` does not exist.

- [ ] **Step 3: Implement the minimal connected extraction**

```python
def extract_connected_chroma(image, key, tolerance):
    rgba = image.convert("RGBA")
    background = flood_border_pixels(
        rgba,
        lambda rgb: max(abs(rgb[i] - key[i]) for i in range(3)) <= tolerance,
    )
    for x, y in background:
        rgba.putpixel((x, y), (0, 0, 0, 0))
    return rgba
```

Use eight-neighbor flood fill so keyed background remains connected through thin fence openings. Parse `--input`, `--out`, `--key-color`, `--tolerance`, and `--force`; refuse to overwrite without `--force`.

- [ ] **Step 4: Run the matte tests and verify GREEN**

Run: `python3 tests/test_connected_chroma.py -v`

Expected: 2 tests pass.

- [ ] **Step 5: Commit the extractor**

```bash
git add tools/extract_connected_chroma.py tests/test_connected_chroma.py
git commit -m "feat: preserve foreground colors during chroma extraction"
```

### Task 2: Middle Foreground Asset Contract

**Files:**
- Modify: `tests/test_houston_chapter_assets.py`
- Create during Task 3: `assets/backgrounds/houston-chapter/foreground-03-v4.png`

**Interfaces:**
- Consumes: final RGBA middle panel.
- Produces: regression checks for dimensions, ground, density, transparency, overhead-sign removal, and seam safety.

- [ ] **Step 1: Add failing v4 image contracts**

```python
MIDDLE_REBUILD = CHAPTER / "foreground-03-v4.png"

def test_middle_rebuild_has_approved_frame(self):
    with Image.open(MIDDLE_REBUILD) as image:
        self.assertEqual(image.size, (1906, 825))

def test_middle_rebuild_has_solid_walkable_ground(self):
    image = Image.open(MIDDLE_REBUILD).convert("RGBA")
    self.assertTrue(all(image.getpixel((x, y))[3] > 240 for x in range(1906) for y in range(665, 825)))

def test_middle_rebuild_has_no_overhead_sign(self):
    image = Image.open(MIDDLE_REBUILD).convert("RGBA")
    self.assertLess(opaque_ratio(image, (350, 120, 1100, 360)), 0.04)

def test_middle_rebuild_has_no_empty_center_runs(self):
    image = Image.open(MIDDLE_REBUILD).convert("RGBA")
    for left in range(96, 1810, 160):
        self.assertGreater(opaque_ratio(image, (left, 500, min(left + 160, 1810), 665)), 0.12)

def test_middle_rebuild_limits_partial_alpha_damage(self):
    alpha = Image.open(MIDDLE_REBUILD).convert("RGBA").crop((96, 500, 1810, 665)).getchannel("A")
    visible = [value for value in alpha.getdata() if value > 0]
    self.assertLess(sum(value < 255 for value in visible) / len(visible), 0.03)
```

- [ ] **Step 2: Run the asset suite and verify RED**

Run: `python3 tests/test_houston_chapter_assets.py -v`

Expected: the new tests fail because `foreground-03-v4.png` does not exist.

### Task 3: Author and Extract the Middle Panel

**Files:**
- Create: `tmp/imagegen/houston-middle-v4/foreground-03-v4-keyed.png`
- Create: `assets/backgrounds/houston-chapter/foreground-03-v4.png`
- Modify if necessary: `tests/test_houston_chapter_assets.py`

**Interfaces:**
- Consumes: `tmp/imagegen/houston-edge-safe/foreground-03-v3-keyed.png` as the edit target and the visual constraints from the approved spec.
- Produces: the final versioned RGBA middle foreground.

- [ ] **Step 1: Generate one rebuilt keyed panel**

Use the built-in image editor with the existing keyed panel as the edit target. Require a dense ground-level Houston streetscape with continuous sidewalk, low black fencing, low planters, grounded utility cabinets, a bench or bike rack, and restrained airport-perimeter details. Remove the entire overhead sign and leave both 96-pixel edge zones low and repeatable. Keep the background flat `#ff00ff` and ground fully opaque from y=665 through y=824.

- [ ] **Step 2: Inspect the keyed result**

Reject the result if any prop lacks a visible ground connection, a large empty run remains, a tall object touches an edge zone, or the output is not 1906 × 825.

- [ ] **Step 3: Extract the connected background**

Run:

```bash
python3 tools/extract_connected_chroma.py \
  --input tmp/imagegen/houston-middle-v4/foreground-03-v4-keyed.png \
  --out assets/backgrounds/houston-chapter/foreground-03-v4.png \
  --key-color '#ff00ff' \
  --tolerance 35 \
  --force
```

- [ ] **Step 4: Run the asset suite and verify GREEN**

Run: `python3 tests/test_houston_chapter_assets.py -v`

Expected: all Houston asset tests pass. If the generated art violates a contract, edit the art rather than weakening the stated requirement.

- [ ] **Step 5: Commit the middle panel**

```bash
git add tests/test_houston_chapter_assets.py assets/backgrounds/houston-chapter/foreground-03-v4.png
git commit -m "art: rebuild grounded Houston middle foreground"
```

### Task 4: Lower the Houston Walking Line and Switch the Route

**Files:**
- Modify: `src/houston-game.js`
- Modify: `houston.html`
- Create: `tests/test_houston_route_config.py`

**Interfaces:**
- Consumes: `foreground-03-v4.png` and source walking line `735`.
- Produces: a Houston-only route using the rebuilt asset and lower visual floor.

- [ ] **Step 1: Write the failing route configuration test**

```python
class HoustonRouteConfigTests(unittest.TestCase):
    def test_route_uses_rebuilt_middle_panel(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("foreground-03-v4.png", source)

    def test_avatar_walks_on_source_line_735(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("groundLine: 735", source)
```

- [ ] **Step 2: Run the route test and verify RED**

Run: `python3 tests/test_houston_route_config.py -v`

Expected: both tests fail because the route still references v3 and line 665.

- [ ] **Step 3: Apply the minimal route changes**

In `src/houston-game.js`, set:

```javascript
const ART = Object.freeze({ width: 1906, height: 825, groundLine: 735 });
```

Replace only `foreground-03-v3.png` with `foreground-03-v4.png`. In `houston.html`, change the module query from `chapter-3` to `chapter-4`.

- [ ] **Step 4: Run route and project tests and verify GREEN**

Run:

```bash
python3 tests/test_houston_route_config.py -v
npm test
node --check src/houston-game.js
```

Expected: all tests pass and syntax check exits 0.

- [ ] **Step 5: Commit the route change**

```bash
git add src/houston-game.js houston.html tests/test_houston_route_config.py
git commit -m "fix: ground avatar in rebuilt Houston middle scene"
```

### Task 5: Mobile Visual Verification and Publication

**Files:**
- Modify as a test helper only: `tmp/imagegen/houston-edge-safe/render_mobile_atlas.py`
- Verify unchanged: `index.html`, `src/game.js`

**Interfaces:**
- Consumes: the complete local Houston route.
- Produces: verified portrait, landscape, rotate-back, and seam renders plus the published GitHub Pages route.

- [ ] **Step 1: Render the critical scene positions**

Render 390 × 844 frames for the panel 2→3 join, middle-panel center, panel 3→4 join, and airport entrance. Confirm the avatar's shoes land on the sidewalk and every middle prop is grounded.

- [ ] **Step 2: Verify browser viewport behavior**

Open the local Houston route at 390 × 844, switch to 844 × 390, then return to 390 × 844. Confirm canvas, stage, and visual viewport dimensions match; document overflow is absent; status is hidden; console errors are empty.

- [ ] **Step 3: Run the complete verification gate**

```bash
npm test
python3 tests/test_connected_chroma.py -v
python3 tests/test_houston_chapter_assets.py -v
python3 tests/test_houston_route_config.py -v
node --check src/houston-game.js
git diff --check
git diff --quiet 707a258..HEAD -- index.html src/game.js
```

Expected: every command exits 0, all tests pass, and the homepage diff check is empty.

- [ ] **Step 4: Push and verify GitHub Pages**

Run `git push origin main`, wait for the Pages build for the pushed commit to report `built`, then verify the live HTML references `chapter-4`, the live JavaScript references `foreground-03-v4.png`, and the asset returns HTTP 200.

---

Plan execution is inline because current collaboration policy does not authorize spawning implementation subagents. Use `superpowers:executing-plans` and stop at any failed verification checkpoint.
