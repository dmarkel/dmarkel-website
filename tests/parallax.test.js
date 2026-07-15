import test from "node:test";
import assert from "node:assert/strict";

import { createCamera, layerGeometry, stepCamera, worldWidthFor } from "../src/parallax.js";


test("world stays long on desktop and narrow mobile", () => {
  assert.equal(worldWidthFor(390), 5200);
  assert.equal(worldWidthFor(1600), 6400);
});

test("camera follows toward a 35 percent screen anchor and clamps", () => {
  let camera = createCamera();
  for (let index = 0; index < 120; index += 1) {
    camera = stepCamera(camera, 2600, 1000, 5200, 1 / 60);
  }
  assert.ok(Math.abs(camera.x - 2250) < 1);
  camera = stepCamera(camera, 9999, 1000, 5200, 1);
  assert.ok(camera.x > 4199);
});

test("layer geometry aligns both journey endpoints at every depth", () => {
  assert.deepEqual(layerGeometry(0, 1000, 5200, 0.25), { x: 0, width: 2050 });
  assert.deepEqual(layerGeometry(4200, 1000, 5200, 0.25), { x: -1050, width: 2050 });
  assert.deepEqual(layerGeometry(4200, 1000, 5200, 1), { x: -4200, width: 5200 });
});
