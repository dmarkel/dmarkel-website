import { ART, GROUND } from './bloomington-foreground.js?v=bloomington-9';

const ROOT = 'assets/backgrounds/chicago';
const revision = name => `${ROOT}/${name}-v1.webp?v=chicago-3`;
export const CHICAGO_LANDMARKS = Object.freeze({
  airport: { panel: 0, name: "O’Hare International Airport" },
  park: { panel: 1, name: 'Lincoln Park' },
  office: { panel: 2, name: 'Accenture · 161 N. Clark', architectureRight: 1705, worldRight: 10000 },
});
export const CHICAGO_ASSETS = Object.freeze({
  apartment: { path: revision('apartment'), width: 374, height: 570, baseY: 569 },
  bench: { path: revision('bench'), width: 180, height: 77, baseY: 76 },
  lamp: { path: revision('lamp'), width: 104, height: 299, baseY: 298 },
  rack: { path: revision('rack'), width: 76, height: 96, baseY: 95 },
});
// Seat apartment foundations 10 source pixels into the pavement edge.
const planes = { back: 675, curb: 765 };
const props = [
  { id: 'park-west-bay', assetId: 'apartment', x: 3500, plane: 'back' },
  { id: 'park-west-flat', assetId: 'apartment', x: 3910, plane: 'back', mirror: true },
  { id: 'park-east-flat', assetId: 'apartment', x: 6420, plane: 'back' },
  { id: 'park-east-bay', assetId: 'apartment', x: 6830, plane: 'back', mirror: true },
  ...[500, 1900, 3200, 4600, 5900, 7400, 8800, 9750].map((x, index) =>
    ({ id: `street-lamp-${index}`, assetId: 'lamp', x, plane: 'curb', avatarScaleFactor: 0.8 })),
  ...[1150, 5100, 8200].map((x, index) =>
    ({ id: `bench-${index}`, assetId: 'bench', x, plane: 'curb', avatarScaleFactor: 0.8 })),
  { id: 'park-bike-rack', assetId: 'rack', x: 6150, plane: 'curb', avatarScaleFactor: 0.8 },
].map(prop => ({ ...prop, baseY: CHICAGO_ASSETS[prop.assetId].baseY, groundY: planes[prop.plane], mirror: Boolean(prop.mirror) }));

export const CHICAGO = Object.freeze({
  id: 'chicago', label: 'Chicago · Chapter 03',
  description: "O’Hare through Lincoln Park to Accenture at 161 N. Clark",
  art: ART,
  layers: [
    { name: 'far', paths: [revision('far')], factor: 0.12, coverViewport: true, panelOffsetYs: [-110] },
    { name: 'environment', paths: [revision('airport'), revision('park'), revision('office')], factor: 0.38,
      // Align the office's architecture, excluding the foliage beyond its right edge.
      endSourceX: CHICAGO_LANDMARKS.office.panel * ART.width + CHICAGO_LANDMARKS.office.architectureRight },
  ],
  assets: CHICAGO_ASSETS,
  foreground: {
    ground: GROUND,
    props,
    backProps: props.filter(prop => prop.plane === 'back'),
    frontProps: props.filter(prop => prop.plane === 'curb'),
    endSourceX: CHICAGO_LANDMARKS.office.worldRight,
  },
  avatarScaledProps: false,
});
