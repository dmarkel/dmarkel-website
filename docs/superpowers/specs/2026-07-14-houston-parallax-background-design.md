# Houston Parallax Journey — Visual Design

## Goal

Create a bright-daytime, high-detail cartoon pixel-art panorama for the autobiographical side-scroller. The continuous scene begins at Lamar High School, passes through a stylized Houston urban journey with downtown as its central landmark, and arrives at George Bush Intercontinental Airport (IAH). The first deliverable is a flattened concept panorama for visual approval. After approval, the same composition will be rebuilt as independently scrolling parallax layers and integrated into the playable stage.

## Art Direction

- Match the approved avatar's high-detail cartoon pixel style: deliberate square pixels, dark selective outlines, compact color ramps, readable silhouettes, and expressive but non-photorealistic detail.
- Maintain clear, bright daytime lighting across the full journey. Use a humid pale-blue Houston sky, sunlit warm masonry and concrete, saturated but controlled greenery, and blue-gray atmospheric distance.
- Avoid photorealism, painterly blur, smooth vector shapes, generic cyberpunk styling, tiny unreadable text, watermarks, and inconsistent pixel scales.
- Keep the avatar as the visual scale reference. Background details should support the character rather than compete with the character's face and clothing.

## Continuous Panorama

The panorama reads from left to right without chapter cards or hard cuts:

1. **Lamar High School:** recognizable red-brick institutional architecture, broad windows, mature live-oak-like trees, fencing, a school-zone streetscape, and landscaped grounds.
2. **Upper Kirby transition:** neighborhood trees, low commercial and residential forms, utility details, street furniture, and roadway cues gradually increase in density.
3. **Downtown Houston:** a distinctly Houston-shaped cluster of layered skyscrapers rises through the center. Freeway structures, signs without important baked-in text, and humid atmospheric haze bridge the neighborhood and downtown.
4. **Airport approach:** downtown recedes into freeway interchanges, open sky, airport approach lighting, perimeter fencing, service roads, and aircraft silhouettes.
5. **IAH arrival:** runway infrastructure, a control-tower or airport operations silhouette, a modern terminal frontage, jet bridges or aircraft elements, and a clear arrival endpoint.

A single continuous pavement/platform band spans the foreground so the eventual avatar can walk the entire route without visual discontinuity.

## Seven-Layer Parallax Architecture

1. **Sky gradient:** full-width daylight color field; fixed or nearly fixed.
2. **Clouds and atmospheric haze:** broad cloud groups and Houston humidity; very slow movement.
3. **Far landmarks:** distant skyline silhouettes, remote aircraft, and far airport structures; slow movement.
4. **Primary architecture:** Lamar, nearer downtown buildings, freeway structures, and IAH terminal masses; moderate movement.
5. **Near environment:** trees, fencing, roadside structures, runway equipment, and street furniture; medium-fast movement.
6. **Foreground accents:** large tree trunks, poles, signs, barriers, and occasional framing objects; fast movement.
7. **Walkable ground:** pavement, curb, runway/service-road textures, shadows, and contact line; tracks closest to player/world movement.

The layer speeds will be visibly separated but restrained enough to avoid motion sickness. The strongest contrast occurs between far landmarks and foreground accents, giving the scene an impressive sense of depth on both desktop and mobile.

## Concept Preview

- Produce one wide flattened panorama that demonstrates the entire route and all intended depth planes.
- Show the approved avatar once at ground level for scale; do not redesign or alter the avatar.
- Preserve negative space around the avatar path and keep all essential landmarks above the walkable band.
- The concept is for review only. It is not treated as the final production background because convincing parallax requires separately authored transparent layers.

## Production Constraints

- All final parallax assets must tile or overlap without visible seams at supported viewport sizes.
- Transparent layers must have clean alpha edges with no chroma spill.
- Pixel edges remain crisp with Canvas image smoothing disabled.
- Layer dimensions and movement factors must support portrait and landscape mobile viewports without exposing empty edges.
- The current playable background remains unchanged until the concept and separated layers are explicitly approved.

## Review Criteria

The concept succeeds when:

- Lamar, downtown Houston, and IAH are immediately distinguishable in one continuous world.
- The art looks native to the approved avatar rather than like a separate illustration style.
- The intended seven depth planes are easy to identify before animation.
- The ground reads as one uninterrupted route.
- The scene feels rich and cinematic while leaving the avatar visually dominant.
