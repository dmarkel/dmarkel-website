# Three-Layer Scene System Design

## Goal

Replace the current seven extracted Houston masks with a sharp, cinematic, restrained three-layer scene system that can be reused for later autobiographical chapters.

The first implementation covers a representative Lamar High School to downtown Houston slice. It must prove visual quality and responsive behavior before the remainder of the Houston-to-IAH journey is produced or the live site is changed.

## Why the Current System Fails

The current runtime independently stretches 1906 × 825 source plates to widths between the viewport and the 5200-pixel world while forcing every plate to the viewport height. This changes the source aspect ratio, softens pixel detail, and distorts architecture.

The seven plates were extracted from one flattened illustration. Moving those cutouts at different speeds exposes the removed regions as large areas of empty sky. More parallax makes those gaps more visible rather than creating convincing depth.

The replacement must fix the source architecture, not disguise the symptoms.

## Approved Visual Direction

The scene uses three purpose-built layers with cinematic, restrained motion:

1. **Far — 12% camera speed.** A fully painted, opaque panorama containing sky, clouds, distant neighborhoods, the Houston skyline, and the airport horizon. It covers every pixel from the beginning to the end of the scene, so layer motion can never reveal an empty hole.
2. **Environment — 38% camera speed.** Independently illustrated Lamar buildings, streets, neighborhoods, downtown structures, freeway transitions, terminal buildings, and aircraft. It is created for this depth plane rather than extracted from the far panorama.
3. **Foreground — 100% camera speed.** A continuous walkable sidewalk plus nearby trees, fences, poles, signs, landscaping, airport barriers, and other close details. Foreground objects are spaced to create rhythm without repeatedly hiding the avatar.

The three layers form one continuous Lamar → downtown Houston → freeway approach → IAH journey. They retain the approved high-detail cartoon pixel-art style, bright daytime palette, and avatar scale.

## Artwork Production

Artwork is produced as connected native-resolution sections rather than one image stretched across the complete world. Each section includes transition buffers and shared edge anchors so neighboring sections join without visible seams.

The Houston chapter is divided into:

- Lamar High School
- Neighborhood and downtown transition
- Downtown and freeway approach
- IAH terminal arrival

Every section provides the same three layer roles. The far section is always opaque. Environment and foreground assets may contain transparency only where the complete far panorama intentionally shows through.

The layers are created independently. Existing flattened artwork may guide composition and palette, but it may not be split into moving cutout masks.

## Rendering Contract

- Horizontal and vertical scale must always be equal.
- Short landscape viewports crop vertically around the ground line instead of compressing the artwork.
- Canvas image smoothing remains disabled.
- Camera progress is normalized across the playable scene, so rotation preserves the player's journey position even when responsive cropping changes.
- The sidewalk and collision floor use the same authored ground reference.
- Layers begin and end on shared scene anchors while moving at their approved depth rates.
- The avatar remains readable against every section and is never permanently occluded by foreground artwork.

## Proof-Slice Approval Gate

Before producing the complete Houston chapter, build one representative playable slice containing:

- A complete opaque far panorama
- A separately illustrated Lamar/downtown environment
- A foreground sidewalk with nearby trees and fencing
- The real walking and jumping avatar
- The approved 12% / 38% / 100% motion relationship

The proof slice is reviewed in desktop, portrait mobile, landscape mobile, and live landscape-to-portrait rotation. The user approves its sharpness, density, proportions, and motion before full-scene production begins.

The current live background remains in place until the proof slice and then the full replacement are approved. Preview work uses a separate local or review surface.

## Acceptance Tests

Automated tests must reject:

- Unequal horizontal and vertical scaling
- Any transparent pixel in the far layer
- Missing foreground sidewalk coverage
- Incorrect panel or layer dimensions
- Scene geometry that exposes areas outside authored artwork
- Mobile overflow, rotation cropping, or stale viewport dimensions

Browser review must confirm:

- Pixel details remain crisp at desktop and mobile sizes
- Buildings and circular objects retain their proportions
- No empty scenery gaps appear while walking through the full slice
- Layer motion is visible but restrained
- The avatar walks and jumps smoothly without foreground obstruction
- The canvas stays flush with every viewport edge after rotation
- No asset-load or console errors occur

If an asset fails to load, the runtime shows a readable error state rather than starting with missing scenery.

## Reusable Scene-Pack Protocol

Every future autobiographical scene follows this protocol:

1. Define the chapter's locations, emotional tone, time of day, and continuous route.
2. Create and approve a composed visual direction.
3. Define the far, environment, and foreground responsibilities.
4. Produce one representative three-layer proof slice.
5. Test the slice in motion on desktop, portrait, landscape, and rotation.
6. Obtain explicit user approval for sharpness, density, proportions, and parallax strength.
7. Extend the approved system across the complete chapter using connected sections.
8. Run automated asset, geometry, physics, viewport, and loading tests.
9. Review the complete chapter before changing the live site.
10. Deploy only the approved scene pack and verify the public URL.

This protocol is part of the repository's design contract and applies to Houston and later chapters unless the user explicitly changes it.

## Scope

The next implementation produces only the representative Houston proof slice and its preview integration. Completing every Houston section, adding narrative interactions, and designing later autobiographical chapters are separate approval-gated phases.
