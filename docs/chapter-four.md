# Chapter 04: St. Louis, Boston, Cincinnati

Route: Gateway Arch and Old Courthouse riverfront → Beacon Hill and the State House dome → Roebling Bridge and Cincinnati riverfront. No airport. This is one combined chapter following Chicago, with bidirectional boundary travel and direct chapter selection.

Art follows the shared 1906 × 825 coordinate system, ground line 735, continuous ground at 665, and curb props at 765. New location furniture is isolated transparent artwork: a St. Louis fleur-de-lis bench, a Boston gas-style lantern, and a Cincinnati river-pattern flower planter. Furniture is confined to its city's part of the route. The independently authored far panorama includes sky, distant rooftops and tree canopy. Its target motion is 12%, capped by available image overscan on wider screens instead of enlarging cloud pixels. Environment movement uses the runtime's endpoint-aligned factor; foreground moves at camera speed. All three replacement environment plates meet the pavement at source y=665.

Artwork lives in `assets/backgrounds/three-cities/`. Production images were generated with the built-in image-generation tool, normalized to binary alpha, trimmed and resized proportionally using nearest-neighbor sampling. The environment plates are positioned at the shared baseline without stretching. Foreground metadata is in `src/three-cities-assets.js`.

## Chapter navigation

Every playable route includes a top-right hamburger button and chapter panel. Buttons are built from `CHAPTERS`, so future chapters appear automatically. The active chapter is marked with `aria-current`. Opening the panel pauses motion and resets held input. Selecting another chapter fades to its left edge with the avatar grounded and stopped, then returns focus to the game. Escape or an outside tap closes the panel; arrow up/down and Home/End navigate chapter choices. The previous heading is removed rather than hidden behind an overlay.

## Verification

`npm test` covers all chapter asset paths, natural forward/backward travel into Chapter 04, direct menu jumps, paused motion, Escape, outside dismissal, focus and selected state. The Python route configuration tests check entry pages. `node tools/render_three_cities.mjs` renders a complete desktop traversal plus portrait, landscape and rotate-back endpoint views using the actual Canvas runtime. The chapter-menu repair was verified in the connected Chrome browser: pointer clicks reached Chicago and Chapter 04, and the original focus race has a regression test. Native phone hardware remains unverified.

## Generation prompts

### st-louis

Use case: stylized-concept. Production environment layer for a richly detailed 16-bit pixel art side-scrolling game, crisp discrete pixel clusters, warm daylight, muted brick and limestone, saturated green foliage, blue-green shadows. Extra wide panoramic composition aspect ratio 3:1. Straight frontal street elevation, not isometric. Genuine transparent background in sky and below all objects. All architecture and landscaping share one straight bottom baseline. No walkable foreground pavement, close props, people, cars, airport, text, labels, watermarks or drop shadows. Complete uncut objects within frame; both side edges end with low shrubs and open transparent space to flow into adjoining city. Distant water can be included at baseline only. Designed to be placed on continuous sidewalk. St. Louis riverfront: the complete tall silver Gateway Arch prominently in the left center, Old Courthouse with green dome at center-right, historic red brick riverfront warehouses farther right, deciduous trees and low planted beds. The Arch is entire and centered safely inside the panel. Clean transparent sky inside the Arch.

### boston

Use case: stylized-concept. Production environment layer for a richly detailed 16-bit pixel art side-scrolling game, crisp discrete pixel clusters, warm daylight, muted brick and limestone, saturated green foliage, blue-green shadows. Extra wide panoramic composition aspect ratio 3:1. Straight frontal street elevation, not isometric. Genuine transparent background in sky and below all objects. All architecture and landscaping share one straight bottom baseline. No walkable foreground pavement, close props, people, cars, airport, text, labels, watermarks or drop shadows. Complete uncut objects within frame; both side edges end with low shrubs and open transparent space to flow into adjoining city. Distant water can be included at baseline only. Designed to be placed on continuous sidewalk. Boston Beacon Hill street: a long elegant row of warm red brick Federal townhouses, varied roofs, stone steps, black shutters, bay windows, leafy street trees, Massachusetts State House golden dome rising behind center-left. All buildings entirely contained. Rich New England neighborhood character. No close street lamps or benches.

### cincinnati

Use case: stylized-concept. Production environment layer for a richly detailed 16-bit pixel art side-scrolling game, crisp discrete pixel clusters, warm daylight, muted brick and limestone, saturated green foliage, blue-green shadows. Extra wide panoramic composition aspect ratio 3:1. Straight frontal street elevation, not isometric. Genuine transparent background in sky and below all objects. All architecture and landscaping share one straight bottom baseline. No walkable foreground pavement, close props, people, cars, airport, text, labels, watermarks or drop shadows. Complete uncut objects within frame; both side edges end with low shrubs and open transparent space to flow into adjoining city. Distant water can be included at baseline only. Designed to be placed on continuous sidewalk. Cincinnati Ohio riverfront: complete blue Roebling Suspension Bridge in left half with both towers and curved cables fully contained within image; historic Over-the-Rhine brick architecture on right half, distant Cincinnati downtown architecture including Carew Tower center-right. Low riverfront gardens connect bridge to architecture on same baseline. Rightmost building complete, no cropped architecture.

