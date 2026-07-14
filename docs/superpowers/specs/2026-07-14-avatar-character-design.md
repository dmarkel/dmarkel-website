# Autobiographical Website Avatar — Character Design

## Goal

Create one polished, right-facing master character based closely on the supplied identity photo. A second supplied pixel-art image controls only the amount of detail, pixel density, and degree of cartoon simplification. This first asset is for visual approval before any walk or jump animation frames are produced.

## Visual Direction

- Chunky raster pixel art with crisp, intentionally placed pixels and no vector-like shapes.
- Compact cartoon proportions with a moderately enlarged head and hands, while still reading as an adult rather than a chibi child.
- Right-facing side profile with a slight three-quarter view of the face so the subject remains recognizable.
- Friendly, neutral expression and relaxed standing pose.
- Approximately 48 × 80 logical pixels, enlarged for review with nearest-neighbor scaling.
- Bold dark outline, large readable pixel clusters, and minimal shading using roughly three or four shades per material.
- The style-density reference controls only chunkiness, simplification, and detail level. Do not borrow its blue hair, glasses, orange hoodie, pose, background color, or other character-specific traits.

## Identity and Clothing

The original photograph is the sole identity and outfit source. Preserve the subject's dark side-parted hair, recognizable facial structure, skin tone, and overall build while translating them into the approved cartoon proportions.

The outfit consists of:

- Navy short-sleeve polo with sleeves visibly ending above the elbows.
- Bare forearms.
- Pale blue-gray cargo pants with readable pocket details.
- Black athletic sneakers with white midsoles.

Do not include a backpack, backpack straps, accessories, text, scenery, cast shadow, or reflection.

## Pose and Sprite Readiness

The character stands neutrally while facing right. Arms and legs remain visually separated from the torso and from one another so the master design can guide later animation. The silhouette must remain readable at game scale.

## Production Approach

Generate one master raster character from the photo reference and refine that image until the user approves the likeness and styling. Only after approval should the project derive a consistent sprite sheet for idle, walking, and jumping. Generating the entire animation sheet independently is out of scope for this first review because it risks identity and proportion drift between frames.

## Acceptance Criteria

- The user recognizes the subject as himself.
- The image clearly reads as chunky cartoon pixel art rather than CSS, SVG, smooth vector art, a filtered photograph, or realistic pixel portraiture.
- The logical detail level is comparable to a 48 × 80 game sprite, with bold outlines, large pixel clusters, and minimal shading.
- The polo is unmistakably short-sleeved.
- No backpack or straps appear.
- Clothing colors and major features match the reference photo.
- No character-specific feature from the style-density reference appears.
- The pose and separated limbs can serve as the canonical reference for later animation.
