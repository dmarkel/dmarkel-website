# Full Houston Three-Layer Chapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved three-layer proof into a complete Lamar High School → downtown Houston → freeway approach → IAH playable chapter without changing the homepage.

**Architecture:** Reuse the approved proof art as the first panel of each layer. The full scene uses two far panels, two environment panels, and four foreground panels; each panel remains 1906 × 825 and is drawn with one uniform scale. Layer panel strips move at the approved 12%, 38%, and 100% camera factors, while the foreground strip defines the complete world width.

**Tech Stack:** Built-in image editing, PNG chroma-key post-processing, Python Pillow asset tests, HTML5 Canvas 2D, ECMAScript modules, Node 18 test runner, GitHub Pages.

## Global Constraints

- Preserve the approved proof slice unchanged as panel 1.
- Add only five new independently authored panels: one far, one environment, and three foreground.
- Use camera factors `0.12`, `0.38`, and `1.00`.
- Never scale width and height by different factors.
- Keep every far panel fully opaque.
- Every foreground panel must contain sidewalk coverage across all 1906 columns.
- Match neighboring panels at their seams through palette, horizon, ground height, curb height, and edge details.
- Canvas image smoothing remains disabled.
- Preserve player progress after viewport rotation.
- Build and publish `houston.html`; do not replace `index.html` until the complete chapter is explicitly approved.

---

### Task 1: Produce and Validate the Five Extension Panels

**Files:**
- Reuse: `assets/backgrounds/houston-proof/far.png`
- Reuse: `assets/backgrounds/houston-proof/environment.png`
- Reuse: `assets/backgrounds/houston-proof/foreground.png`
- Create: `assets/backgrounds/houston-chapter/far-02.png`
- Create: `assets/backgrounds/houston-chapter/environment-02.png`
- Create: `assets/backgrounds/houston-chapter/foreground-02.png`
- Create: `assets/backgrounds/houston-chapter/foreground-03.png`
- Create: `assets/backgrounds/houston-chapter/foreground-04.png`
- Create: `tests/test_houston_chapter_assets.py`

**Interfaces:**
- Produces: two far panels, two environment panels, and four foreground panels when combined with the proof assets.
- Consumes: the proof asset dimensions, ground line, palette, and edge treatment.

- [ ] **Step 1: Write the failing chapter asset contract**

Create `tests/test_houston_chapter_assets.py`:

```python
import unittest
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / "assets" / "backgrounds" / "houston-proof"
CHAPTER = ROOT / "assets" / "backgrounds" / "houston-chapter"
FAR = [PROOF / "far.png", CHAPTER / "far-02.png"]
ENVIRONMENT = [PROOF / "environment.png", CHAPTER / "environment-02.png"]
FOREGROUND = [
    PROOF / "foreground.png",
    CHAPTER / "foreground-02.png",
    CHAPTER / "foreground-03.png",
    CHAPTER / "foreground-04.png",
]


class HoustonChapterAssetTests(unittest.TestCase):
    def test_all_panels_share_the_approved_frame(self):
        paths = FAR + ENVIRONMENT + FOREGROUND
        sizes = {Image.open(path).size for path in paths}
        self.assertEqual(sizes, {(1906, 825)})

    def test_far_strip_is_fully_opaque(self):
        for path in FAR:
            alpha = Image.open(path).convert("RGBA").getchannel("A")
            self.assertEqual(alpha.getextrema(), (255, 255))

    def test_environment_strip_has_useful_alpha(self):
        for path in ENVIRONMENT:
            alpha = Image.open(path).convert("RGBA").getchannel("A")
            self.assertEqual(alpha.getextrema(), (0, 255))

    def test_every_foreground_column_has_walkable_ground(self):
        for path in FOREGROUND:
            image = Image.open(path).convert("RGBA")
            for x in range(image.width):
                self.assertTrue(
                    any(image.getpixel((x, y))[3] > 240 for y in range(640, 825)),
                    f"{path.name} is missing ground at x={x}",
                )


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the contract and verify the missing-file failure**

Run `python3 tests/test_houston_chapter_assets.py -v`.

Expected: `FileNotFoundError` for `assets/backgrounds/houston-chapter/far-02.png`.

- [ ] **Step 3: Generate `far-02.png`**

Use built-in image editing with `houston-proof/far.png` as the style and seam reference:

```text
Create a new independently painted continuation of this opaque far Houston panorama. Preserve the exact 1906 × 825 frame, pixel density, horizon height, bright daytime palette, and crisp hard pixel clusters. The left edge must continue naturally from the reference image's right edge. Transition from distant downtown and neighborhoods into freeway-distance scenery, airport approach structures, a control tower, terminal horizon, and tiny distant aircraft toward the right. Every pixel must contain intentional scenery. No empty flat areas, transparency, sidewalk, avatar, text, watermark, blur, painterly smearing, or stretched architecture.
```

Save as `assets/backgrounds/houston-chapter/far-02.png` without resampling.

- [ ] **Step 4: Generate `environment-02.png`**

Use built-in image editing with `houston-proof/environment.png` as the seam and style reference:

```text
Create a new independently authored middle-depth continuation in exact 1906 × 825 high-detail cartoon pixel art. The left edge must continue the reference's downtown and street palette. Move through freeway ramps and airport approach roads into IAH terminal buildings, a control tower, jet bridges, parked aircraft, service vehicles, runway fencing, and airport landscaping. Keep architecture naturally proportioned and the walking lane readable. Replace unused pixels with perfectly flat solid #ff00ff including top corners; no gradient or shadow in the key. No sidewalk, avatar, text, watermark, blur, photorealism, or objects copied from the reference.
```

Remove the key with the installed helper and save as `environment-02.png`.

- [ ] **Step 5: Generate the three foreground continuations**

Generate each as original exact-frame artwork on flat `#ff00ff` above its retained objects. Every panel keeps the sidewalk and curb fully opaque from `y=665` to the bottom.

