const ROOT = "assets/backgrounds/bloomington-proof";
const revision = (name) => `${ROOT}/${name}?v=bloomington-1`;

export const ART = Object.freeze({ width: 1906, height: 825, groundLine: 735 });
export const GROUND_PLANES = Object.freeze({ back: 665, walk: 735, curb: 765 });
export const GROUND = Object.freeze({
  path: revision("ground-strip.png"),
  width: 3812,
  height: 160,
  topSourceY: 665,
});

export const ASSETS = Object.freeze({
  bench: { path: revision("bench.png"), width: 150, height: 96, baseY: 95 },
  "campus-lamp": { path: revision("campus-lamp.png"), width: 64, height: 190, baseY: 189 },
  planter: { path: revision("planter.png"), width: 128, height: 100, baseY: 99 },
  "newspaper-box": { path: revision("newspaper-box.png"), width: 80, height: 108, baseY: 107 },
  "parking-meter": { path: revision("parking-meter.png"), width: 45, height: 118, baseY: 117 },
  "bike-rack": { path: revision("bike-rack.png"), width: 80, height: 88, baseY: 87 },
});

export const PROPS = Object.freeze([
  { id: "campus-bench", assetId: "bench", x: 520, plane: "curb" },
  { id: "campus-lamp", assetId: "campus-lamp", x: 930, plane: "curb" },
  { id: "campus-planter", assetId: "planter", x: 1450, plane: "curb" },
  { id: "kirkwood-news", assetId: "newspaper-box", x: 2250, plane: "curb" },
  { id: "kirkwood-meter", assetId: "parking-meter", x: 2580, plane: "curb" },
  { id: "kirkwood-rack", assetId: "bike-rack", x: 2910, plane: "curb" },
]);

export const LANDMARKS = Object.freeze({ nicks: { x: 3200, width: 612 } });

function groundProp(prop) {
  const asset = ASSETS[prop.assetId];
  const groundY = GROUND_PLANES[prop.plane];
  if (!asset) throw new Error(`Unknown Bloomington asset: ${prop.assetId}`);
  if (groundY === undefined) throw new Error(`Unknown Bloomington depth plane: ${prop.plane}`);
  return { ...prop, baseY: asset.baseY, groundY, mirror: Boolean(prop.mirror) };
}

export function buildBloomingtonForeground() {
  const props = PROPS.map(groundProp);
  return {
    ground: GROUND,
    props,
    backProps: props.filter(({ plane }) => plane === "back"),
    frontProps: props.filter(({ plane }) => plane === "curb"),
    endSourceX: LANDMARKS.nicks.x + LANDMARKS.nicks.width,
  };
}
