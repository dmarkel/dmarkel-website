# Chapter 04: St. Louis, Boston, Cincinnati

Route: Gateway Arch and Old Courthouse riverfront → Beacon Hill and the State House dome → Roebling Bridge and Cincinnati riverfront. No airport. This is one combined chapter following Chicago, with bidirectional boundary travel and direct chapter selection.

Art follows the shared 1906 × 825 coordinate system, ground line 735, continuous ground at 665, and curb props at 765. New location furniture is isolated transparent artwork: a St. Louis fleur-de-lis bench, a Boston gas-style lantern, and a Cincinnati river-pattern flower planter. Furniture is confined to its city's part of the route. The independently authored sky moves at 12%; environment movement uses the runtime's endpoint-aligned factor; foreground moves at camera speed. Cincinnati's river edge overlaps the pavement by 40 source pixels to avoid exposed sky beneath the shoreline.

Artwork lives in `assets/backgrounds/three-cities/`. Production images were generated with the built-in image-generation tool, normalized to binary alpha, trimmed and resized proportionally using nearest-neighbor sampling. The environment plates are positioned at the shared baseline without stretching. Foreground metadata is in `src/three-cities-assets.js`.

## Chapter navigation

Every playable route includes a top-right hamburger button and chapter panel. Buttons are built from `CHAPTERS`, so future chapters appear automatically. The active chapter is marked with `aria-current`. Opening the panel pauses motion and resets held input. Selecting another chapter fades to its left edge with the avatar grounded and stopped, then returns focus to the game. Escape or an outside tap closes the panel; arrow up/down and Home/End navigate chapter choices. The previous heading is removed rather than hidden behind an overlay.

## Verification

`npm test` covers all chapter asset paths, natural forward/backward travel into Chapter 04, direct menu jumps, paused motion, Escape, outside dismissal, focus and selected state. The Python route configuration tests check entry pages. `node tools/render_three_cities.mjs` renders a complete desktop traversal plus portrait, landscape and rotate-back endpoint views using the actual Canvas runtime. Chromium could not be downloaded in the build environment, so full-browser visual and touch-device checks remain unverified.

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
