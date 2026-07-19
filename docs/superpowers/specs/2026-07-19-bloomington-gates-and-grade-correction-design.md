# Bloomington Sample Gates and Street-Grade Correction Design

## Goal

Correct the Bloomington 2007 proof so the authored route reads as Kelley School of Business, Sample Gates, and then Kirkwood Avenue. Remove the oversized Kelley student prop, preserve the ordinary Kirkwood pedestrians and cars, and correct the shared vertical placement that currently makes those Kirkwood subjects appear buried in the foreground sidewalk.

## Root Cause

The foreground pavement begins at source y=665, while the Kirkwood environment panel is currently drawn with the common environment baseline at source y=735. The foreground therefore covers the lowest 70 source pixels of the Kirkwood street scene. Pedestrians lose their legs and cars lose their lower bodies even though their internal proportions are acceptable.

The two oversized students are a separate `student-pair` back-plane prop. They are not part of the Kirkwood panel and should be removed rather than rescaled.

Sample Gates were excluded from the original two-landmark proof scope. The second environment panel has enough calm transition space to contain the gates without increasing the world length or placing a landmark across a panel boundary.

## Chosen Approach

Use the existing per-panel vertical-offset support in `layerPanelTransforms` and assign the Kirkwood environment panel a source-space offset of `-70`. This raises the entire panel uniformly, preserving the relationships among storefronts, pedestrians, cars, and Nick's.

Create a versioned replacement for the second environment panel that:

- preserves the current Kirkwood storefronts, the three ordinary pedestrians, period cars, palette, pixel density, and complete Nick's endpoint;
- adds the complete Sample Gates in the left-to-middle transition area;
- contains both limestone gate pylons and the full iron arch inside the panel;
- leaves calm buffer space at the left panel seam;
- keeps all people and vehicles behind the walking lane;
- contains no oversized foreground figures, avatar, graduation activity, modern dining, or landmark split at an image edge.

Remove the `student-pair` entry from the Bloomington foreground manifest. Keep the source asset in the repository only if it remains useful for historical comparison; it must not be loaded or drawn by the game.

## Alternatives Considered

### Edit each buried person and car independently

Rejected because the objects share one incorrect panel baseline. Individual edits would conceal the root cause and could create inconsistent street grades.

### Add Sample Gates as a foreground prop

Rejected because the gates are architecture at environment depth. A foreground prop would move at the avatar's parallax rate and appear to slide against the campus and storefronts.

### Add a third environment panel

Rejected for this repair because the existing transition has sufficient room. Extending the world would change pacing, ground transitions, camera travel, and the approved Nick's endpoint unnecessarily.

## Layering and Geometry

- `environment-01-v2.png`: unchanged Kelley panel at source offset `0`.
- new versioned environment panel: Sample Gates and Kirkwood at source offset `-70`.
- far panels: unchanged.
- pavement strip: unchanged.
- avatar floor and controls: unchanged.
- Nick's right edge remains the source endpoint at x=3812.

The Sample Gates must be fully visible before the Kirkwood storefront run begins. No limestone pylon, iron arch, sign, person, vehicle, or storefront may cross either environment-panel edge.

## Verification

Automated checks must prove:

- the Bloomington foreground manifest no longer loads `student-pair`;
- the second environment panel receives exactly `-70` source pixels of vertical offset;
- the first panel remains at offset `0`;
- Sample Gates occupy a complete, non-edge-connected landmark region inside the second panel;
- the environment seam remains free of large upper objects;
- the new panel has no visible magenta contamination and retains exact 1906×825 geometry;
- Nick's remains complete at the world endpoint;
- all existing movement, jump, viewport, foreground-depth, and ground tests continue to pass.

Browser verification must inspect portrait and landscape layouts at Kelley, Sample Gates, Kirkwood pedestrians/cars, and Nick's. Feet and wheels must meet the visible background street grade rather than disappear into the foreground pavement.

## Reusable Protocol Addition

For future scene packs, distinguish the avatar floor from the background street grade. Generated environment subjects that stand behind a foreground walking strip must use the visible top of that strip as their authored baseline. Record any per-panel vertical correction explicitly in the scene manifest and test it. Do not repair a shared grade error by editing individual people, vehicles, or props.
