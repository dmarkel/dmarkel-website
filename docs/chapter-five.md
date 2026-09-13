# Chapter 05: Austin, Texas

Route: South Congress Avenue → downtown and the Texas State Capitol → the University of Texas Tower. No airport.

The chapter follows the shared 1906 × 825 geometry, environment baseline 665, and curb-prop baseline 765. Its independent far layer contains a fine-cloud Austin skyline, live-oak canopy, and Hill Country terrain. Three transparent environment plates contain the route landmarks. The continuous journey ground is reused, while all furniture is Austin-owned: lone-star cedar benches and bat-shaped bicycle racks.

Artwork lives in `assets/backgrounds/austin/`; scene metadata lives in `src/austin-scene.js`. The far layer is fully opaque and uses detail-preserving 12% parallax. Environment plates use 38% parallax. Foreground props move at camera speed and render on the walk plane.

## Production prompts

Built-in image generation was used with Chicago's approved artwork as style references. Shared direction: finely detailed luminous illustrated 16-bit pixel art, crisp architectural edges, warm golden daylight, deep blue-green shadows, and lush foliage; straight frontal elevation; complete objects on a shared baseline; no airport, people, cars, readable text, or watermarks.

- Far: Austin downtown skyline, restrained wispy clouds, live-oak canopy, and rolling Hill Country; opaque edge-to-edge artwork.
- South Congress: colorful low-rise storefronts, limestone and painted brick, abstract murals, awnings, live oaks, and desert plants.
- Capitol: complete pink-granite Texas Capitol and formal gardens with downtown blocks behind.
- UT: complete limestone Main Building and clock tower with Mediterranean Revival campus buildings.
- Bench: isolated cedar-and-steel bench with a small lone-star medallion.
- Rack: isolated dark steel bat-shaped bicycle rack with copper accents.

Generated transparent environment candidates arrived with checkerboard pixels baked into RGB. A targeted built-in image edit replaced only those backgrounds with a flat magenta key; the repository's connected-chroma extraction then removed the key before proportional nearest-neighbor normalization. Environment plates are seated at y=665; prop alpha is normalized and each sprite's last row is its baseline.

## Verification

Run `npm test`, the Python route checks, and `node tools/render_three_cities.mjs <output> ../src/austin-scene.js AUSTIN`. Review the complete desktop traversal plus portrait, landscape, and rotate-back frames. Verify the public chapter menu can enter Austin and return to earlier chapters.
