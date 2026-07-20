# Reusable Three-Layer Scene System

**Status:** Living production standard

**Last updated:** 2026-07-18

**Applies to:** Houston and every later autobiographical chapter

## Goal

Create sharp, continuous, high-detail pixel-art side-scrolling chapters that can be extended to new locations without reintroducing the gaps, stretched artwork, mismatched seams, floating objects, transparency contamination, or endpoint errors found during the Houston build.

Each chapter is a continuous journey with smooth, restrained parallax. The visual style may change with the location and period, but the layer responsibilities, ground contract, foreground depth model, seam rules, validation gates, and responsive review process remain consistent.

## Lessons from Houston

The following approaches caused visible failures and must not be repeated:

- Splitting one flattened illustration into moving masks exposed empty holes when the layers moved at different rates.
- Stretching source plates independently changed their aspect ratios, blurred pixel detail, and distorted buildings and vehicles.
- Generating complete foreground panels independently produced mismatched sidewalks, alternating perspective lines, abrupt fence changes, floating props, transparent plants, and clipped structures.
- Allowing large objects to cross independently generated boundaries created severed highways, aircraft, buildings, and terminal transitions.
- Baking vegetation, furniture, or background fragments into the sidewalk made those fragments repeat across the world.
- Drawing every prop before the avatar made him appear to walk on top of nearby objects.
- Using a fixed panel-count world width allowed the camera to continue beyond the final terminal.
- Replacing or deleting a landmark to hide an endpoint defect damaged approved artwork instead of fixing the world geometry.
- Reusing unversioned image URLs allowed mobile browsers to retain visibly broken assets after deployment.
- Reviewing only isolated artwork missed problems introduced by scaling, camera motion, mobile rotation, and runtime paint order.

These are source-architecture and validation problems. They must be prevented during asset production rather than hidden later with masks, patches, cropping, or unrelated deletions.

## Scene Architecture

Every chapter uses three independently authored visual depth systems.

### 1. Far layer

- Moves at approximately 12% of camera speed unless a proof slice establishes a better restrained value.
- Contains sky, clouds, horizon, distant terrain, and distant landmarks.
- Is fully opaque across the complete camera exposure range.
- Covers both chapter endpoints at every supported viewport size.
- Never depends on a transparent cutout from another layer.

### 2. Environment layer

- Moves at approximately 38% of camera speed unless adjusted during proof approval.
- Contains buildings, neighborhoods, streets, distant infrastructure, and location-defining architecture.
- Is illustrated specifically for this depth plane.
- Uses connected sections with deliberate transition zones.
- Does not contain the walkable sidewalk, close furniture, or objects intended to pass in front of the avatar.

### 3. Foreground system

- Moves at 100% of camera speed.
- Uses one continuous ground asset per surface type plus modular world-positioned props.
- Divides props into explicit `back` and `walk` depth planes.
- Renders in this order: ground, back props, avatar, walk props.
- Keeps fences, large structures, and terminal buildings behind the avatar.
- Places nearby planters, benches, cabinets, lamps, racks, and bollards in front of the avatar when their pixels overlap him.

The avatar is not simply drawn last. Foreground depth is declared in scene data and produces deterministic paint order.

## Ground and Sidewalk Contract

The ground asset is gameplay infrastructure, not a general scenery panel.

It must:

- contain only the walking surface, paving texture, expansion joints, curb, drainage channel, and road edge;
- remain fully opaque;
- preserve one authored ground line and one collision/walking line;
- use equal horizontal and vertical scale at runtime;
- begin at its top row with clean pavement rather than greenery, buildings, furniture, fence fragments, or other background pixels;
- use one consistent side-view perspective for every paving seam;
- avoid switching between left- and right-leaning perspective lines;
- have compatible left and right edges when repeated;
- contain restrained drains, cracks, weeds, and texture that do not reveal obvious repetition;
- exclude props, landscaping masses, signs, poles, cabinets, benches, planters, and buildings.

The sidewalk is created and approved as its own asset before props are composed over it. It must never be recovered by cropping the bottom of a flattened scene panel.

## Modular Foreground Contract

