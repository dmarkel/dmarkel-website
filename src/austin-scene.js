import { ART, GROUND } from './bloomington-foreground.js?v=bloomington-9';

const ROOT = 'assets/backgrounds/austin';
const revision = name => `${ROOT}/${name}-v1.webp?v=austin-1`;

export const AUSTIN_ASSETS = Object.freeze({
  bench: { path: revision('bench'), width: 180, height: 76, baseY: 75 },
  rack: { path: revision('bat-rack'), width: 150, height: 52, baseY: 51 },
});

const props = [
  ...[900, 3100, 5350, 7600, 9300].map((x, index) =>
    ({ id: `austin-bench-${index}`, assetId: 'bench', x, avatarScaleFactor: 0.8 })),
  ...[2050, 4300, 6500, 8500].map((x, index) =>
    ({ id: `austin-bat-rack-${index}`, assetId: 'rack', x, avatarScaleFactor: 0.8 })),
].map(prop => ({ ...prop, plane: 'curb', groundY: 765,
  baseY: AUSTIN_ASSETS[prop.assetId].baseY, mirror: false }));

export const AUSTIN = Object.freeze({
  id: 'austin', label: 'Austin · Chapter 05',
  description: 'South Congress through downtown and the Texas Capitol to the UT Tower',
  art: ART,
  layers: [
    { name: 'far', paths: [revision('far')], width: 2172, height: 724,
      factor: 0.12, preserveDetail: true },
    { name: 'environment', paths: [revision('south-congress'), revision('capitol'), revision('ut-tower')], factor: 0.38 },
  ],
  assets: AUSTIN_ASSETS,
  foreground: { ground: GROUND, props, backProps: [], frontProps: props, endSourceX: 10000 },
  avatarScaledProps: false,
});
