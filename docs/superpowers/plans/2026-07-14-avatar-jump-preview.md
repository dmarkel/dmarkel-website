# Avatar Jump Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a five-state transparent raised-fist jump strip and an enlarged animated review preview from the approved avatar.

**Architecture:** Generate all five right-facing jump states as one coherent horizontal source sheet so appearance remains consistent. Remove the chroma field with the proven soft-matte, despill, and one-pixel contraction settings, then use a tested Pillow utility to normalize the poses into 64 × 96 cells, create a 320 × 96 strip, and encode an enlarged review GIF with deliberate apex and landing holds.

**Tech Stack:** Built-in image generation, Python 3, Pillow, PNG, GIF, unittest.

## Global Constraints

- Use `assets/avatar/avatar-master-v1.png` and the approved walk assets as the only character-design references.
- Produce exactly five right-facing states in order: takeoff, ascent, apex, descent, landing.
- The leading fist rises during takeoff, remains above the head through ascent and apex, then lowers during descent.
- The trailing arm stays lowered or angled back for a clear airborne silhouette.
- Normalize every state into a 64 × 96 logical-pixel cell with a shared scale, baseline, palette, and outline.
- Preserve the approved face, hair, navy short-sleeve polo, bare forearms, pale cargo pants and pocket, and black-and-white sneakers.
- Do not add another game's clothing, proportions, character details, backpack, straps, accessories, scenery, text, shadow, or background.
- Verify zero visible green-dominant pixels in the final strip and every GIF frame.
- Interactive HTML and jump physics remain out of scope.

---

### Task 1: Build and Test the Jump Preview Utility

**Files:**
- Create: `scripts/build_jump_preview.py`
- Create: `tests/test_build_jump_preview.py`

**Interfaces:**
- Consumes: `build_jump_preview(source: Path, strip_out: Path, gif_out: Path) -> None`, where `source` is a transparent five-column horizontal pose sheet.
- Produces: a 320 × 96 RGBA strip and a 256 × 384 transparent five-frame GIF with per-frame durations `[100, 100, 180, 100, 160]` milliseconds and infinite looping.

- [ ] **Step 1: Write the failing test**

Create `tests/test_build_jump_preview.py` with:

```python
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageDraw, ImageSequence

from scripts.build_jump_preview import build_jump_preview


class BuildJumpPreviewTests(unittest.TestCase):
    def test_builds_five_cell_strip_and_timed_preview(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "source.png"
            strip = root / "strip.png"
            preview = root / "preview.gif"

            sheet = Image.new("RGBA", (500, 200), (0, 0, 0, 0))
            draw = ImageDraw.Draw(sheet)
            colors = [
                (220, 40, 40, 255),
                (220, 130, 40, 255),
                (220, 210, 40, 255),
                (40, 160, 210, 255),
                (130, 70, 210, 255),
            ]
            for index, color in enumerate(colors):
                x = index * 100 + 25
                draw.rectangle((x, 35, x + 50, 155), fill=color)
            sheet.save(source)

            build_jump_preview(source, strip, preview)

            with Image.open(strip) as result:
                self.assertEqual(result.size, (320, 96))
                self.assertEqual(result.mode, "RGBA")
                self.assertEqual(result.getpixel((0, 0))[3], 0)
                sampled = [
                    result.getpixel((index * 64 + 32, 40))[:3]
                    for index in range(5)
                ]
                self.assertEqual(sampled, [color[:3] for color in colors])

            with Image.open(preview) as animation:
                self.assertEqual(animation.size, (256, 384))
                self.assertEqual(animation.n_frames, 5)
                self.assertEqual(animation.info.get("loop"), 0)
                durations = [
                    frame.info.get("duration")
                    for frame in ImageSequence.Iterator(animation)
                ]
                self.assertEqual(durations, [100, 100, 180, 100, 160])


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
python -m unittest tests/test_build_jump_preview.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'scripts.build_jump_preview'`.

- [ ] **Step 3: Implement the jump preview builder**

Create `scripts/build_jump_preview.py` with:

