import { expandFenceRun } from "./modular-foreground.js";

const ROOT = "assets/backgrounds/houston-modular";

export const GROUND = Object.freeze({
  path: `${ROOT}/ground-tile.png`,
  width: 400,
  height: 160,
  topSourceY: 665,
});

export const ASSETS = Object.freeze({
  "iron-start": { path: `${ROOT}/iron-start.png`, width: 28, height: 190, baseY: 189 },
  "iron-middle": { path: `${ROOT}/iron-middle.png`, width: 296, height: 175, baseY: 174 },
  "iron-gate": { path: `${ROOT}/iron-gate.png`, width: 376, height: 210, baseY: 209 },
  "iron-end": { path: `${ROOT}/iron-end.png`, width: 26, height: 190, baseY: 189 },
  "chain-start": { path: `${ROOT}/chain-start.png`, width: 100, height: 200, baseY: 199 },
  "chain-middle": { path: `${ROOT}/chain-middle.png`, width: 378, height: 200, baseY: 199 },
  "chain-end": { path: `${ROOT}/chain-end.png`, width: 98, height: 200, baseY: 199 },
  planter: { path: `${ROOT}/planter.png`, width: 124, height: 97, baseY: 96 },
  cabinet: { path: `${ROOT}/cabinet.png`, width: 113, height: 113, baseY: 112 },
  bench: { path: `${ROOT}/bench.png`, width: 159, height: 98, baseY: 97 },
  "bike-rack": { path: `${ROOT}/bike-rack.png`, width: 58, height: 85, baseY: 84 },
  bollards: { path: `${ROOT}/bollards.png`, width: 169, height: 87, baseY: 86 },
  "street-lamp": { path: `${ROOT}/street-lamp.png`, width: 68, height: 167, baseY: 166 },
  terminal: { path: `${ROOT}/terminal.png`, width: 1068, height: 584, baseY: 583 },
});

export const OLD_BOUNDARIES = Object.freeze([1906, 3812, 5718]);

export const FENCE_RUNS = Object.freeze([
  { id: "lamar", type: "iron", startX: 80, endX: 3200, gateX: 760, groundY: 665 },
  { id: "airport", type: "chain", startX: 4700, endX: 6250, groundY: 665 },
]);

export const PROPS = Object.freeze([
  { id: "open-planter-a", assetId: "planter", x: 3300, groundY: 665 },
  { id: "open-lamp-a", assetId: "street-lamp", x: 3430, groundY: 665 },
  { id: "open-bench", assetId: "bench", x: 3600, groundY: 665 },
  { id: "open-lamp-b", assetId: "street-lamp", x: 3920, groundY: 665 },
  { id: "open-cabinet", assetId: "cabinet", x: 4070, groundY: 665 },
  { id: "open-bike-rack", assetId: "bike-rack", x: 4260, groundY: 665 },
  { id: "open-bollards", assetId: "bollards", x: 4420, groundY: 665 },
  { id: "open-planter-b", assetId: "planter", x: 4580, groundY: 665, mirror: true },
  { id: "airport-terminal", assetId: "terminal", x: 6450, groundY: 665 },
]);

const FENCE_COMPONENTS = Object.freeze({
  iron: {
    start: { id: "iron-start", width: ASSETS["iron-start"].width },
    middle: { id: "iron-middle", width: ASSETS["iron-middle"].width },
    gate: { id: "iron-gate", width: ASSETS["iron-gate"].width },
    end: { id: "iron-end", width: ASSETS["iron-end"].width },
  },
  chain: {
    start: { id: "chain-start", width: ASSETS["chain-start"].width },
    middle: { id: "chain-middle", width: ASSETS["chain-middle"].width },
    end: { id: "chain-end", width: ASSETS["chain-end"].width },
  },
});

function groundProp(prop) {
  const asset = ASSETS[prop.assetId];
  return {
    ...prop,
    baseY: asset.baseY,
    groundY: prop.groundY ?? 665,
    mirror: Boolean(prop.mirror),
  };
}

export function buildHoustonForeground() {
  const fences = FENCE_RUNS.flatMap((run) => (
    expandFenceRun(run, FENCE_COMPONENTS[run.type]).map(groundProp)
  ));
  return { ground: GROUND, props: [...fences, ...PROPS.map(groundProp)] };
}
