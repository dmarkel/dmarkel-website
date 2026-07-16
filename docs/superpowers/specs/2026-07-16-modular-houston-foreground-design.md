# Modular Houston Foreground Design

## Goal

Replace the four independently authored Houston foreground panels with one continuous modular foreground system. The new system must guarantee sidewalk alignment, intentional fence continuity, grounded props, clean transparency, and a reusable protocol for future autobiographical scenes.

## Root Cause

The current foreground is composed from four separate 1906 × 825 images. Each image contains its own sidewalk, curb, fence, plants, and street furniture. Although the images share nominal dimensions, their perspective lines, colors, textures, and object boundaries were authored independently.

Measured ground-color discontinuities average 45.9 RGB levels at the panel-two-to-three boundary and 36.8 levels at the panel-three-to-four boundary. The current middle panel also contains 3,638 visible magenta-dominant pixels. Fence types and heights change directly on panel boundaries.

These defects cannot be reliably eliminated with additional edge patches because the panel boundary remains part of the foreground architecture.

## Architecture

The far and environment parallax layers remain unchanged. The existing baked `foreground` panel layer is replaced by two factor-1 layers:

1. A seamless ground layer drawn repeatedly across the complete world width.
2. A modular prop layer drawn from a world-coordinate manifest.

The world remains four source-panel widths long. Foreground props are no longer grouped or clipped by those widths; they may be positioned anywhere in the continuous world coordinate system.

## Seamless Ground

The ground asset contains the sidewalk, paving joints, curb, drainage channel, and road edge. It is an opaque, horizontally tileable bitmap with identical first and last pixel columns.

The ground tile is repeated from world x=0 through the complete world width. Every repetition uses the same source height and vertical anchor. The player walking line remains source y=735, placing the avatar's shoes on the sidewalk surface.

Drains, weeds, cracks, and paving joints are included in the ground tile at restrained intervals. No prop, fence, planter, cabinet, or building is baked into the ground asset.

## Modular Props

Foreground objects are transparent PNG sprites loaded and positioned through `src/houston-foreground.js`. Each manifest entry contains:

- a stable identifier;
- an asset path;
- world x position in source pixels;
- source y position;
- source width and height;
- a `baseY` anchor measured within the sprite;
- optional horizontal mirroring.

The first Houston prop set includes low planters, utility cabinets, a bench, a bike rack, bollards, a street lamp, iron-fence components, and airport-perimeter fence components. Props retain the approved high-detail cartoon pixel-art style.

Every freestanding prop has a declared `baseY` anchor aligned within eight source pixels of the scene's sidewalk-object line at source y=665. No prop may float against the environment layer.

## Fence Runs

Fences are assembled from explicit components rather than cropped panel fragments:

- start post;
- repeatable middle segment;
- one gate segment in the Lamar iron-fence run;
- end post.

The scene manifest defines each fence run by world start and end coordinates. A run must end with an end post before a different fence type begins. Iron fencing is used around Lamar and the downtown residential transition and contains one explicit gate. Airport chain-link fencing begins later as a separate run with its own start post and contains no gate in this chapter. There is a deliberate open streetscape between the two fence systems.

No fence may start, stop, change height, or change style because of an invisible 1906-pixel panel boundary.

## Transparency and Color

New prop sprites use border-connected chroma extraction. Large enclosed background regions are removed, subject colors enclosed within props remain opaque, and key spill is neutralized only along extracted edges.

The final production sprites must not contain visible chroma-key magenta. Purple flowers are excluded from this Houston prop set so that magenta-dominance tests can treat remaining purple contamination as an extraction failure rather than intentional art. A visible pixel fails this check when alpha is greater than zero, both red and blue exceed 90, and `min(red, blue) - green` exceeds 35.

Sprites use binary alpha for crisp pixel edges except where an explicitly approved translucent material requires partial alpha. This prop set contains no translucent materials.

## Rendering

`src/houston-game.js` loads the seamless ground tile and every unique prop asset. During each frame:

1. Far and environment layers render with their current parallax factors.
2. The ground tile repeats at factor 1 and anchors to source y=665.
3. Modular props render at factor 1 using their continuous world positions.
4. The avatar renders last, with feet aligned to source y=735.

Only tiles and props intersecting the viewport are drawn. Image smoothing remains disabled.

## Validation

Automated checks enforce:

- identical left and right columns on the ground tile;
- fully opaque ground pixels;
- a stable ground height and walking line of 735;
- zero magenta-dominant production pixels under the exact color rule defined above;
- binary alpha on every prop sprite;
- valid manifest paths and unique prop identifiers;
- visible base anchors for freestanding props;
- fence runs composed from start, middle, optional gate, and end components;
- no fence transition at the old panel boundaries;
- unchanged homepage files.

Visual verification renders the complete world at critical positions including every former panel boundary, both fence endpoints, the open transition between fence systems, the middle streetscape, and the airport entrance. Portrait, landscape, and rotate-back browser checks remain required before publication.

## Future Scene Protocol

Future chapters use the same separation of concerns:

- one seamless ground tile per surface type;
- reusable prop sprites;
- a continuous world-coordinate manifest;
- explicit start and end components for repeated structures;
- no large environmental object baked across an arbitrary image boundary.

This protocol allows a chapter to change scenery without reintroducing sidewalk seams or clipped foreground objects.

## Scope

This rebuild changes only the Houston review route, new Houston modular assets, and focused foreground rendering code. The far and environment artwork, avatar animation sheets, movement physics, jump behavior, and homepage remain unchanged.