```python
from pathlib import Path
import argparse

from PIL import Image


FRAME_WIDTH = 64
FRAME_HEIGHT = 96
FRAME_COUNT = 5
PREVIEW_SCALE = 4
PREVIEW_DURATIONS = [100, 100, 180, 100, 160]


def _extract_frames(source: Image.Image) -> list[Image.Image]:
    source = source.convert("RGBA")
    tile_width = source.width // FRAME_COUNT
    tiles = []
    boxes = []

    for index in range(FRAME_COUNT):
        tile = source.crop(
            (index * tile_width, 0, (index + 1) * tile_width, source.height)
        )
        alpha_box = tile.getchannel("A").getbbox()
        if alpha_box is None:
            raise ValueError(f"Frame {index + 1} contains no visible pixels")
        tiles.append(tile)
        boxes.append(alpha_box)

    max_width = max(box[2] - box[0] for box in boxes)
    max_height = max(box[3] - box[1] for box in boxes)
    scale = min(56 / max_width, 88 / max_height)

    frames = []
    for tile, box in zip(tiles, boxes):
        character = tile.crop(box)
        size = (
            max(1, round(character.width * scale)),
            max(1, round(character.height * scale)),
        )
        character = character.resize(size, Image.Resampling.NEAREST)
        frame = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT), (0, 0, 0, 0))
        x = (FRAME_WIDTH - character.width) // 2
        y = 92 - character.height
        frame.alpha_composite(character, (x, y))
        frames.append(frame)

    return frames


def _gif_frame(frame: Image.Image) -> Image.Image:
    palette_frame = frame.convert("RGB").quantize(colors=255)
    transparent_mask = frame.getchannel("A").point(
        lambda alpha: 255 if alpha == 0 else 0
    )
    palette_frame.paste(255, mask=transparent_mask)
    palette_frame.info["transparency"] = 255
    return palette_frame


def build_jump_preview(source: Path, strip_out: Path, gif_out: Path) -> None:
    with Image.open(source) as image:
        frames = _extract_frames(image)

    strip = Image.new(
        "RGBA", (FRAME_WIDTH * FRAME_COUNT, FRAME_HEIGHT), (0, 0, 0, 0)
    )
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (index * FRAME_WIDTH, 0))

    strip_out.parent.mkdir(parents=True, exist_ok=True)
    gif_out.parent.mkdir(parents=True, exist_ok=True)
    strip.save(strip_out)

    preview_size = (FRAME_WIDTH * PREVIEW_SCALE, FRAME_HEIGHT * PREVIEW_SCALE)
    gif_frames = [
        _gif_frame(frame.resize(preview_size, Image.Resampling.NEAREST))
        for frame in frames
    ]
    gif_frames[0].save(
        gif_out,
        save_all=True,
        append_images=gif_frames[1:],
        duration=PREVIEW_DURATIONS,
        loop=0,
        disposal=2,
        transparency=255,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("strip_out", type=Path)
    parser.add_argument("gif_out", type=Path)
    arguments = parser.parse_args()
    build_jump_preview(arguments.source, arguments.strip_out, arguments.gif_out)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the jump preview test and the existing walk test**

Run:

```bash
python -m unittest tests/test_build_jump_preview.py tests/test_build_walk_preview.py -v
```

Expected: two tests pass with `OK`.

- [ ] **Step 5: Commit the tested builder**

```bash
git add scripts/build_jump_preview.py tests/test_build_jump_preview.py
git commit -m "feat: add jump preview builder"
```

---

### Task 2: Generate and Process the Jump States

**Files:**
- Create temporarily: `tmp/imagegen/avatar-jump-grid-v1-chroma.png`
- Create temporarily: `tmp/imagegen/avatar-jump-grid-v1-rgba.png`
- Create: `assets/avatar/avatar-jump-right.png`
- Create: `assets/avatar/avatar-jump-preview.gif`

**Interfaces:**
- Consumes: `assets/avatar/avatar-master-v1.png` and `assets/avatar/avatar-walk-right.png` as canonical appearance references.
- Consumes: `scripts/build_jump_preview.py` from Task 1.
- Produces: `assets/avatar/avatar-jump-right.png` and `assets/avatar/avatar-jump-preview.gif` for review and later state-driven runtime selection.

- [ ] **Step 1: Generate one coherent five-pose sheet**

Use the built-in image-generation tool with the approved master and walk strip as references and this prompt:

```text
Use case: stylized-concept
Asset type: five-state right-facing pixel-art jump source sheet
Reference roles: The approved master and walk strip are strict sources for the same character's identity, face, dark side-parted hair, compact adult proportions, pixel size, outline, palette, navy short-sleeve polo, bare forearms, pale blue-gray cargo pants and pocket, and black sneakers with white midsoles.
Primary request: Draw exactly five full-body versions of this same character in one horizontal row, ordered left to right: 1 takeoff crouch, 2 ascending with leading fist raised above head, 3 airborne apex with leading fist fully overhead and knees slightly tucked, 4 descending with the fist beginning to lower and legs extending, 5 landing crouch with both feet on the baseline.
Gesture: character faces right in every state. The leading fist rises during takeoff, remains overhead throughout ascent and apex, and lowers during descent. The trailing arm stays lowered or angled backward for balance. The gesture may evoke the readability of a classic platform-game jump but must not copy another character's clothing, colors, face, body, or artwork.
Style: preserve the approved chunky 48 × 80 logical-pixel cartoon aesthetic exactly; crisp square pixels; nearest-neighbor appearance; large intentional clusters; bold dark outline; minimal shading; identical identity, scale, palette, and proportions in every state.
Layout: exactly five isolated characters, evenly spaced in equal invisible columns, one row only, fully visible with generous separation. No overlap, labels, borders, grid lines, text, or sixth character.
Backdrop: perfectly flat solid #00ff00 chroma-key field with no floor, shadow, gradient, texture, or lighting variation. Do not use #00ff00 in the character.
Avoid: neutral standing poses, duplicated poses, facial drift, palette drift, redesign, changing hairline, changing clothing or pocket side, backpack, straps, accessories, another game's costume, extra or missing limbs, cropped bodies, scenery, text, numbers, shadows, reflections, anti-aliasing, photorealism, vector art, or CSS-art appearance.
```

Expected result: exactly five consistent, distinct right-facing jump states in one row.

- [ ] **Step 2: Remove the chroma field using the proven fringe-free settings**

Copy the selected built-in output to `tmp/imagegen/avatar-jump-grid-v1-chroma.png`, then run:

```bash
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py" \
  --input tmp/imagegen/avatar-jump-grid-v1-chroma.png \
  --out tmp/imagegen/avatar-jump-grid-v1-rgba.png \
  --auto-key border \
  --soft-matte \
  --transparent-threshold 12 \
  --opaque-threshold 220 \
  --despill \
  --edge-contract 1
