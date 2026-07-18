# Foreground Depth and Airport Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render close sidewalk props in front of the avatar and end the Houston journey exactly at the unchanged airport terminal's right edge.

**Architecture:** Partition the existing grounded prop manifest into back and front paint collections while retaining the complete prop list. Derive the source-space world endpoint from the terminal prop and asset width, then make the game consume those manifest outputs for render order and world sizing.

**Tech Stack:** Browser Canvas 2D, ES modules, Node.js built-in test runner, Python `unittest`, static GitHub Pages hosting.

## Global Constraints

- Do not edit or regenerate raster artwork.
- Do not remove, crop, shift, or resize the airport terminal.
- Keep fences, the middle verge, and terminal behind the avatar.
- Render planters, street lamps, bench, electrical cabinet, bike rack, and bollards in front of the avatar.
- Derive the exact endpoint as `6450 + 1068 = 7518` source pixels.
- Do not change avatar sprites, movement physics, jumping, input controls, animation timing, or the approved 80-source-pixel Lamar environment offset.
- Increment the changed Houston module graph to cache key `chapter-8`.

---

### Task 1: Foreground paint partitions and terminal endpoint

**Files:**
- Modify: `tests/houston-foreground.test.js`
- Modify: `src/houston-foreground.js`

**Interfaces:**
- Consumes: grounded props with `plane: "back" | "walk"`, `ASSETS`, and the prop id `airport-terminal`
- Produces: `buildHoustonForeground(): { ground, props, backProps, frontProps, endSourceX }`

- [ ] **Step 1: Write failing partition and endpoint tests**

Add these tests to `tests/houston-foreground.test.js`:

```js
test("foreground partitions are exhaustive and preserve declared depth", () => {
  const scene = buildHoustonForeground();
  const allIds = scene.props.map((prop) => prop.id).sort();
  const partitionIds = [...scene.backProps, ...scene.frontProps]
    .map((prop) => prop.id)
    .sort();

  assert.deepEqual(partitionIds, allIds);
  assert.ok(scene.backProps.every((prop) => prop.plane === "back"));
  assert.ok(scene.frontProps.every((prop) => prop.plane === "walk"));

  const frontAssets = new Set(scene.frontProps.map((prop) => prop.assetId));
  for (const assetId of [
    "planter", "street-lamp", "bench", "cabinet", "bike-rack", "bollards",
  ]) {
    assert.ok(frontAssets.has(assetId), assetId);
  }

  const backIds = new Set(scene.backProps.map((prop) => prop.id));
  assert.ok(backIds.has("middle-verge"));
  assert.ok(backIds.has("airport-terminal"));
  assert.ok(scene.backProps.some((prop) => prop.id.startsWith("lamar-")));
  assert.ok(scene.backProps.some((prop) => prop.id.startsWith("airport-")));
});

test("world endpoint is derived from the unchanged terminal right edge", () => {
  const scene = buildHoustonForeground();
  const terminal = scene.props.find((prop) => prop.id === "airport-terminal");

  assert.equal(terminal.x, 6450);
  assert.equal(ASSETS[terminal.assetId].width, 1068);
  assert.equal(scene.endSourceX, terminal.x + ASSETS[terminal.assetId].width);
  assert.equal(scene.endSourceX, 7518);
});
```

- [ ] **Step 2: Run the focused tests and verify red**

Run: `node --test --test-name-pattern="foreground partitions|world endpoint" tests/houston-foreground.test.js`

Expected: FAIL because `backProps`, `frontProps`, and `endSourceX` are not returned yet.

- [ ] **Step 3: Implement the manifest-derived outputs**

Update `buildHoustonForeground` in `src/houston-foreground.js`:

```js
export function buildHoustonForeground() {
  const fences = FENCE_RUNS.flatMap((run) => (
    expandFenceRun(run, FENCE_COMPONENTS[run.type]).map(groundProp)
  ));
  const props = [...fences, ...PROPS.map(groundProp)];
  const terminal = props.find((prop) => prop.id === "airport-terminal");
  if (!terminal) throw new Error("Missing airport-terminal endpoint prop");
  const terminalAsset = ASSETS[terminal.assetId];
  if (!terminalAsset) throw new Error("Missing airport-terminal endpoint asset");

  return {
    ground: GROUND,
    props,
    backProps: props.filter((prop) => prop.plane === "back"),
    frontProps: props.filter((prop) => prop.plane === "walk"),
    endSourceX: terminal.x + terminalAsset.width,
  };
}
```

