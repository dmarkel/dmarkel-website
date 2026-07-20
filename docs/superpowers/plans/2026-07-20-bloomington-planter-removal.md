# Bloomington Planter Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove only the freestanding Kelley flower-box prop from the published Bloomington chapter.

**Architecture:** Delete the `campus-planter` instance from the Bloomington foreground manifest while retaining the reusable bitmap asset and every other prop. Advance only the changed Bloomington module cache keys to revision 9.

**Tech Stack:** JavaScript ES modules, Node test runner, Python asset tests, HTML Canvas, GitHub Pages.

## Global Constraints

- Preserve all generated environment artwork, including stadium graduation planters.
- Preserve the sidewalk, avatar, physics, prop depth order, and other foreground coordinates.
- Do not stage or modify `assets/.DS_Store`.

---

### Task 1: Remove the Kelley flower-box instance

**Files:**
- Modify: `tests/bloomington-foreground.test.js`
- Modify: `tests/test_bloomington_route_config.py`
- Modify: `src/bloomington-foreground.js`
- Modify: `src/bloomington-game.js`
- Modify: `bloomington.html`

**Interfaces:**
- Consumes: `PROPS`, `buildBloomingtonForeground()`, and revisioned Bloomington module URLs.
- Produces: a foreground manifest with no `campus-planter` instance and public revision 9 entrypoints.

- [ ] **Step 1: Write the failing regression tests**

Require `PROPS` and `buildBloomingtonForeground().frontProps` to exclude `campus-planter`, retain the five remaining prop ids, and require `bloomington-game.js?v=bloomington-9` plus `bloomington-foreground.js?v=bloomington-9`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test tests/bloomington-foreground.test.js && python3 -m unittest tests.test_bloomington_route_config -q`

Expected: FAIL because `campus-planter` and revision 8 still exist.

- [ ] **Step 3: Apply the minimal implementation**

Delete only this manifest entry:

```js
{ id: "campus-planter", assetId: "planter", x: 1450, plane: "curb", groundOffset: 24 },
```

Advance the HTML game URL and game-to-foreground import to `bloomington-9`. Leave bitmap cache revisions and all other manifest data unchanged.

- [ ] **Step 4: Run focused and complete verification**

Run: `npm test && python3 -m unittest discover -s tests -p 'test_*.py' -q && git diff --check`

Expected: 41 JavaScript tests and all Python tests pass with no diff errors.

- [ ] **Step 5: Review and publish**

Inspect Kelley at 390×844 and 844×390, confirm the flower box is absent and the remaining props are grounded, then commit the scoped files, push `main`, wait for GitHub Pages to build the exact commit, and verify revision 9 publicly.
