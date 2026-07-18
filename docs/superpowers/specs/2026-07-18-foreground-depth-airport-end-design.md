# Foreground Depth and Airport Endpoint Design

## Goal

Correct two related spatial problems in the Houston chapter:

1. Close sidewalk props must pass in front of the avatar so he no longer appears to walk on top of them.
2. The journey must stop at the existing airport terminal's right edge instead of continuing into empty space.

The terminal building must remain intact. It must not be removed, cropped, replaced, or shifted.

## Confirmed root causes

`drawScene` currently paints every modular prop before `drawPlayer`. The avatar is therefore always drawn on top of planters, benches, street lamps, cabinets, bike racks, and bollards even though those props are already classified on the `walk` plane.

The world width is currently fixed at four 1,906-pixel panels, or 7,624 source pixels. The airport terminal begins at source x 6,450 and is 1,068 pixels wide, so its frame ends at source x 7,518. The remaining 106 source pixels become a visibly larger empty endpoint after responsive scaling.

## Approved rendering model

Keep the existing `back` and `walk` plane metadata and use it for paint order.

The frame renders in this order:

1. Far and environment layers
2. Shared ground strip
3. Back-plane props
4. Avatar shadow and sprite
5. Walk-plane props

Back-plane props include the Lamar fence, airport fence, middle verge, and airport terminal. They remain behind the avatar.

Walk-plane props include both planters, both street lamps, the bench, electrical cabinet, bike rack, and bollards. Their complete images render after the avatar, so they occlude both the sprite and its shadow wherever their pixels overlap.

This is a deterministic side-scroller layering rule. It does not add free-depth movement, y-sorting, or collision with decorative props.

## Foreground data interface

`buildHoustonForeground` will continue returning the complete `props` array for compatibility and tests. It will additionally return:

- `backProps`: every grounded prop whose declared plane is `back`
- `frontProps`: every grounded prop whose declared plane is `walk`
- `endSourceX`: the airport terminal prop's source x plus the terminal asset width

The partition must be exhaustive and exclusive: every prop appears exactly once across `backProps` and `frontProps`, and neither list may contain an unknown plane.

The endpoint anchor is the prop with id `airport-terminal`. Building the foreground must throw a descriptive error if that prop or its asset definition is missing, rather than silently falling back to the old width.

## Airport endpoint

The source-space endpoint is derived from existing manifest data:

```text
airport-terminal x + terminal width = 6450 + 1068 = 7518
```

On resize, the game world width becomes `FOREGROUND.endSourceX * scene.scale`. Player clamping, camera clamping, ground tiling, and endpoint-aligned environment parallax all consume that scaled world width.

At maximum travel:

- the terminal asset's right frame edge aligns with the viewport's right edge;
- the sidewalk and road stop on the same world boundary;
- the avatar cannot walk into the old empty tail;
- the full terminal remains visible and unchanged.

The environment layer continues using `endpointAlignedFactor`, now calculated against the terminal-derived world width, so its own right edge still aligns at the journey endpoint.

## Canvas structure

Introduce one shared prop-drawing function that accepts a prop collection and retains the existing transform, culling, mirroring, and image-drawing behavior.

`drawScene` draws the parallax layers, ground, and `backProps`. The animation frame then calls `drawPlayer`, followed by the prop-drawing function with `frontProps`. This changes only paint order; prop positions, sizes, images, mirroring, and ground planes remain unchanged.

## Cache delivery

Increment the Houston module cache key from `chapter-7` to `chapter-8` for the HTML entry module and all changed dependency edges. This ensures mobile and desktop browsers receive the new manifest and render-order code.

## Automated verification

Add tests that prove:

- every `back` prop is returned in `backProps` and no `walk` prop is;
- every `walk` prop is returned in `frontProps` and no `back` prop is;
- the two collections contain every prop exactly once;
- the named planters, lamps, bench, cabinet, bike rack, and bollards are front props;
- fences, middle verge, and terminal are back props;
- `endSourceX` equals 7,518 and is derived from the unchanged terminal position and width;
- the Houston route uses the manifest endpoint rather than `scene.width * 4`;
- the chapter-8 cache key is present throughout the changed module graph.

All existing physics, camera, viewport, foreground asset-integrity, alpha, and chapter tests must continue passing.

## Visual verification

Inspect the running game at mobile portrait, mobile landscape, portrait after rotation, and desktop sizes.

Required checkpoints:

1. Walk the avatar behind each class of close sidewalk prop and confirm the prop occludes him.
2. Confirm fences and the terminal remain behind him.
3. Walk to the maximum right endpoint and confirm the viewport ends exactly at the terminal frame edge with no empty tail.
4. Confirm the terminal is complete, the airport background reaches the endpoint, and the sidewalk remains flush with the bottom.
5. Confirm there are no browser console errors or warnings.

## Non-goals

- Do not edit or regenerate any raster artwork.
- Do not remove, crop, shift, or resize the airport terminal.
- Do not change avatar sprites, movement physics, jumping, input controls, or animation timing.
- Do not add prop collision, multiple walk lanes, or dynamic y-sorting.
- Do not change the approved 80-source-pixel Lamar environment offset.
