# Chicago foreground artwork

Chicago owns its apartment, bench, lamp, and rack sprites in `assets/backgrounds/chicago/`. The shared ground strip and geometry preserve the continuous journey surface; location furniture must never alias another chapter's assets.

Generated with the built-in image generation tool, then trimmed to opaque object bounds, normalized to binary alpha and resized proportionally with nearest-neighbor sampling. Final files: `bench-v1.webp` (180 × 77), `lamp-v1.webp` (104 × 299), `rack-v1.webp` (76 × 96). The manifest uses the last sprite row as the baseline and the existing curb plane at source y=765.

## Generation prompts

Shared direction: production transparent sprite for a detailed pixel-art Chicago side-scrolling website; crisp detailed 16-bit pixel art, discrete pixel clusters, restrained warm daylight highlights, dark blue-green shadows. Object only, fully visible with small empty margin, genuine transparent alpha background including gaps, no ground, scenery, external cast shadow, text or checkerboard.

- Bench: isolated Chicago Lincoln Park bench, honey wood horizontal slats, forest green cast iron legs and curved armrests, subtle six-point red Chicago star medallion on the center backrest; wide frontal side-scroller view with slight seat top visible and feet sharing a baseline.
- Lamp: isolated Chicago boulevard double-globe streetlight, tall dark green fluted cast iron pole, ornate symmetrical curved arms, two cream white round globes, stepped cast iron foot; full-height frontal side-scroller view.
- Rack: isolated Chicago sidewalk bicycle rack, brushed blue-gray steel inverted U hoop, circular central medallion with red six-point Chicago star, grounded feet sharing a baseline; frontal view, no bicycles.

## Verification

Run `npm test`, the Python route configuration tests documented in `adding-scenes.md`, and `node tools/render_chicago.mjs`. Review the desktop traversal and portrait, landscape, and rotate-back output. Chicago's foreground ownership regression test prevents furniture from being borrowed from other chapters.
