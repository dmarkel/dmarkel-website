# Bloomington 2007 Memory Scene Design

**Status:** Approved for proof-slice planning

**Date:** 2026-07-18

**Governing standard:** `docs/superpowers/specs/2026-07-14-three-layer-scene-system-design.md`

## Goal

Create a new autobiographical side-scrolling chapter set in Bloomington, Indiana, using the approved avatar unchanged. The chapter is a stylized memory journey through Indiana University and downtown Bloomington in spring 2007:

```text
Sample Gates → Kelley School of Business → Kirkwood Avenue → Memorial Stadium
```

The chapter uses the existing smooth walking, jumping, camera, keyboard controls, mobile joystick, and jump button. It introduces new artwork and scene data without changing the avatar's appearance, outfit, sprite sheets, animation timing, movement physics, or controls.

## Approved Narrative Direction

- The route follows emotional memory rather than strict map geography.
- The entire scene takes place during one warm spring day in 2007.
- Sample Gates, Kelley, and Kirkwood show ordinary spring campus and downtown activity.
- Graduation activity appears only at Memorial Stadium.
- The avatar remains in his navy polo, light pants, and existing shoes rather than wearing a cap and gown.
- The final mood is celebratory, but the avatar's walking lane remains readable and open.

## Historical and Visual Constraints

The artwork must represent 2007 rather than present-day Bloomington.

- Kelley uses its documented pre-renovation exterior. Do not include the Hodge Hall renovation completed in 2014 or the Conrad Prebys Career Services Center completed in 2017.
- Kirkwood uses period-appropriate storefronts, vehicles, street furniture, signs, and pedestrian styling.
- Do not use the modern street-closure outdoor dining layout.
- Nick's English Hut, Kilroy's on Kirkwood, and The Upstairs Pub/Dunnkirk Square must be recognizable.
- The full Kirkwood corridor also includes the Buskirk-Chumley Theater, IU-oriented shops, period vehicles, and supporting storefronts.
- Graduation staging, caps and gowns, commencement banners, family groups, and ceremony photography are confined to the Memorial Stadium zone.
- All zones share the same warm daylight, fresh green spring foliage, and high-detail cartoon pixel-art treatment as the approved Houston character and scene.

Historical references:

- IU Sample Gates and campus context: https://bloomington.iu.edu/about/history.html
- Kelley 2006 exterior reference: https://commons.wikimedia.org/wiki/File:KelleySchoolofBusiness.jpg
- Kelley renovation history: https://kelley.iu.edu/about/bloomington/index.html
- Nick's history, including its 2007 remodel: https://www.nicksenglishhut.com/our-history
- Kilroy's Kirkwood opening history: https://www.ibj.com/articles/6466-bloomington-s-kilroy-s-opening-downtown-indianapolis-outpost
- Upstairs Pub history: https://www.upstairspub.com/about
- Memorial Stadium exterior and location: https://iuhoosiers.com/facilities/memorial-stadium/6
- IU spring commencement staging reference: https://commencement.indiana.edu/commencement-day/what-to-expect/spring-undergrad.html

## Four-Zone Route

### Zone 1: Sample Gates

The opening occupies approximately 20% of the complete source-space journey.

It contains:

- the complete Indiana limestone Sample Gates;
- Franklin Hall and Bryan Hall context;
- Old Crescent greenery and paths;
- an IU red clock;
- spring flowers, bicycles, and ordinary students;
- no graduation banners, caps, gowns, or commencement staging.

The complete gate structure remains inside this zone and does not cross an authored boundary.

### Zone 2: Kelley School of Business

Kelley occupies approximately 22% of the journey.

It contains:

- the recognizable pre-renovation business school exterior;
- its 2007 architectural proportions and signage;
- campus paths, bicycles, benches, and normal school-day pedestrians;
- spring trees and limestone details that connect visually to the Sample Gates zone;
- no later Kelley additions and no graduation staging.