### sky

Use case: stylized-concept. Extra wide 3:1 fully opaque pixel-art sky panorama for a side-scrolling game, beautiful light blue daytime sky, sparse finely pixelated white clouds, subtly pale blue atmospheric horizon along bottom. Sky only, no buildings, land, trees, stars, text or sun. Crisp detailed 16-bit game background, restrained cloud density. All edges filled, no transparency.

### st-louis-bench

Use case: stylized-concept. One isolated St Louis riverfront park bench, dark blue cast iron curved arms and legs, warm wood slats, small brass fleur-de-lis medallion in backrest. Frontal side-scroller view slight seat top visible. Detailed crisp 16-bit pixel art warm daylight. Genuine transparent background and gaps, no ground, shadow, scenery, text. Feet share baseline, complete object.

### boston-lamp

Use case: stylized-concept. One isolated Boston Beacon Hill historic gas-style street lamp, slim black iron pole, single square copper lantern with pyramidal cap and pale warm glass, small simple stone foot. Detailed crisp 16-bit pixel art warm daylight. Front elevation, full object, genuine transparent background and gaps, no glow beyond silhouette, ground, scenery, shadow, text.

### cincinnati-planter

Use case: stylized-concept. One isolated Cincinnati riverfront ornamental planter: low wide terracotta red rectangular metal trough on two short dark feet, subtle embossed flowing Ohio River wave decoration, dense bright green foliage and white and red flowers. Detailed crisp 16-bit pixel art warm daylight, straight frontal view, slight top visible. Complete object, genuine transparent background and gaps, no ground, shadow, scenery or text.

Cincinnati was regenerated to keep both bridge approaches inside the panel and retain actual transparent sky; a checkerboard-background candidate was discarded.

## Far-layer and menu repair

The initial empty sky plate is superseded by `far-v2.webp` (2172 × 724). The replacement is one independently generated panorama using the approved Chicago and Bloomington far plates as style references. It adds a finely detailed distant city, rooftops, tree canopy and rolling hills beneath small restrained clouds. The skyline is combined with newly rebuilt environment landmarks and retained location-specific props. No existing scene was cut apart to invent a moving layer.

`farLayerGeometry` preserves the asset's real aspect ratio and authored pixel density. It scales only with the scene or to fit a viewport wider than the artwork, and limits camera travel to the remaining overscan. Coverage tests check start, middle and end positions at portrait, landscape, desktop and wide-desktop sizes. This avoids the old technique of enlarging a single sky to cover both the viewport and all future camera motion.

The menu uses the same 30% dark tint and 7px backdrop blur as the game controls; the panel uses a 48% tint for legible labels. The focusout handler uses `relatedTarget`, not a microtask reading the temporarily unfocused document, so focusing another chapter button does not hide it before its click fires. Selecting the current chapter restarts it at its beginning.

Replacement prompt: match the attached approved far artwork's fine-detail cartoon pixel illustration and blue-green daylight palette; one opaque panoramic far layer with sparse small wispy clouds, distant low-contrast office buildings and warm brick roofs, deciduous tree canopy, and rolling Ohio hills to the right; no foreground architecture, pavement, people or props; no duplicated Arch, State House or Roebling Bridge; fill every edge. Generated with the built-in image-generation tool and saved losslessly without resizing.

## Chicago-reference environment rebuild

The user requested recreation of the complete combined scene. All three environment plates now use version 2, generated with Chicago’s approved `park-v1.webp` as a direct style reference: fine illustrated pixel detail, warm yellow light, rich blue-green shadows, lush foliage, and crisp architectural outlines. The route remains the complete Gateway Arch and Old Courthouse → Beacon Hill and State House → complete Roebling Bridge and Cincinnati architecture, with no airport.

Each plate was authored independently from the opaque far panorama. Generated checkerboard backgrounds were rejected; a targeted built-in image-generation edit replaced the background with flat magenta. The repository’s connected chroma extraction removes the key, including enclosed bridge and Arch gaps, and despills edges. Entire visible bounds are scaled proportionally using nearest-neighbor sampling and seated at y=665 on a 1906×825 transparent plate, with no landmark cropping.

Prompt set: match the Chicago reference style exactly; generate the specified city’s complete landmarks, frontal elevation, flat common baseline, low garden transition edges; exclude sky, foreground pavement, close props, people, cars and airports. Background correction prompt: change only the checkerboard to uniform #FF00FF, including enclosed gaps; preserve artwork and all placement and detail. Built-in image generation was used. Final production files are `st-louis-v2.webp`, `boston-v2.webp`, `cincinnati-v2.webp` and `far-v2.webp` in `assets/backgrounds/three-cities/`.
