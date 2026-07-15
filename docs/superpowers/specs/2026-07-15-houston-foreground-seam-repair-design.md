# Houston Foreground Seam Repair Design

**Date:** 2026-07-15  
**Status:** Approved for implementation

## Goal

Repair the three visible foreground composition defects in the isolated Houston chapter while preserving the approved avatar, controls, sidewalk geometry, three-layer parallax factors, panel dimensions, and homepage.

## Confirmed Root Causes

The parallax transforms place every panel contiguously and at a uniform scale. The visible defects originate in the independently generated foreground artwork:

1. `foreground-02.png` contains an overly empty transparent band immediately behind the walking surface, exposing too much of the environment layer and making the lower scene appear unfinished.
2. `foreground-03.png` contains an elevated freeway ramp that terminates abruptly inside the panel instead of resolving behind another object.
3. A large foreground airplane crosses the `foreground-03.png` / `foreground-04.png` boundary. Each panel contains a separately generated aircraft fragment, so the body, engine, landing gear, and ground plane do not align.

## Chosen Repair

Use targeted raster edits on the affected foreground panels rather than changing runtime geometry or regenerating the full route.

### Lower foreground continuity

Add a restrained rear sidewalk edge to the exposed section of `foreground-02.png`. Use low planting, curb detail, or a narrow landscaped border that matches the approved palette. The treatment must close the unfinished-looking transparent band without obstructing the avatar lane or filling the scene with dense props.

### Freeway resolution

Edit the ramp in `foreground-03.png` so it resolves naturally behind airport fencing, low landscaping, or a structural support. It must read as a deliberately occluded continuation rather than a severed slab. Preserve the surrounding sign supports, sidewalk, and airport transition.

### Aircraft removal

Remove the oversized foreground aircraft fragments from both `foreground-03.png` and `foreground-04.png`. Reconstruct the runway/service-ground areas behind them using fencing, low landscaping, apron markings, and restrained airport equipment. The complete aircraft already present in the middle environment layer remains visible and supplies the airport landmark.

## Asset Invariants

- Keep every repaired panel at exactly 1906 × 825 pixels.
- Preserve the solid, fully walkable sidewalk and curb across every x-column.
- Preserve the common ground line at source y = 665.
- Preserve transparent unused areas with clean alpha and no magenta fringe.
- Preserve the existing high-detail cartoon pixel-art style and apparent pixel density.
- Keep the avatar lane visually open and free of travel-blocking props.
- Do not change the avatar sprites, movement physics, controls, camera, parallax factors, world width, or current homepage.
- Save repaired artwork as versioned assets during review; replace chapter references only after validation.

## Edge-Safe Protocol for Future Scenes

Major objects must not cross independently generated panel boundaries. Each panel edge should use one of these treatments:

- open sky or transparent negative space;
- continuous ground with matched height and palette;
- small repeatable texture such as low planting or fencing;
- deliberate occlusion that finishes before the edge.

Large vehicles, buildings, ramps, signs, and character-scale landmarks must remain wholly inside one panel unless both sides are authored together from a single seam-centered source image.

## Validation

Automated checks will verify dimensions, useful alpha, continuous opaque ground, and edge-safe upper regions at the repaired airport boundary. Visual seam renders will reproduce the three reported mobile camera positions at 390 × 844 and confirm:

- no unfinished lower transparent band;
- no visibly severed freeway ramp;
- no foreground aircraft fragment or mismatched runway split;
- no new gaps, stretching, blur, or magenta fringe.

The repaired chapter will be published to the isolated `houston.html` review route. The homepage remains unchanged until the chapter is explicitly approved.