Every foreground object is an independent transparent sprite with manifest data for:

- stable identifier;
- asset path;
- world x position in source pixels;
- source width and height;
- `baseY` anchor measured within the sprite;
- declared depth plane: `back` or `walk`;
- optional horizontal mirroring.

The asset baseline is aligned to a shared source-space ground plane. Freestanding objects may not be positioned by eye inside a full panel.

Production sprites use crisp binary alpha unless an explicitly approved translucent material requires partial alpha. Chroma-key removal must use border-connected extraction, edge despill, and contamination checks. Plants and detailed edges must be inspected against both light and dark temporary backgrounds before approval.

## Repeated Structures

Fences, railings, walls, and similar runs use explicit components:

- start component;
- repeatable middle component;
- optional gate or opening component;
- end component.

The world manifest defines the complete run. A fence must not begin, stop, change height, change material, or switch style because of an art-panel boundary. Different runs require an intentional open span or a designed transition.

## Scene Boundary Rules

Connected artwork sections use shared dimensions, scale, ground anchors, palette references, and transition buffers.

At a section boundary, use only:

- open sky or complete opaque far artwork;
- clean negative space where transparency is intentional;
- continuous low-detail textures authored to match on both sides;
- modular structures that cross the boundary through runtime placement;
- a deliberate occluder that is complete within one section.

Do not place large vehicles, buildings, bridges, ramps, airplanes, signs, trees, or character-scale landmarks across independently generated boundaries. If a large object must cross a boundary, author the entire object and both adjoining regions together in one seam-centered source image, then validate the final composite before splitting it.

No repair may delete, crop, shift, or replace an approved landmark merely to conceal a seam or endpoint error.

## Chapter Endpoint Contract

The playable world endpoint is derived from the final approved landmark or explicit scene manifest anchor. It is not calculated from a nominal panel count.

At maximum travel:

- the final landmark's intended right edge aligns with the viewport edge;
- the ground and road stop at the same world boundary;
- the environment and far layers still cover the viewport;
- the avatar cannot enter an empty tail;
- the complete final landmark remains visible and unchanged.

Endpoint validation must measure the declared landmark edge, not the keyed asset's
overall alpha bounds. A thin ground line, shadow, flower bed, or landscaping tail
may extend beyond the architecture inside a generated bitmap and must not become
the chapter anchor. For a building endpoint, test and align an upper architecture
band separately from the ground band, then confirm the ground is clipped to the
same world boundary.

The same rule applies at the left endpoint when a chapter begins with a structure rather than open scenery.

## Artwork Production Workflow

### Phase 1: Chapter definition

1. Define the route, time period, emotional tone, time of day, and required landmarks.
2. Define the starting and ending anchors before generating artwork.
3. Choose the expected scene length in source-space units without committing to arbitrary panel-count endpoints.
4. Record the avatar scale, ground line, walking line, and target pixel density.

### Phase 2: Visual direction

1. Create one composed concept showing palette, detail level, architecture proportions, avatar readability, and location identity.
2. Approve the concept before extracting or producing layer assets.
3. Lock a reference palette and pixel density for every later generation prompt.

### Phase 3: Representative proof slice

1. Produce one far, environment, ground, and modular-prop slice.
2. Integrate the real avatar, walking, jumping, camera, and parallax motion.
3. Review sharpness, density, proportions, sidewalk perspective, prop grounding, avatar readability, and parallax strength.
4. Obtain explicit approval before producing the complete chapter.

### Phase 4: Full chapter assets

1. Produce far and environment sections independently for their depth roles.
2. Generate or edit the ground strip separately from all scenery.
3. Generate close props as isolated sprites rather than baking them into panels.
4. Place large landmarks wholly inside one authored section or author their seam region as a single composite.
5. Add every prop, repeated structure, and endpoint to the world-coordinate manifest.
6. Assign `back` or `walk` depth before runtime integration.

### Phase 5: Asset-first validation

Before opening the game, automated tests and review atlases must verify:

