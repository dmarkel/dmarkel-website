# Houston Edge-Safe Foreground Design

**Date:** 2026-07-15  
**Status:** Approved from user-directed visual review

## Goal

Remove the remaining oversized and semitransparent foreground distractions from the Houston chapter and establish a stricter panel-edge protocol for this and future scenes.

## Confirmed Defects

1. The first foreground boundary cuts through a mature tree and then jumps to a separate utility pole. Both panels were authored independently, so the tree canopy and trunk terminate at a visible vertical seam.
2. The third foreground panel contains an oversized elevated freeway with landscaping placed on its deck. The object dominates the avatar and the bushes do not make physical sense.
3. The airport endpoint uses shiny balloon colors close enough to the chroma key that edge removal leaves visibly partial alpha.

The parallax transforms remain correct. These are artwork-composition failures.

## Chosen Design

- Remove the entire elevated foreground freeway from panel 03. Replace it with low airport-approach fencing, service-road pavement, restrained landscaping, and sparse light/sign supports. The coherent distant freeway in the environment layer remains.
- Remove the balloons from panel 04 and leave a clean terminal entrance with solid opaque planters and bollards.
- Re-author the first foreground boundary as one seam-centered source. Split it back into a Houston-only panel 01 and panel 02 so the sidewalk, fence, and low landscaping join exactly. No tree, pole, building, sign, or other large object may cross the seam.
- Preserve the approved proof route by creating a versioned Houston-only panel 01 instead of changing `houston-proof/foreground.png`.

## Edge-Safe Protocol

- Reserve at least 96 source pixels on both sides of every panel boundary as an edge-safe zone.
- Edge-safe zones may contain only continuous sidewalk/curb, low fencing, low planting, apron pavement, or transparent sky.
- Trees, buildings, vehicles, ramps, canopies, signs, poles, and landmark props must end outside the edge-safe zone.
- If an object must cross a boundary, author both sides together in one seam-centered image and split only after visual approval.
- Avoid semitransparent or highly reflective foreground props when using chroma-key removal. Use solid opaque pixel-art materials instead.
- Validate every boundary in a 390 × 844 mobile seam atlas before publishing.

## Invariants

- All panels remain 1906 × 825.
- The solid walkable ground remains continuous from y = 665 through y = 824.
- Avatar sprites, movement, controls, camera, parallax factors, world width, far layer, environment layer, proof route, and homepage remain unchanged.
- New assets use versioned filenames and replace only the isolated Houston review route after validation.

## Validation

Automated checks verify dimensions, solid ground, no large opaque objects in the first seam edge zones, no elevated freeway mass in the middle of panel 03, and no partially transparent decorative prop region in panel 04. Mobile seam renders verify the exact reported camera regions before GitHub Pages publication.
