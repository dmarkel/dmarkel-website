import test from "node:test";
import assert from "node:assert/strict";

import {
  ASSETS,
  FENCE_RUNS,
  OLD_BOUNDARIES,
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

test("iron and chain fences are separated by an intentional open span", () => {
  const iron = FENCE_RUNS.find((run) => run.type === "iron");
  const chain = FENCE_RUNS.find((run) => run.type === "chain");
  assert.ok(chain.startX - iron.endX >= 900);
  assert.equal(iron.gateX, 760);
  assert.equal(chain.gateX, undefined);
});

test("every prop is grounded and remains inside the world", () => {
  const scene = buildHoustonForeground();
  for (const prop of scene.props) {
    assert.equal(prop.groundY, 665, prop.id);
    assert.ok(prop.x >= 0, prop.id);
    assert.ok(prop.x + ASSETS[prop.assetId].width <= 7624, prop.id);
    assert.ok(Math.abs(prop.baseY - ASSETS[prop.assetId].baseY) <= 8, prop.id);
  }
});