The Kelley building remains complete within its authored zone.

### Zone 3: Full Kirkwood Corridor

Kirkwood occupies approximately 35% of the journey and is the most detailed middle section.

It contains:

- Nick's English Hut;
- Kilroy's on Kirkwood;
- The Upstairs Pub and Dunnkirk Square;
- Buskirk-Chumley Theater;
- IU-oriented shops and supporting 2007 storefronts;
- period vehicles, street lamps, newspaper boxes, parking meters, bicycles, and ordinary pedestrians;
- normal daytime restaurant and bar activity without graduation decoration;
- enough visual rhythm to feel active without turning into a wall of signs or blocking the avatar.

Each major storefront is complete within one authored region. No large sign, awning, vehicle, or building crosses an unsafe generation boundary.

### Zone 4: Memorial Stadium Graduation

The stadium occupies the final 23% of the journey.

It contains:

- the complete Memorial Stadium arrival architecture;
- a stadium plaza and recognizable Indiana identity;
- crimson commencement banners;
- graduates in black caps and gowns;
- families, cameras, flowers, and restrained celebration details;
- background ceremony organization that reads as graduation rather than a football game;
- no tailgating, football crowd, or game-day staging.

Graduation activity begins only inside this zone. The unchanged avatar remains visually distinct from the graduates.

## Transition Buffers

The four zones are connected by authored tree-lined or low-detail streetscape buffers. A transition may contain open sky, complete spring foliage, low walls, paths, or modular street furniture.

A transition may not cut through:

- a gate;
- a building;
- a storefront sign or awning;
- a large tree;
- a vehicle;
- a stadium structure;
- a graduation group.

Major landmarks remain wholly within their zones. If an unavoidable large object approaches a boundary, its entire seam region must be authored as one source composition before any split occurs.

## Three-Layer Architecture

### Far layer

- Fully opaque across the complete route and every viewport exposure range.
- Approximately 12% camera motion.
- Warm spring sky, soft clouds, distant Bloomington tree canopy, and restrained horizon detail.
- No transparent holes or extracted masks.

### Environment layer

- Approximately 38% camera motion.
- Contains the four complete landmark zones and their deliberate transition buffers.
- Is authored for this depth rather than extracted from the far layer.
- Preserves equal horizontal and vertical scale at runtime.

### Foreground system

- Moves at 100% camera speed.
- Uses clean surface-specific ground assets plus modular props in continuous world coordinates.
- Divides props into `back` and `walk` planes.
- Renders in this order: ground, back props, avatar, walk props.

## Ground Surfaces

The chapter uses three surface families:

1. Campus limestone/concrete path for Sample Gates and Kelley.
2. Period-appropriate Kirkwood sidewalk and curb.
3. Memorial Stadium plaza paving.

Two explicit ground-transition modules connect the surface families. Every surface and transition shares the same source-space walking line and collision height.

Ground assets contain only pavement, expansion joints, restrained cracks or weeds, curb, drainage, and road edge where appropriate. They may not contain plants, buildings, furniture, signs, people, storefront fragments, or background pixels.

Every surface must:

- be fully opaque;
- start with clean pavement at its top edge;
- use one consistent side-view seam perspective;
- repeat or terminate without a visible join;
- preserve equal x/y scaling;
- keep the avatar's shoes aligned with the authored walking line.

## Foreground Depth and Props

Back-plane elements may include:

- low walls and fences;
- building-adjacent landscaping;
- background pedestrians;
- trees intended to remain behind the avatar;
- graduation groups and ceremony details positioned behind the walking lane.

Walk-plane elements may include:

- benches;
- planters;
- lamps and parking meters;
- newspaper boxes;
- bicycle racks;
- café furniture;
- selected close pedestrians or family members near the stadium.

Every prop declares an asset, world x coordinate, dimensions, `baseY`, ground plane, and depth plane. Nearby props render after the avatar and occlude him only where their pixels overlap. The route remains visually clear and does not add decorative collision.

