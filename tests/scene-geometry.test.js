import test from "node:test";
import assert from "node:assert/strict";

import { layerTransform, sceneScale, sceneWorld } from "../src/scene-geometry.js";


test("scene scaling is uniform and never shrinks proof art", () => {
  assert.equal(sceneScale(390, 825), 1);
  assert.equal(sceneScale(900, 825), 900 / 825);
});

test("world dimensions preserve the source aspect ratio", () => {
  assert.deepEqual(sceneWorld(1906, 825, 390, 700), {
    width: 1906,
    height: 825,
    scale: 1,
    groundLine: 700,
  });
});

test("layer transform anchors the ground and applies restrained travel", () => {
  assert.deepEqual(
    layerTransform(1000, 390, 1906, 0.38, 1906, 825, 1, 700, 332),
    {
      x: -380,
      y: -368,
      width: 1906,
      height: 825,
      scaleX: 1,
      scaleY: 1,
    },
  );
});
