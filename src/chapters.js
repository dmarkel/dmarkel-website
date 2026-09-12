import { THREE_CITIES } from './three-cities-scene.js?v=journey-4';
import { CHICAGO } from './chicago-scene.js?v=chicago-3';
import { ASSETS as HOUSTON_ASSETS, buildHoustonForeground } from "./houston-foreground.js?v=chapter-8";
import { ASSETS as BLOOMINGTON_ASSETS, ART, buildBloomingtonForeground } from "./bloomington-foreground.js?v=bloomington-9";

const HOUSTON_LAYERS = Object.freeze([
  {
    name: "far",
    paths: [
      "assets/backgrounds/houston-proof/far.png",
      "assets/backgrounds/houston-chapter/far-02.png",
    ],
    factor: 0.12,
  },
  {
    name: "environment",
    paths: [
      "assets/backgrounds/houston-proof/environment.png",
      "assets/backgrounds/houston-chapter/environment-02-v2.png",
    ],
    panelOffsetYs: [80, 0],
    factor: 0.38,
  },
]);

const BLOOMINGTON_LAYERS = Object.freeze([
  {
    name: "far",
    paths: [
      "assets/backgrounds/bloomington-proof/far-01.png?v=bloomington-1",
      "assets/backgrounds/bloomington-proof/far-02.png?v=bloomington-1",
    ],
    factor: 0.12,
  },
  {
    name: "environment",
    paths: [
      "assets/backgrounds/bloomington-proof/environment-01-v2.png?v=bloomington-2",
      "assets/backgrounds/bloomington-proof/environment-02-v4.png?v=bloomington-6",
      "assets/backgrounds/bloomington-proof/environment-03.png?v=bloomington-8",
      "assets/backgrounds/bloomington-proof/environment-04.png?v=bloomington-8",
    ],
    factor: 0.38,
    panelOffsetYs: [0, -54, -54, -54],
  },
]);

export const CHAPTERS = Object.freeze([
  { id: "houston", label: "Houston · Chapter 01", description: "Lamar High School to IAH", art: ART,
    layers: HOUSTON_LAYERS, assets: HOUSTON_ASSETS, foreground: buildHoustonForeground(), avatarScaledProps: false },
  { id: "bloomington", label: "Bloomington · Chapter 02", description: "Kelley School of Business to Memorial Stadium", art: ART,
    layers: BLOOMINGTON_LAYERS, assets: BLOOMINGTON_ASSETS, foreground: buildBloomingtonForeground(), avatarScaledProps: true },
  CHICAGO,
  THREE_CITIES,
]);