- [ ] **Step 4: Run foreground and full JavaScript tests**

Run:

```bash
node --test tests/houston-foreground.test.js
npm test
```

Expected: all tests PASS; the pre-existing manifest tests continue to consume `scene.props` unchanged.

- [ ] **Step 5: Commit the manifest behavior**

```bash
git add tests/houston-foreground.test.js src/houston-foreground.js
git commit -m "fix: derive Houston foreground depth and endpoint"
```

---

### Task 2: Canvas paint order, world width, and cache delivery

**Files:**
- Modify: `tests/test_houston_route_config.py`
- Modify: `src/houston-game.js`
- Modify: `src/houston-foreground.js`
- Modify: `houston.html`

**Interfaces:**
- Consumes: `FOREGROUND.backProps`, `FOREGROUND.frontProps`, and `FOREGROUND.endSourceX` from Task 1
- Produces: back props painted before `drawPlayer`, front props painted after `drawPlayer`, and a scaled world ending at source x 7518

- [ ] **Step 1: Write failing route assertions**

Update chapter cache expectations in `tests/test_houston_route_config.py` from `chapter-7` to `chapter-8`, then add:

```python
def test_world_ends_at_manifest_terminal_edge(self):
    source = (ROOT / "src/houston-game.js").read_text()
    self.assertIn("width: FOREGROUND.endSourceX * scene.scale", source)
    self.assertNotIn("width: scene.width * 4", source)

def test_avatar_is_painted_between_back_and_front_props(self):
    source = (ROOT / "src/houston-game.js").read_text()
    back_call = source.index("drawProps(images, FOREGROUND.backProps, cameraX);")
    player_call = source.index("drawPlayer(images, alpha);")
    front_call = source.index("drawProps(images, FOREGROUND.frontProps, cameraX);")
    self.assertLess(back_call, player_call)
    self.assertLess(player_call, front_call)
```

- [ ] **Step 2: Run route tests and verify red**

Run: `python3 tests/test_houston_route_config.py -v`

Expected: FAIL because the route still uses `scene.width * 4`, paints every prop in `drawScene`, and serves `chapter-7`.

- [ ] **Step 3: Extract shared prop drawing and split the paint passes**

Move the existing prop loop into this function in `src/houston-game.js` without changing transforms, culling, mirroring, or image dimensions:

```js
function drawProps(images, props, cameraX) {
  const sceneY = world.floorY - ART.groundLine * world.scale;
  for (const prop of props) {
    const asset = ASSETS[prop.assetId];
    const transform = propTransform(
      prop,
      asset.width,
      asset.height,
      cameraX,
      world.scale,
      sceneY,
    );
    if (transform.x + transform.width < 0 || transform.x > viewport.width) continue;
    const image = images[`foreground-${prop.assetId}`];
    if (transform.mirror) {
      context.save();
      context.translate(transform.x + transform.width, transform.y);
      context.scale(-1, 1);
      context.drawImage(image, 0, 0, transform.width, transform.height);
      context.restore();
    } else {
      context.drawImage(
        image,
        transform.x,
        transform.y,
        transform.width,
        transform.height,
      );
    }
  }
}
```

At the end of `drawScene`, call:

```js
  drawProps(images, FOREGROUND.backProps, cameraX);
```

In the animation frame, retain the existing order for scene and player, then add:

```js
    drawScene(images, cameraX);
    drawPlayer(images, alpha);
    drawProps(images, FOREGROUND.frontProps, cameraX);
```

- [ ] **Step 4: Use the manifest-derived world endpoint**

Change the `world` assignment in `resize`:

```js
  world = {
    width: FOREGROUND.endSourceX * scene.scale,
    floorY: sceneFloor(height, ART.height, ART.groundLine, scene.scale),
    scale: scene.scale,
  };
```

Do not change player, camera, ground, or environment formulas; they already consume `world.width`.

- [ ] **Step 5: Increment changed module edges to chapter 8**

Use these exact cache keys:

```html
<script type="module" src="src/houston-game.js?v=chapter-8"></script>
```

```js
import { ASSETS, buildHoustonForeground } from "./houston-foreground.js?v=chapter-8";
import { groundTileTransforms, propTransform } from "./modular-foreground.js?v=chapter-8";
import {
  endpointAlignedFactor,
  layerPanelTransforms,
  sceneFloor,
  sceneWorld,
} from "./scene-geometry.js?v=chapter-8";
```

In `src/houston-foreground.js`, change the modular-foreground import to `chapter-8`.

- [ ] **Step 6: Run route and complete automated checks**

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

Expected: every test passes, JavaScript syntax is valid, and whitespace checks are silent.

- [ ] **Step 7: Commit the game integration**

```bash
git add tests/test_houston_route_config.py src/houston-game.js src/houston-foreground.js houston.html
git commit -m "fix: layer sidewalk props and trim airport endpoint"
```

---

### Task 3: Visual verification and deployment

**Files:**
- Verify: `houston.html`
- Verify: `assets/backgrounds/houston-modular/terminal.png`
- Verify: `assets/backgrounds/houston-modular/planter.png`
- Verify: `assets/backgrounds/houston-modular/bench.png`
- Verify: `assets/backgrounds/houston-modular/street-lamp.png`
- Verify: `assets/backgrounds/houston-modular/cabinet.png`
- Verify: `assets/backgrounds/houston-modular/bike-rack.png`
- Verify: `assets/backgrounds/houston-modular/bollards.png`

**Interfaces:**
- Consumes: the chapter-8 route from Task 2
- Produces: verified local rendering and a published GitHub Pages build on `main`

- [ ] **Step 1: Update the ignored visual review atlas**

In the ignored `tmp/imagegen/houston-modular/render-modular-atlas.py`, set:

```python
WORLD_WIDTH = 7518
```

Move the existing prop composition loop into this helper:

```python
def paste_props(view, props, camera, plane):
    for asset_id, world_x, mirror, prop_plane in props:
        if prop_plane != plane:
            continue
        width, height, base_y = ASSETS[asset_id]
        draw_x = world_x - camera
        if draw_x + width < 0 or draw_x > VIEW[0]:
            continue
        image = Image.open(MODULAR / f"{asset_id}.png").convert("RGBA")
        if mirror:
            image = ImageOps.mirror(image)
        view.alpha_composite(
            image,
            (draw_x, SCENE_Y + GROUND_PLANES[prop_plane] - base_y),
        )
```

In `render`, call `paste_props(view, props, camera, "back")` before the existing avatar composition and `paste_props(view, props, camera, "walk")` after it. Change the final checkpoint center from `7488` to `7470`, the furthest grounded avatar center in the shortened world. Do not add the script or generated atlas to git.

- [ ] **Step 2: Render and inspect deterministic checkpoints**

Run: `python3 tmp/imagegen/houston-modular/render-modular-atlas.py`

Inspect `tmp/imagegen/houston-modular/modular-atlas.png` and confirm:

- the avatar passes behind planters, lamps, bench, cabinet, bike rack, and bollards;
- fences and terminal remain behind the avatar;
- the final airport checkpoint has no empty tail after the terminal.

- [ ] **Step 3: Test responsive browser layouts**

Start `python3 -m http.server 8000`, open `http://127.0.0.1:8000/houston.html`, and check 390x844, 844x390, back to 390x844, and 1440x900.

Expected: the canvas exactly matches each viewport, close props occlude the avatar, the complete terminal remains behind him, the maximum right endpoint aligns with the terminal edge, and the browser console contains no warnings or errors.

- [ ] **Step 4: Run the final verification gate**

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

Expected: all tests pass; syntax and whitespace checks are clean; only the unrelated untracked `assets/.DS_Store` may remain.

- [ ] **Step 5: Push the verified main branch**

Run: `git push origin main`

Expected: GitHub accepts the commits and begins a Pages deployment.

- [ ] **Step 6: Confirm the public deployment**

Run: `gh api repos/dmarkel/dmarkel-website/pages/builds/latest`

Expected: the latest build reports `status: built` for the pushed commit. Confirm the public HTML and game module serve `chapter-8`, `FOREGROUND.endSourceX`, and the split draw calls.