## Chapter Endpoints

The left endpoint is anchored to the intended outer edge of the complete Sample Gates opening composition.

The right endpoint is derived from the intended right architectural edge of the complete Memorial Stadium graduation entrance. It is not derived from the number or width of artwork panels.

At maximum travel:

- the complete stadium remains visible and unchanged;
- the stadium edge, ground, environment, and camera boundary terminate together;
- the avatar cannot walk into an empty tail;
- the far layer still covers the complete viewport.

## Representative Proof Slice

Before full-scene artwork is generated, create one Kelley-to-Kirkwood proof slice containing:

- the final portion of the authentic 2007 Kelley exterior;
- a complete tree-lined transition buffer;
- the opening Kirkwood block with Nick's as the primary storefront;
- the campus-path-to-city-sidewalk transition;
- representative lamps, benches, planters, pedestrians, and period vehicles;
- the unchanged walking and jumping avatar;
- the approved restrained three-layer parallax relationship.

The proof slice intentionally excludes stadium graduation activity. Its purpose is to prove the chapter's 2007 visual identity, spring palette, source sharpness, surface transition, landmark completeness, prop grounding, foreground depth, density, and avatar readability.

Full production does not begin until this animated proof slice is explicitly approved.

## Asset-First Validation

Before runtime integration, automated checks and a review atlas must verify:

- exact dimensions, color modes, and pixel density;
- full opacity of the far and ground assets;
- clean alpha and no chroma-key contamination in modular props;
- clean top edges and consistent perspective on every ground surface;
- compatible repeating or terminating ground edges;
- valid prop paths, unique identifiers, `baseY` anchors, and depth planes;
- exhaustive and exclusive `back`/`walk` prop partitions;
- no large object crossing an unsafe boundary;
- complete landmark extents;
- endpoint coordinates derived from the Sample Gates and Memorial Stadium anchors.

The atlas includes every seam, transition, ground surface, landmark edge, prop class, and endpoint. It previews the avatar behind close props and in front of back-plane props.

## Runtime Validation

The animated proof and final chapter are reviewed at:

- mobile portrait;
- mobile landscape;
- landscape rotated back to portrait;
- desktop wide view;
- both chapter endpoints;
- every landmark transition;
- every prop-overlap checkpoint.

The complete chapter must be walked from the Sample Gates endpoint to the Memorial Stadium endpoint.

Browser review confirms:

- no stretching or blurred pixel detail;
- no empty parallax holes;
- no mismatched ground heights, perspective changes, or repeated background fragments;
- no floating, transparent, or chroma-contaminated props;
- correct avatar occlusion and a clear walking lane;
- complete landmark transitions and endpoint alignment;
- a canvas flush with every viewport edge after rotation;
- smooth walking and jumping;
- no console warnings, asset failures, or body overflow.

If a required asset fails to load or violates a manifest contract, the review route stops with a readable error state instead of rendering incomplete scenery.

## Approval and Delivery Gates

1. Approve this written design.
2. Produce and review proof-slice artwork and its asset atlas.
3. Integrate the proof slice with the real avatar and controls.
4. Approve the animated proof at all required viewports.
5. Extend the approved system to all four landmark zones.
6. Review the complete chapter and every endpoint.
7. Version all changed module and bitmap URLs.
8. Deploy only after explicit final scene approval.
9. Verify the public route serves the expected commit and versioned assets.

## Non-Goals

- Do not modify or regenerate the avatar.
- Do not change movement, jumping, controls, camera smoothness, or animation timing.
- Do not add graduation activity outside Memorial Stadium.
- Do not reproduce Bloomington with strict map geography.
- Do not use modern Kelley additions, storefronts, vehicles, or Kirkwood street-closure dining.
- Do not delete, crop, move, or replace an approved landmark to hide a boundary or endpoint error.
- Do not generate the complete chapter before the representative proof slice is approved.
