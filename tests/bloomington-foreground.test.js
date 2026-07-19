import test from "node:test";
import assert from "node:assert/strict";

import {
  ART,
  ASSETS,
  GROUND,
  GROUND_PLANES,
  LANDMARKS,
  PROPS,
  buildBloomingtonForeground,
} from "../src/bloomington-foreground.js";

test("Bloomington proof uses the shared source geometry", () => {
  assert.deepEqual(ART, { width: 1906, height: 825, groundLine: 735 });
  assert.deepEqual(GROUND_PLANES, { back: 665, walk: 735, curb: 765 });
  assert.equal(GROUND.width, 3812);
  assert.equal(GROUND.height, 160);
  assert.equal(GROUND.topSourceY, 665);
  assert.match(GROUND.path, /ground-strip\.png\?v=bloomington-1$/);
});

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
  assert.ok(scene.backProps.every(({ assetId }) => assetId !== "student-pair"));
  assert.ok(!Object.hasOwn(ASSETS, "student-pair"));
  assert.ok(PROPS.every(({ id }) => id !== "kelley-students"));
  for (const id of [
    "bench", "campus-lamp", "planter", "newspaper-box",
    "parking-meter", "bike-rack",
  ]) {
    assert.ok(scene.frontProps.some(({ assetId }) => assetId === id), id);
  }
});

test("every prop is grounded from its declared asset baseline", () => {
  const scene = buildBloomingtonForeground();
  for (const prop of scene.props) {
    assert.equal(prop.baseY, ASSETS[prop.assetId].baseY, prop.id);
    assert.equal(prop.groundY, GROUND_PLANES[prop.plane], prop.id);
    assert.ok(prop.x >= 0, prop.id);
    assert.ok(prop.x + ASSETS[prop.assetId].width <= 3812, prop.id);
  }
});

test("proof endpoint is the complete Nick's right edge", () => {
  const scene = buildBloomingtonForeground();
  assert.deepEqual(LANDMARKS.nicks, { x: 3200, width: 612 });
  assert.equal(scene.endSourceX, LANDMARKS.nicks.x + LANDMARKS.nicks.width);
  assert.equal(scene.endSourceX, 3812);
});

test("manifest ids and asset paths are valid and unique", () => {
  const ids = PROPS.map(({ id }) => id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(Object.values(ASSETS).every(({ path }) => (
    path.startsWith("assets/backgrounds/bloomington-proof/")
    && path.endsWith("?v=bloomington-1")
  )));
});
