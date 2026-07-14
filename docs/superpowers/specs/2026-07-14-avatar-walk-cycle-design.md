# Avatar Walk Cycle Design

## Goal

Create a smooth, relaxed, natural right-facing walk cycle for the approved autobiographical avatar. This phase produces only the walk-cycle sprite strip and an animated review preview. Jump animation and interactive HTML controls remain separate phases.

## Canonical Appearance

Use `assets/avatar/avatar-master-v1.png` as the sole source for the character's identity and design. Every frame must preserve the approved face, dark side-parted hair, skin tone, compact adult proportions, navy short-sleeve polo, bare forearms, pale blue-gray cargo pants, cargo-pocket placement, and black sneakers with white midsoles. Do not add a backpack, straps, accessories, or new clothing details.

## Frame Layout

- Eight right-facing frames arranged as a horizontal transparent sprite strip.
- Each frame occupies one 64 × 96 logical-pixel cell.
- All frames share the same baseline, visual scale, palette, outline weight, and character proportions.
- The logical frame sequence is contact, recoil, passing, high point, opposite contact, opposite recoil, opposite passing, opposite high point.
- Left-facing movement will mirror the approved right-facing strip at render time; it does not require a second asset.

## Motion

The stride is relaxed and natural rather than exaggerated. Arms swing opposite the legs. The torso rotates subtly, and the head remains visually stable. Vertical movement is limited to one or two logical pixels. Hair, polo sleeves, polo hem, and cargo fabric react only slightly.

During each contact phase, the planted foot must remain anchored to the ground as the body travels over it. Foot placement and consistent baselines must prevent sliding or skating. Transitions must form a seamless loop from frame eight back to frame one.

## Production Method

Build four distinct key poses—contact, recoil, passing, and high point—then derive the opposite-leg half of the cycle while preserving the character's identity and pixel clusters. Generate or pose the sequence as one coherent sheet rather than as unrelated images. Normalize every cell and manually correct alignment, outline continuity, palette drift, facial drift, limb length, clothing details, and planted-foot placement before review.

## Preview Timing

- Preview the artwork at 10 animation frames per second.
- Enlarge the preview only with nearest-neighbor scaling.
- Animation timing is independent of the later 60 FPS movement and physics loop.
- Provide both the transparent sprite strip and a looping animated preview.

## Acceptance Criteria

- The cycle contains exactly eight equally sized 64 × 96 logical-pixel cells.
- The loop reads as relaxed and natural at 10 frames per second.
- The character remains recognizably identical across every frame.
- Head position is stable and vertical bounce never exceeds two logical pixels.
- Arms swing opposite the legs without intersecting the torso unnaturally.
- At least one foot is convincingly planted during each contact phase, with no visible skating.
- The baseline, scale, outline, palette, face, hair, polo, cargo pants, pockets, hands, and shoes remain consistent.
- No backpack, straps, accessories, scenery, text, cast shadow, or background appears.
- Frame eight transitions cleanly back to frame one.
