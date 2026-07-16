import test from "node:test";
import assert from "node:assert/strict";

import {
  expandFenceRun,
  groundTileTransforms,
  propTransform,
} from "../src/modular-foreground.js";

test("ground tiles cover the viewport with no horizontal gap", () => {
  const transforms = groundTileTransforms(1730, 390, 7624, 1, 400, 160, 665, -18);
  assert.ok(transforms[0].x <= 0);
  assert.ok(transforms.at(-1).x + transforms.at(-1).width >= 390);
  transforms.slice(1).forEach((tile, index) => {
    assert.equal(tile.x, transforms[index].x + transforms[index].width);
  });
});

test("prop base anchor maps to the shared source ground line", () => {
  const transform = propTransform(
    { x: 2200, baseY: 180, groundY: 665, mirror: false },
    120,
    200,
    1900,
    1.25,
    -40,
  );
  assert.equal(transform.y + 180 * 1.25, -40 + 665 * 1.25);
});

test("fence run has explicit start gate and end components", () => {
  const props = expandFenceRun(
    { id: "lamar", startX: 100, endX: 1300, gateX: 620, groundY: 665 },
    {
      start: { id: "iron-start", width: 40 },
      middle: { id: "iron-middle", width: 160 },
      gate: { id: "iron-gate", width: 180 },
      end: { id: "iron-end", width: 40 },
    },
  );
  assert.equal(props[0].assetId, "iron-start");
  assert.equal(props.at(-1).assetId, "iron-end");
  assert.equal(props.filter((prop) => prop.assetId === "iron-gate").length, 1);
});
