# Bloomington Curbside Prop Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Bloomington sidewalk furniture to one curbside depth row so the avatar visibly passes behind it.

**Architecture:** Extend the Bloomington foreground manifest with a named `curb` plane at source y=765 while preserving the avatar floor at y=735. Assign all six near-sidewalk props to that plane, keep the existing back/player/front paint order, and version the JavaScript imports so GitHub Pages and mobile browsers load the new manifest.

**Tech Stack:** JavaScript ES modules, Canvas 2D, Node test runner, Python `unittest`, static HTML, GitHub Pages

## Global Constraints

- Avatar floor remains source y=735.
- Curbside prop baseline is exactly source y=765.
- Background-grade plane remains source y=665.
- Bench, campus lamp, planter, newspaper box, parking meter, and bike rack all use the curb plane.
- Prop images, world x positions, dimensions, base anchors, physics, camera, sidewalk art, and scene art remain unchanged.
- Curbside props render after the avatar and remain non-collidable.
- The untracked `assets/.DS_Store` is user-owned and must not be staged or modified.

---

### Task 1: Define and test the curbside depth plane

**Files:**
- Modify: `tests/bloomington-foreground.test.js:14-51`
- Modify: `src/bloomington-foreground.js:4-48`

**Interfaces:**
- Consumes: `buildBloomingtonForeground(): { props, backProps, frontProps, ... }`
- Produces: `GROUND_PLANES.curb === 765`; each near-sidewalk prop has `plane: "curb"` and `groundY: 765`

- [ ] **Step 1: Write the failing curb-plane tests**

Change the shared-geometry assertion and the foreground partition test to include these exact expectations:

```js
assert.deepEqual(ART, { width: 1906, height: 825, groundLine: 735 });
assert.deepEqual(GROUND_PLANES, { back: 665, walk: 735, curb: 765 });

test("proof props partition exhaustively into back and curb depth", () => {
  const scene = buildBloomingtonForeground();
  const all = scene.props.map(({ id }) => id).sort();
  const partition = [...scene.backProps, ...scene.frontProps]
    .map(({ id }) => id)
    .sort();

  assert.deepEqual(partition, all);
  assert.ok(scene.backProps.every(({ plane }) => plane === "back"));
  assert.ok(scene.frontProps.every(({ plane }) => plane === "curb"));
  assert.ok(PROPS.every(({ plane }) => plane === "curb"));
  assert.ok(scene.frontProps.every(({ groundY }) => groundY === 765));
});
```

Retain the existing asset-removal and six required-prop assertions inside this test.

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run:

```bash
node --test tests/bloomington-foreground.test.js
```

Expected: FAIL because `GROUND_PLANES` has no `curb` member and the props still declare `walk`.

- [ ] **Step 3: Implement the named curb plane**

In `src/bloomington-foreground.js`, define:

```js
export const GROUND_PLANES = Object.freeze({ back: 665, walk: 735, curb: 765 });
```

Change all six `PROPS` entries from `plane: "walk"` to `plane: "curb"`, then make the front partition explicit:

```js
backProps: props.filter(({ plane }) => plane === "back"),
frontProps: props.filter(({ plane }) => plane === "curb"),
```

Keep the existing unknown-asset and unknown-plane exceptions unchanged.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
node --test tests/bloomington-foreground.test.js
```

Expected: all Bloomington foreground tests PASS.

- [ ] **Step 5: Commit the tested geometry change**

```bash
git add tests/bloomington-foreground.test.js src/bloomington-foreground.js
git commit -m "fix: move Bloomington props to curb depth"
```

### Task 2: Version the route and prove paint order remains correct

**Files:**
- Modify: `tests/test_bloomington_route_config.py:8-52`
- Modify: `src/bloomington-game.js:1-4`
- Modify: `bloomington.html:37`

**Interfaces:**
- Consumes: the new curb manifest exported by `src/bloomington-foreground.js`
- Produces: public route cache revision `bloomington-4` for the game and foreground module

- [ ] **Step 1: Write the failing cache-revision assertions**

Update the existing Python expectations to:

```python
self.assertIn("bloomington-game.js?v=bloomington-4", html)
self.assertIn('from "./bloomington-foreground.js?v=bloomington-4"', source)
```

Rename the paint-order test to `test_avatar_is_painted_between_back_and_curb_props`; retain its exact source-order assertions because `frontProps` remains the curbside partition.

- [ ] **Step 2: Run the focused route test and verify the expected failure**

Run:

```bash
python3 -m unittest tests.test_bloomington_route_config -v
```

Expected: the two cache-key assertions FAIL while the paint-order assertion still passes.

- [ ] **Step 3: Update the route cache revisions**

In `src/bloomington-game.js`, change only the foreground import to:

```js
import { ASSETS, ART, buildBloomingtonForeground } from "./bloomington-foreground.js?v=bloomington-4";
```

In `bloomington.html`, change the module script to:

```html
<script type="module" src="src/bloomington-game.js?v=bloomington-4"></script>
```

- [ ] **Step 4: Run the route and foreground tests**

Run:

```bash
python3 -m unittest tests.test_bloomington_route_config -v
node --test tests/bloomington-foreground.test.js
```

Expected: both suites PASS.

- [ ] **Step 5: Commit the public cache revision**

```bash
git add tests/test_bloomington_route_config.py src/bloomington-game.js bloomington.html
git commit -m "chore: refresh Bloomington curb-depth route"
```

### Task 3: Verify the complete site and publish the curb-depth revision

**Files:**
- Verify only: all JavaScript and Python tests
- Verify only: `bloomington.html` in portrait and landscape browser viewports

**Interfaces:**
- Consumes: committed Bloomington curb-plane and route-cache changes
- Produces: verified GitHub Pages deployment and a cache-busted public review URL

- [ ] **Step 1: Run the complete automated test suites**

Run:

```bash
npm test
python3 -m unittest discover -s tests -p 'test_*.py' -v
git diff --check
git status --short
```

Expected: all JavaScript tests PASS, all Python tests PASS, `git diff --check` emits no errors, and status lists only the user-owned `assets/.DS_Store`.

- [ ] **Step 2: Perform local portrait browser verification**

Serve the repository locally and inspect `bloomington.html?v=bloomington-4` at a 390×844 viewport. Walk through Kelley, Sample Gates, Kirkwood, and the endpoint. Verify the avatar passes behind every curb prop, all prop bases meet the sidewalk, nothing extends unnaturally into the street, controls remain usable, and the browser console has no errors.

- [ ] **Step 3: Perform local landscape browser verification**

Inspect the same route at an 844×390 viewport. Repeat the walk and one jump near a curb prop. Verify the curb row remains grounded, the avatar is occluded only where pixels overlap, the endpoint still stops at Nick's right edge, and no viewport cutoff or console error appears.

- [ ] **Step 4: Push the approved main branch**

```bash
git push origin main
```

Expected: GitHub accepts the new commits on `main`.

- [ ] **Step 5: Verify GitHub Pages**

Wait for the Pages deployment for the pushed commit to report `built`. Confirm the public HTML contains `bloomington-game.js?v=bloomington-4`, the public game module imports `bloomington-foreground.js?v=bloomington-4`, and both resources return HTTP 200.

Open this cache-busted review URL:

```text
https://dmarkel.github.io/dmarkel-website/bloomington.html?v=bloomington-4
```

Expected: the live route matches the local portrait and landscape checks.
