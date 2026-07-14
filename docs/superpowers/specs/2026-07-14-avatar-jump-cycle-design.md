# Avatar Jump Cycle Design

## Goal

Create a readable right-facing jump cycle for the approved avatar. The airborne silhouette uses one raised leading fist in the spirit of a classic platform-game jump gesture without copying another character's appearance, clothing, proportions, or artwork.

## Canonical Appearance

Use `assets/avatar/avatar-master-v1.png` and the approved walk-cycle assets as the only character-design references. Preserve the face, dark side-parted hair, skin tone, compact adult proportions, navy short-sleeve polo, bare forearms, pale blue-gray cargo pants, cargo pocket, and black sneakers with white midsoles. Do not add a backpack, straps, accessories, scenery, or character-specific elements from another game.

## Jump States

The right-facing sprite strip contains five 64 × 96 logical-pixel cells:

1. **Takeoff:** knees compress, torso leans slightly forward, and the leading fist begins rising.
2. **Ascent:** body extends upward, leading fist reaches above the head, trailing arm angles down and back, and feet leave the ground.
3. **Apex:** leading fist is fully raised, trailing arm remains lowered for balance, and both knees tuck slightly to create the clearest airborne silhouette.
4. **Descent:** leading fist begins lowering, legs extend toward the ground, and the trailing arm moves outward for balance.
5. **Landing:** both feet reconnect with the baseline, knees compress to absorb impact, and the arms return toward the neutral pose.

The raised fist stays overhead throughout ascent and apex, then lowers during descent. Left-facing jumps mirror the approved right-facing strip at render time.

## Runtime Timing

The game will select jump frames from physical state rather than cycling them at a fixed animation rate:

- Takeoff plays when the jump begins.
- Ascent is active while vertical velocity is strongly upward.
- Apex is active near zero vertical velocity.
- Descent is active while vertical velocity is downward.
- Landing plays briefly after ground contact before returning to idle or walking.

This state-driven timing prevents animation from drifting out of sync with the jump arc.

## Asset Production

Generate all five poses as one coherent source sheet so identity, proportions, outline, and palette remain consistent. Normalize the poses into a 320 × 96 transparent horizontal sprite strip. Produce an enlarged nearest-neighbor animated preview that pauses briefly at the apex and landing for review.

Use a flat chroma-key source followed by soft-matte removal, despill, and a one-pixel edge contraction. Verify that the final strip and every preview frame contain no visible green-dominant pixels. Keep crisp, hard pixel edges after removal.

## Acceptance Criteria

- Exactly five equally sized 64 × 96 right-facing cells appear in the required order.
- The approved character remains recognizable and consistent across all poses.
- One leading fist is visibly raised above the head during ascent and apex.
- The other arm stays lowered or angled backward to strengthen the silhouette.
- Knees compress at takeoff and landing, tuck slightly at the apex, and extend during descent.
- The jump reads clearly at game scale without resembling a frozen standing pose.
- The baseline, scale, outline, palette, face, hair, polo, pants, pocket, hands, and shoes remain consistent.
- No backpack, straps, accessories, extra or missing limbs, scenery, text, shadow, reflection, chroma fringe, or background appears.
- The final PNG has alpha, and zero visible green-dominant pixels remain in the strip or animated preview.