- exact asset dimensions and color modes;
- full opacity of far and ground assets;
- clean transparency and no chroma contamination in sprites;
- identical or visually compatible repeating ground edges;
- clean pavement along the ground asset's top edge;
- one consistent sidewalk seam direction;
- valid prop paths, unique identifiers, and ground anchors;
- exhaustive `back` and `walk` depth partitions;
- complete start/middle/gate/end structure runs;
- no major object crossing an unsafe section boundary;
- endpoint coordinates derived from the final landmark.
- endpoint landmark-band bounds tested separately from low ground spill.

The review atlas must include every authored seam, former panel boundary, fence endpoint, foreground prop class, transition zone, and chapter endpoint. Props are previewed both behind and in front of the avatar according to their declared depth.

### Phase 6: Runtime review

Walk the complete scene rather than reviewing only screenshots or isolated assets.

Required viewports:

- mobile portrait;
- mobile landscape;
- landscape rotated back to portrait;
- desktop wide view;
- any additional breakpoint used by the published site.

At each size, confirm:

- pixel art is sharp and not stretched;
- the canvas is flush with every viewport edge;
- no transparent holes, purple key pixels, floating objects, or repeated background fragments appear;
- sidewalk lines keep the approved perspective;
- props touch the correct ground plane;
- near props occlude the avatar and back props remain behind him;
- fences begin, continue, and end intentionally;
- the camera never reveals beyond authored artwork;
- the final landmark and ground terminate together;
- walking and jumping remain smooth;
- no browser warnings, asset failures, or overflow occur.

### Phase 7: Approval and deployment

1. Show the complete review route before replacing any approved live scene.
2. Correct asset defects at their source instead of masking them in the renderer.
3. Re-run automated and browser verification after every repair.
4. Version every changed module and bitmap URL so mobile caches cannot retain stale artwork.
5. Deploy only after explicit scene approval.
6. Verify the public URL serves the expected manifest, versioned assets, and final commit.

## Failure-Prevention Matrix

| Observed failure | Required prevention |
|---|---|
| Blurry or stretched architecture | Preserve source aspect ratio and use equal x/y scaling. |
| Empty parallax holes | Use independently authored layers; keep the far layer opaque. |
| Large empty scene sections | Approve content rhythm in the proof slice and full-route atlas. |
| Mismatched sidewalk height or texture | Use one ground asset and one shared ground anchor. |
| Alternating sidewalk perspective | Test and approve one seam direction before integration. |
| Greenery or prop fragments repeating at ground level | Keep the ground top edge pavement-only. |
| Purple or transparent plants | Validate alpha and chroma contamination on isolated sprites. |
| Floating props | Require manifest `baseY` anchors and ground-plane tests. |
| Avatar walking over close furniture | Render `walk` props after the avatar. |
| Fence starts and stops abruptly | Build explicit structure runs with start and end components. |
| Highway, airplane, or building split at a seam | Keep major objects within one authored section or author the seam jointly. |
| Highway or road floating in another layer | Keep ground-connected structures in one depth system with a shared anchor. |
| Scene extends beyond the terminal | Derive world width from the final landmark edge. |
| Approved terminal disappears during a repair | Treat landmark preservation as an invariant. |
| Mobile still shows an old repair | Revision every changed bitmap and module URL. |
| Rotation exposes cutoff or empty browser space | Test portrait, landscape, and rotate-back using the visible viewport. |

## Acceptance Gate for Every New Scene

A scene is not ready for publication until all of the following are true:

- The representative proof slice was explicitly approved.
- Every production asset passes automated integrity checks.
- The review atlas contains no unexplained gaps, seams, floating elements, or depth errors.
- The complete scene was walked from its left endpoint to its right endpoint.
- Portrait, landscape, rotate-back, and desktop reviews pass.
- The avatar remains grounded, readable, and correctly occluded throughout.
- Both endpoints align with approved landmarks and contain no empty tails.
- Changed assets use new cache revisions.
- The deployed public route is verified after the hosting build completes.

## Scope and Authority

This document is the single source of truth for reusable autobiographical scene production. Location-specific specifications may add requirements, but they may not weaken these contracts unless the user explicitly approves the exception.

The Houston-specific design and repair documents remain historical evidence of how these rules were derived. Future chapters should reference this standard instead of copying Houston's one-off fixes.
