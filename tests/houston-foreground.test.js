import test from "node:test";
import assert from "node:assert/strict";

import {
  ASSETS,
  FENCE_RUNS,
  GROUND_PLANES,
  OLD_BOUNDARIES,
  PROPS,
  buildHoustonForeground,
} from "../src/houston-foreground.js";

test("all manifest ids are unique and paths are modular assets", () => {
  const scene = buildHoustonForeground();
  const ids = scene.props.map((prop) => prop.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(Object.values(ASSETS).every((asset) => (
    asset.path.startsWith("assets/backgrounds/houston-modular/")
  )));
});

test("fence endpoints avoid every old panel boundary", () => {
  for (const run of FENCE_RUNS) {
    for (const boundary of OLD_BOUNDARIES) {
      assert.ok(Math.abs(run.startX - boundary) > 96);
      assert.ok(Math.abs(run.endX - boundary) > 96);
    }
  }
});

test("the baked Lamar environment is the only Lamar fence source", () => {
  assert.equal(FENCE_RUNS.some((run) => run.id === "lamar" || run.type === "iron"), false);
});

test("the airport environment is the only terminal architecture source", () => {
  assert.equal(Object.hasOwn(ASSETS, "terminal"), false);
  assert.equal(PROPS.some((prop) => prop.assetId === "terminal"), false);
});

test("the airport chain fence is the only modular fence run", () => {
  assert.equal(FENCE_RUNS.length, 1);
  assert.equal(FENCE_RUNS[0].id, "airport");
  assert.equal(FENCE_RUNS[0].type, "chain");
  assert.equal(FENCE_RUNS[0].gateX, undefined);
});

test("structural props use the back plane and street props use the walking plane", () => {
  const scene = buildHoustonForeground();
  const walkAssets = new Set([
    "planter", "bench", "cabinet", "bike-rack", "bollards", "street-lamp",
  ]);
  for (const prop of scene.props) {
    const expected = walkAssets.has(prop.assetId) ? GROUND_PLANES.walk : GROUND_PLANES.back;
    assert.equal(prop.groundY, expected, prop.id);
    assert.ok(prop.x >= 0, prop.id);
    assert.ok(prop.x + ASSETS[prop.assetId].width <= 7624, prop.id);
    assert.ok(Math.abs(prop.baseY - ASSETS[prop.assetId].baseY) <= 8, prop.id);
  }
});

test("raw foreground entries declare planes rather than duplicate y coordinates", () => {
  for (const prop of [...FENCE_RUNS, ...PROPS]) {
    assert.ok(["back", "walk"].includes(prop.plane), prop.id);
    assert.equal(Object.hasOwn(prop, "groundY"), false, prop.id);
  }
});
