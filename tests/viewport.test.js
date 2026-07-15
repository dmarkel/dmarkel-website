import test from "node:test";
import assert from "node:assert/strict";
import { applyViewport, readViewport } from "../src/viewport.js";

test("visual viewport wins when mobile browser chrome changes the visible area", () => {
  const metrics = readViewport({
    innerWidth: 844,
    innerHeight: 390,
    visualViewport: {
      width: 780.4,
      height: 352.6,
      offsetLeft: 11.5,
      offsetTop: 7.25,
      scale: 1.25
    }
  });

  assert.deepEqual(metrics, {
    width: 780.4,
    height: 352.6,
    offsetLeft: 11.5,
    offsetTop: 7.25
  });
});

test("window dimensions remain the fallback when VisualViewport is unavailable", () => {
  assert.deepEqual(readViewport({ innerWidth: 1024, innerHeight: 768 }), {
    width: 1024,
    height: 768,
    offsetLeft: 0,
    offsetTop: 0
  });
});

test("stale visual width cannot crop an unzoomed portrait layout after rotation", () => {
  const metrics = readViewport({
    innerWidth: 393,
    innerHeight: 730,
    document: { documentElement: { clientWidth: 393 } },
    visualViewport: {
      width: 308,
      height: 730,
      offsetLeft: 0,
      offsetTop: 0,
      scale: 1
    }
  });

  assert.equal(metrics.width, 393);
  assert.equal(metrics.height, 730);
});

test("stage is pinned to the measured visible viewport", () => {
  const stage = { style: {} };
  applyViewport(stage, { width: 780.4, height: 352.6, offsetLeft: 11.5, offsetTop: 7.25 });

  assert.deepEqual(stage.style, {
    width: "780.4px",
    height: "352.6px",
    transform: "translate3d(11.5px, 7.25px, 0)"
  });
});