```

Expected result: a transparent five-pose sheet with no visible key-color fringe.

- [ ] **Step 3: Build the strip and animated review preview**

Run:

```bash
python scripts/build_jump_preview.py \
  tmp/imagegen/avatar-jump-grid-v1-rgba.png \
  assets/avatar/avatar-jump-right.png \
  assets/avatar/avatar-jump-preview.gif
```

Expected result: a 320 × 96 RGBA strip and a 256 × 384 five-frame GIF.

- [ ] **Step 4: Verify tests, metadata, and chroma removal**

Run:

```bash
python -m unittest tests/test_build_jump_preview.py tests/test_build_walk_preview.py -v
sips -g format -g pixelWidth -g pixelHeight -g hasAlpha assets/avatar/avatar-jump-right.png
sips -g format -g pixelWidth -g pixelHeight assets/avatar/avatar-jump-preview.gif
python -c "from PIL import Image,ImageSequence; paths=['assets/avatar/avatar-jump-right.png','assets/avatar/avatar-jump-preview.gif']; [(lambda im: print(p, sum(a>0 and g>r+35 and g>b+35 for f in ImageSequence.Iterator(im) for r,g,b,a in f.convert('RGBA').getdata())))(Image.open(p)) for p in paths]"
```

Expected: both unit tests report `OK`; the strip is a 320 × 96 alpha PNG; the preview is a 256 × 384 GIF; each chroma count is `0`.

- [ ] **Step 5: Visually review the jump sequence**

Accept only if all five states are distinct and ordered correctly; the character remains consistent; the leading fist is clearly above the head during ascent and apex; the other arm is lowered; knees compress, tuck, extend, and absorb landing appropriately; no extra limbs or copied character details appear; and no background or green edge is visible.

If a visual check fails, keep the failed assets uncommitted, regenerate the single source sheet with the same prompt plus one sentence naming only the observed defect, and repeat Steps 2–5.

- [ ] **Step 6: Commit the approved jump assets**

```bash
git add assets/avatar/avatar-jump-right.png assets/avatar/avatar-jump-preview.gif
git commit -m "feat: add avatar jump cycle preview"
```
