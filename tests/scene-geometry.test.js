import test from "node:test";
import assert from "node:assert/strict";

import {
  endpointAlignedFactor,
  layerPanelTransforms,
  layerTransform,
  sceneScale,
  sceneFloor,
  sceneWorld,
} from "../src/scene-geometry.js";


test("scene scaling is uniform and never shrinks proof art", () => {
  assert.equal(sceneScale(390, 825), 1);
  assert.equal(sceneScale(900, 825), 900 / 825);
});

test("scene floor keeps the art flush with the bottom in portrait", () => {
  assert.equal(sceneFloor(844, 825, 735, 1), 754);
  assert.equal(sceneFloor(390, 825, 735, 1), 331.5);
});

test("endpoint factor exposes the complete layer without stretching", () => {
  assert.equal(endpointAlignedFactor(3812, 390, 7624), (3812 - 390) / (7624 - 390));
  assert.equal(endpointAlignedFactor(3812, 844, 7624), (3812 - 844) / (7624 - 844));
  assert.equal(endpointAlignedFactor(390, 390, 7624), 0);
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

test("panel transforms stay contiguous and uniformly scaled", () => {
  const transforms = layerPanelTransforms(
    1000,
    390,
    7624,
    0.38,
    1906,
    825,
    2,
    1,
    665,
    332,
  );

  assert.equal(transforms.length, 2);
  assert.equal(transforms[0].x, -380);
  assert.equal(transforms[1].x, 1526);
  assert.equal(transforms[0].scaleX, transforms[0].scaleY);
});

test("panel transforms scale independent source-space vertical offsets", () => {
  const transforms = layerPanelTransforms(
    1000,
    390,
    7624,
    0.38,
    1906,
    825,
    2,
    1.25,
    735,
    754,
    [80, 0],
  );

  const sharedBaseline = 754 - 735 * 1.25;
  assert.equal(transforms[0].y, sharedBaseline + 100);
  assert.equal(transforms[1].y, sharedBaseline);
});

test("approved panel counts cover the narrowest layer at the world endpoint", () => {
  const far = layerPanelTransforms(
    6780,
    844,
    7624,
    0.12,
    1906,
    825,
    2,
    1,
    665,
    332,
  );

  assert.ok(far[1].x + far[1].width >= 844);
});
