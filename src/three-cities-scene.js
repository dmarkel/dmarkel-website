import { ART, GROUND } from './bloomington-foreground.js?v=bloomington-9';
import { CITY_ASSETS } from './three-cities-assets.js?v=journey-4';

const path = name => `assets/backgrounds/three-cities/${name}-v2.webp?v=journey-7`;
// Shared paving joins the cities; furniture belongs only to its own location.
const props = [
  ...[700, 1900, 3050].map((x, i) => ({ id: `st-louis-bench-${i}`, assetId: 'st-louis-bench', x })),
  ...[4100, 4950, 5800, 6650].map((x, i) => ({ id: `boston-lamp-${i}`, assetId: 'boston-lamp', x })),
  ...[7800, 8750, 9700, 10600].map((x, i) => ({ id: `cincinnati-planter-${i}`, assetId: 'cincinnati-planter', x })),
].map(prop => ({ ...prop, plane: 'curb', groundY: 765,
  baseY: CITY_ASSETS[prop.assetId].baseY, mirror: false, avatarScaleFactor: prop.assetId === 'st-louis-bench' ? 0.6 : prop.assetId === 'cincinnati-planter' ? 0.65 : 0.8 }));

export const THREE_CITIES = Object.freeze({
  id: 'three-cities',
  label: 'St. Louis · Boston · Cincinnati · Chapter 04',
  transitionTitle: ['St. Louis · Boston · Cincinnati', 'Chapter 04'],
  description: 'the St. Louis riverfront through Beacon Hill to the Cincinnati riverfront',
  art: ART,
  layers: [
    { name: 'far', paths: ['assets/backgrounds/three-cities/far-v2.webp?v=journey-7'],
      width: 2172, height: 724, factor: 0.12, preserveDetail: true },
    { name: 'environment', paths: [path('st-louis'), path('boston'), path('cincinnati')], factor: 0.38, panelOffsetYs: [0, 0, 0] },
  ],
  assets: CITY_ASSETS,
  foreground: { ground: GROUND, props, backProps: [], frontProps: props, endSourceX: 11000 },
  avatarScaledProps: false,
});