`foreground-02.png` prompt:

```text
Continue the approved Houston foreground from Lamar into a neighborhood and downtown walking section. Match the reference's sidewalk height, slab scale, curb, road strip, fence palette, and crisp pixel detail at the left edge. Add spaced trees, storefront planters, street signs, and occasional poles while keeping generous gaps around the avatar. Exact 1906 × 825 frame. No skyline, avatar, text, watermark, blur, or gap in the sidewalk. Flat #ff00ff everywhere above and between retained foreground objects.
```

`foreground-03.png` prompt:

```text
Create the next continuous foreground section for the freeway and airport approach. Match the preceding panel's sidewalk, curb, road strip, ground line, bright palette, and crisp pixel density at the left edge. Add spaced highway barriers, directional-sign supports without readable text, airport fencing, low landscaping, and light poles while keeping the walking lane open. Exact 1906 × 825 frame. No avatar, skyline, watermark, blur, or sidewalk gaps. Flat #ff00ff above and between retained objects.
```

`foreground-04.png` prompt:

```text
Create the final continuous foreground arrival at IAH. Match the preceding panel's sidewalk, curb, road strip, ground line, bright palette, and crisp pixel density at the left edge. Add terminal-side planters, bollards, glass-canopy supports, baggage carts, airport fencing, and a clear arrival endpoint while keeping the avatar visible. Exact 1906 × 825 frame. No avatar, readable signage, watermark, blur, or sidewalk gaps. Flat #ff00ff above and between retained objects.
```

Run the chroma-key helper for all three keyed sources with explicit sampled key colors when border sampling selects a foreground object.

- [ ] **Step 6: Validate, inspect seams, and commit**

Run:

```bash
python3 tests/test_houston_chapter_assets.py -v
sips -g pixelWidth -g pixelHeight assets/backgrounds/houston-chapter/*.png
git diff --check
git add assets/backgrounds/houston-chapter tests/test_houston_chapter_assets.py
git commit -m "art: extend the three-layer Houston chapter"
```

Create temporary strip composites for visual seam inspection. Reject a panel if its sidewalk, curb, horizon, or palette visibly jumps at a join.

---

### Task 2: Add Tested Multi-Panel Layer Geometry

**Files:**
- Modify: `src/scene-geometry.js`
- Modify: `tests/scene-geometry.test.js`

**Interfaces:**
- Produces: `layerPanelTransforms(cameraX, viewportWidth, worldWidth, factor, panelWidth, panelHeight, panelCount, scale, groundLine, floorY)`.
- Consumes: the existing aspect-safe scene scale and the layer-specific panel count.

- [ ] **Step 1: Add failing multi-panel tests**

Change the existing import to:

```javascript
import {
  layerPanelTransforms,
  layerTransform,
  sceneScale,
  sceneWorld,
} from "../src/scene-geometry.js";
```

Then append:

```javascript
test("panel transforms stay contiguous and uniformly scaled", () => {
  const transforms = layerPanelTransforms(
    1000, 390, 7624, 0.38, 1906, 825, 2, 1, 665, 332,
  );
  assert.equal(transforms.length, 2);
  assert.equal(transforms[0].x, -380);
  assert.equal(transforms[1].x, 1526);
  assert.equal(transforms[0].scaleX, transforms[0].scaleY);
});

test("approved panel counts cover the narrowest layer at the world endpoint", () => {
  const far = layerPanelTransforms(
    6780, 844, 7624, 0.12, 1906, 825, 2, 1, 665, 332,
  );
  assert.ok(far[1].x + far[1].width >= 844);
});
```

- [ ] **Step 2: Run the test and verify the missing export**

Run `node --test tests/scene-geometry.test.js`.

