# Avatar Character Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce one polished, transparent, right-facing chunky cartoon pixel-art master character based closely on the supplied identity photo for user review.

**Architecture:** Use the original photograph as the sole identity and clothing reference. Use the second pixel-art image only to calibrate low-resolution detail, chunkiness, and cartoon simplification. Generate the opaque character against a removable flat chroma-key field, remove that field locally, validate the resulting alpha PNG, and present the master character before creating animation frames.

**Tech Stack:** Built-in image generation, PNG, local chroma-key removal helper, ImageMagick inspection where available.

## Global Constraints

- Chunky raster pixel art with crisp, intentionally placed pixels and no vector-like shapes.
- Compact cartoon proportions with a moderately enlarged head and hands while still reading as an adult.
- Right-facing side profile with a slight three-quarter view of the face.
- Approximately 48 × 80 logical pixels, enlarged only with nearest-neighbor scaling.
- Bold dark outline, large readable pixel clusters, and roughly three or four shades per material.
- Navy short-sleeve polo, bare forearms, pale blue-gray cargo pants, and black athletic sneakers with white midsoles.
- No backpack, backpack straps, accessories, text, scenery, cast shadow, or reflection.
- Do not borrow blue hair, glasses, orange clothing, pose, background color, or any other character-specific detail from the style-density reference.
- Create only the master character in this pass; idle, walk, and jump frames remain out of scope until the master is approved.

---

### Task 1: Generate and Validate the Master Character

**Files:**
- Create: `assets/avatar/avatar-master-v1.png`
- Create temporarily: `tmp/imagegen/avatar-master-v1-chroma.png`

**Interfaces:**
- Consumes: `/var/folders/02/v_wqphz53_xcyc775gd7dnj80000gn/T/codex-clipboard-f0ebc56f-c8c5-4c90-975d-7de926b045f1.png` as the identity and clothing reference.
- Consumes: `/var/folders/02/v_wqphz53_xcyc775gd7dnj80000gn/T/codex-clipboard-7739bd73-e5b2-4127-9caf-bb1f88f04cf2.png` only as the style-density, pixel-cluster, and cartoon-simplification reference.
- Produces: `assets/avatar/avatar-master-v1.png`, the canonical transparent character image used for user review and, after approval, as the visual reference for every animation frame.

- [ ] **Step 1: Generate the character against a removable chroma-key field**

Use the built-in image-generation tool with the supplied photo as a reference and this production prompt:

```text
Use case: stylized-concept
Asset type: canonical master character for a 2D autobiographical pixel-art side-scroller
Primary request: Create a full-body, right-facing chunky cartoon pixel-art game character based closely on the adult man in Reference Image 1. Preserve his recognizable facial structure, skin tone, dark side-parted hair, adult build, and friendly neutral demeanor while simplifying them into compact cartoon proportions. Show a clear side profile with a slight three-quarter turn of the face toward the viewer so his identity remains readable.
Input images: Reference Image 1 is the sole identity, build, clothing-color, and hairstyle source; do not reproduce its train-station environment. Reference Image 2 controls only the low logical resolution, large pixel clusters, bold outline, minimal shading, and degree of cartoon simplification. Do not borrow any character-specific feature from Reference Image 2.
Pose: relaxed neutral standing pose facing right; arms and legs visibly separated from the torso and from one another; both feet readable; suitable as the canonical reference for later walk and jump animation.
Clothing: navy short-sleeve polo with both sleeves unmistakably ending above the elbows and bare forearms visible; pale blue-gray loose cargo pants with readable side pockets; black athletic sneakers with thick white midsoles.
Style/medium: authentic hand-pixeled raster artwork; crisp square pixels; bold dark outline; large readable pixel clusters; limited cohesive palette; roughly three or four shades per material; simplified but recognizable face; compact adult cartoon anatomy with a moderately enlarged head and hands; approximately 48 × 80 logical-pixel character aesthetic shown at enlarged nearest-neighbor scale.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal, one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation.
Constraints: keep the entire character inside the canvas with generous padding; hard pixel edges; no smoothing; no cast shadow; no contact shadow; no reflection.
Avoid: backpack, backpack straps, bags, accessories, long sleeves, rolled sleeves, jacket, scenery, train, station, platform, props, text, watermark, vector-art appearance, CSS-art appearance, photorealism, realistic pixel portraiture, painterly texture, anti-aliased edges, #00ff00 anywhere in the character. From Reference Image 2 specifically avoid blue hair, glasses, orange hoodie, dark blue pants, its pose, and its blue background.
```

Expected result: one isolated, full-body character that visibly matches the reference subject and contains none of the excluded elements.

- [ ] **Step 2: Save the generated source inside the workspace**

Copy the selected built-in output non-destructively to:

```text
tmp/imagegen/avatar-master-v1-chroma.png
```

Expected result: the generated source exists within the project workspace and retains its flat chroma-key background.

- [ ] **Step 3: Remove the chroma-key background**

Run:

```bash
mkdir -p assets/avatar
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py" \
  --input tmp/imagegen/avatar-master-v1-chroma.png \
  --out assets/avatar/avatar-master-v1.png \
  --auto-key border \
  --soft-matte \
  --transparent-threshold 12 \
  --opaque-threshold 220 \
  --despill
```

Expected result: `assets/avatar/avatar-master-v1.png` is a PNG with an alpha channel and transparent corners.

- [ ] **Step 4: Validate the final raster asset**

Run:

```bash
identify -format '%m %w×%h %[channels]\n' assets/avatar/avatar-master-v1.png
```

Expected output contains `PNG`, nonzero width and height, and an alpha-bearing channel description such as `srgba`.

Inspect the image visually at original size and nearest-neighbor enlargement. Confirm: recognizable likeness; right-facing stance; dark side-parted hair; navy short sleeves ending above the elbows; bare forearms; pale cargo pants; black-and-white sneakers; separated limbs; transparent background; no straps, bag, scenery, text, shadow, smoothing, or key-color fringe.

- [ ] **Step 5: Present the character for user review**

Render `assets/avatar/avatar-master-v1.png` inline at a comfortably enlarged nearest-neighbor scale. Do not begin idle, walking, or jumping frames until the user explicitly approves the master character or supplies targeted revision notes.
