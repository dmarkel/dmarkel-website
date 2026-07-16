# Houston Depth and Airport Corrections Design

**Goal:** Correct floating foreground props, visible sidewalk repetition, the sparse middle transition, the floating airport roadway, and the airport art ending before the walk ends.

## Root Causes

1. Small street props and the avatar use different ground planes. The props are currently anchored at source y=665 while the avatar walks at source y=735, producing a 70-pixel apparent gap.
2. The opaque sidewalk uses a 400-pixel mirrored tile. Its weeds, cracks, drain, and curb details therefore repeat every 400 source pixels.
3. The iron fence ends at x=3200 and the airport fence begins at x=4700. The open span has isolated props but no continuous low near-environment element, leaving an artificial depth gap.
4. Elevated highways and curving roads are baked into `environment-02.png`; when seen behind the modular foreground they have no continuous supports and read as floating.
5. The environment layer uses a fixed 0.38 factor. At the world endpoint it displays only through about source x=1233 of the second 1906-pixel panel, leaving roughly 673 pixels of the airport artwork unreachable.

## Grounding Contract

The scene has two explicit source-space ground planes:

- **Back edge, y=665:** iron fence, chain-link fence, terminal architecture, and the new middle verge.
- **Walking plane, y=735:** planter, bench, utility cabinet, bike rack, bollards, and street lamps.

Every manifest asset must declare `plane: "back"` or `plane: "walk"`; `buildHoustonForeground()` resolves that plane to its ground y. Raw small-prop entries may no longer duplicate a numeric y value.

## Long Ground Strip

Replace `ground-tile.png` with `ground-strip.png`, sized 3812 × 160. Build it from the complete 1906-pixel ground section of the clean second foreground and its horizontal mirror. It remains fully opaque, its outer columns match exactly, and it repeats only once across the 7624-pixel world. Rendering continues to cull offscreen strips and uses nearest-neighbor scaling.

## Middle Verge

Add one transparent `middle-verge.png` spanning x=3200 through x=4700 and grounded at y=665. It contains continuous restrained low landscaping, occasional short masonry edging, and small neutral details. It contains no fence, highway, large sign, purple flowers, sidewalk, cast shadow, or object crossing either endpoint. Existing walking-plane props render in front of it.

## Road-Free Airport Environment

Replace `environment-02.png` in production with `environment-02-v2.png`, maintaining the approved 1906 × 825 frame and transparent sky. The replacement transitions from low Houston commercial buildings to IAH terminal architecture and airport landscaping. It includes no elevated freeway, overpass, floating access road, airplane, balloons, or oversized object at its left edge.

The environment panels remain native-resolution and are never horizontally stretched.

## Endpoint-Aligned Environment Parallax

Compute the environment factor from the current viewport and scaled dimensions:

`factor = (environmentStripWidth - viewportWidth) / (worldWidth - viewportWidth)`

Clamp the result to 0..1. With two 1906-pixel panels, this aligns the left edge of panel one at the journey start and the right edge of panel two at the journey endpoint. The full second airport panel therefore becomes reachable. The far layer keeps its restrained 0.12 factor so the skyline still moves more slowly and the scene retains visible depth.

## Verification

- Manifest tests enforce the two plane assignments and resolved y values.
- Geometry tests enforce endpoint alignment without scaling or panel gaps.
- Asset tests enforce the 3812 × 160 opaque seamless ground strip, binary prop alpha, and zero magenta contamination.
- Route tests enforce the new environment and ground asset versions.
- A mobile atlas covers x=3200, 3812, 4700, 5718, 6250, 7000, 7400, and the exact endpoint.
- Browser checks cover 390 × 844, 844 × 390, and return to portrait with zero overflow or console errors.

## Reusable Scene Protocol

Future scenes must define explicit back and walking planes, use one long opaque ground strip rather than a short obvious tile, keep transition fillers as single continuous assets, exclude unsupported roads from parallax layers, and endpoint-align every layer whose complete narrative content must be visited.