Expected: import failure because `layerPanelTransforms` is not exported.

- [ ] **Step 3: Implement the panel transform function**

Append to `src/scene-geometry.js`:

```javascript
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
) {
  const maxCamera = Math.max(0, worldWidth - viewportWidth);
  const safeCamera = Math.max(0, Math.min(maxCamera, cameraX));
  const width = panelWidth * scale;
  const height = panelHeight * scale;
  const originX = -safeCamera * factor;
  return Array.from({ length: panelCount }, (_, index) => ({
    x: originX + index * width,
    y: floorY - groundLine * scale,
    width,
    height,
    scaleX: scale,
    scaleY: scale,
  }));
}
```

- [ ] **Step 4: Run all tests and commit**

```bash
npm test
git diff --check
git add src/scene-geometry.js tests/scene-geometry.test.js
git commit -m "feat: add multi-panel scene geometry"
```

---

### Task 3: Build the Full Houston Review Page

**Files:**
- Create: `houston.html`
- Create: `src/houston-game.js`
- Verify unchanged: `index.html`
- Verify unchanged: `src/game.js`

**Interfaces:**
- Consumes: `layerPanelTransforms()` and the 2/2/4 panel arrays.
- Produces: a complete isolated Houston chapter review route.

- [ ] **Step 1: Create `houston.html`**

Copy the complete accessible shell from `proof.html`, change the title to `David — Houston Chapter Review`, the eyebrow to `Houston · Full chapter`, the heading to `Lamar to IAH.`, and the module source to `src/houston-game.js?v=chapter-1`.

- [ ] **Step 2: Create the chapter runtime**

Start from `src/proof-game.js`. Replace `PROOF_LAYERS` with:

```javascript
const CHAPTER_LAYERS = Object.freeze([
  {
    name: "far",
    factor: 0.12,
    paths: [
      "assets/backgrounds/houston-proof/far.png",
      "assets/backgrounds/houston-chapter/far-02.png",
    ],
  },
  {
    name: "environment",
    factor: 0.38,
    paths: [
      "assets/backgrounds/houston-proof/environment.png",
      "assets/backgrounds/houston-chapter/environment-02.png",
    ],
  },
  {
    name: "foreground",
    factor: 1,
    paths: [
      "assets/backgrounds/houston-proof/foreground.png",
      "assets/backgrounds/houston-chapter/foreground-02.png",
      "assets/backgrounds/houston-chapter/foreground-03.png",
      "assets/backgrounds/houston-chapter/foreground-04.png",
    ],
  },
]);
```

Load each panel with keys such as `far-0`, `far-1`, `environment-0`, and `foreground-3`. Set the world width to `ART.width * 4 * scene.scale`.

Draw each layer using:

```javascript
const transforms = layerPanelTransforms(
  cameraX, viewport.width, world.width, layer.factor,
  ART.width, ART.height, layer.paths.length, world.scale,
  ART.groundLine, world.floorY,
);
transforms.forEach((transform, index) => {
  context.drawImage(
    images[`${layer.name}-${index}`],
    transform.x, transform.y, transform.width, transform.height,
  );
});
```

Keep physics, player interpolation, controls, asset failure handling, and viewport recovery unchanged from the approved proof runtime.

- [ ] **Step 3: Verify and commit the isolated full chapter**

```bash
node --check src/houston-game.js
npm test
python3 -m unittest discover -s tests -v
git diff --check
git add houston.html src/houston-game.js
git commit -m "feat: add full Houston chapter review"
```

---

### Task 4: Full-Route Browser QA and Review Deployment

**Files:**
- Verify: `houston.html`
- Verify unchanged: `index.html`
- Verify unchanged: `proof.html`

**Interfaces:**
- Produces: `https://dmarkel.github.io/dmarkel-website/houston.html` for explicit approval.

- [ ] **Step 1: Run fresh committed-tree verification**

Run all Node tests, all Python tests, syntax checks for both review runtimes, `git diff --check`, and confirm a clean worktree.

- [ ] **Step 2: Browser-test the complete route**

At `1440 × 900`, `390 × 844`, and `844 × 390`, walk from the first panel to the final IAH panel. Confirm no empty background appears, every seam remains covered, art stays proportionally sharp, controls and jump remain smooth, and no console errors occur. Verify live landscape-to-portrait rotation without reloading.

- [ ] **Step 3: Confirm route isolation**

Verify `index.html` still loads `src/game.js`, `proof.html` still loads `src/proof-game.js`, and `houston.html` loads `src/houston-game.js`.

- [ ] **Step 4: Push, wait for Pages, and verify the public review URL**

Push `main`, wait until GitHub Pages reports `built` for the exact commit, then verify `https://dmarkel.github.io/dmarkel-website/houston.html` on a 390 × 844 viewport with no asset or console errors. Share the route for explicit user approval; do not replace the homepage in this task.
