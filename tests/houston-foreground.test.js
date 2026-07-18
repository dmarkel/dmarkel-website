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

test("iron and chain fences are separated by an intentional open span", () => {
  const iron = FENCE_RUNS.find((run) => run.type === "iron");
  const chain = FENCE_RUNS.find((run) => run.type === "chain");
  assert.ok(chain.startX - iron.endX >= 900);
  assert.equal(iron.gateX, 760);
  assert.equal(chain.gateX, undefined);
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
