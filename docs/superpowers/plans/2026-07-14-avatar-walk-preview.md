# Avatar Walk Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce an eight-frame transparent walk-cycle strip and a 10 FPS looping animated preview from the approved avatar.

**Architecture:** Generate all eight right-facing poses together in a coherent 4 × 2 source grid so appearance and palette remain consistent. Remove the chroma-key field, then use one small Pillow utility to slice the grid, normalize frames into 64 × 96 cells, assemble a horizontal strip, and encode a transparent GIF. Tests use a synthetic grid to verify frame order, dimensions, transparency, timing, and looping independently of the generated artwork.

**Tech Stack:** Built-in image generation, Python 3, Pillow, PNG, GIF, unittest.

## Global Constraints

- Use `assets/avatar/avatar-master-v1.png` as the sole character-design reference.
- Produce exactly eight right-facing frames in this order: contact, recoil, passing, high point, opposite contact, opposite recoil, opposite passing, opposite high point.
- Normalize every frame into a 64 × 96 logical-pixel cell with a shared baseline, scale, palette, and outline weight.
- Keep vertical bounce to one or two logical pixels and preview at 10 frames per second.
- Preserve the approved face, hair, navy short-sleeve polo, bare forearms, pale cargo pants, cargo pocket, and black-and-white sneakers.
- Do not add a backpack, straps, accessories, scenery, text, cast shadow, or background.
- Jump animation and interactive HTML controls remain out of scope.

---

### Task 1: Build and Test the Sprite-Normalization Utility

**Files:**
- Create: `scripts/build_walk_preview.py`
- Create: `tests/test_build_walk_preview.py`

**Interfaces:**
- Consumes: `build_walk_preview(source: Path, strip_out: Path, gif_out: Path) -> None`, where `source` is an RGBA 4 × 2 grid ordered row-major.
- Produces: a 512 × 96 transparent PNG strip and a transparent eight-frame GIF with 100 ms frame duration and infinite looping.

- [ ] **Step 1: Write the failing tests**

Create `tests/test_build_walk_preview.py` with:

```python
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

from scripts.build_walk_preview import build_walk_preview


class BuildWalkPreviewTests(unittest.TestCase):
    def test_builds_eight_cell_strip_and_looping_gif(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "source.png"
            strip = root / "strip.png"
            preview = root / "preview.gif"

            grid = Image.new("RGBA", (400, 300), (0, 0, 0, 0))
            draw = ImageDraw.Draw(grid)
            colors = [
                (220, 40, 40, 255), (220, 120, 40, 255),
                (220, 200, 40, 255), (40, 180, 60, 255),
                (40, 160, 210, 255), (60, 80, 220, 255),
                (150, 70, 210, 255), (210, 60, 150, 255),
            ]
            for index, color in enumerate(colors):
                column = index % 4
                row = index // 4
                x = column * 100 + 20
                y = row * 150 + 25
                draw.rectangle((x, y, x + 50, y + 100), fill=color)
            grid.save(source)

            build_walk_preview(source, strip, preview)

            with Image.open(strip) as result:
                self.assertEqual(result.size, (512, 96))
                self.assertEqual(result.mode, "RGBA")
                self.assertEqual(result.getpixel((0, 0))[3], 0)
                sampled = [result.getpixel((index * 64 + 32, 40))[:3] for index in range(8)]
                self.assertEqual(sampled, [color[:3] for color in colors])

            with Image.open(preview) as animation:
                self.assertEqual(animation.n_frames, 8)
                self.assertEqual(animation.info.get("loop"), 0)
                self.assertEqual(animation.info.get("duration"), 100)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
python -m unittest tests/test_build_walk_preview.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'scripts.build_walk_preview'`.

- [ ] **Step 3: Implement the utility**

Create `scripts/build_walk_preview.py` with:

```python
from pathlib import Path
import argparse

from PIL import Image


FRAME_WIDTH = 64
FRAME_HEIGHT = 96
GRID_COLUMNS = 4
GRID_ROWS = 2
FRAME_COUNT = 8


def _extract_frames(source: Image.Image) -> list[Image.Image]:
    source = source.convert("RGBA")
    tile_width = source.width // GRID_COLUMNS
    tile_height = source.height // GRID_ROWS
    tiles = []
    boxes = []

    for index in range(FRAME_COUNT):
        column = index % GRID_COLUMNS
        row = index // GRID_COLUMNS
        tile = source.crop((
            column * tile_width,
            row * tile_height,
            (column + 1) * tile_width,
            (row + 1) * tile_height,
        ))
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
        target_size = (
            max(1, round(character.width * scale)),
            max(1, round(character.height * scale)),
        )
        character = character.resize(target_size, Image.Resampling.NEAREST)
        frame = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT), (0, 0, 0, 0))
        x = (FRAME_WIDTH - character.width) // 2
        y = 92 - character.height
        frame.alpha_composite(character, (x, y))
        frames.append(frame)

    return frames


def _gif_frame(frame: Image.Image) -> Image.Image:
    palette_frame = frame.convert("RGB").quantize(colors=255)
    transparent_mask = frame.getchannel("A").point(lambda alpha: 255 if alpha == 0 else 0)
    palette_frame.paste(255, mask=transparent_mask)
    palette_frame.info["transparency"] = 255
    return palette_frame


def build_walk_preview(source: Path, strip_out: Path, gif_out: Path) -> None:
    with Image.open(source) as image:
        frames = _extract_frames(image)

    strip = Image.new("RGBA", (FRAME_WIDTH * FRAME_COUNT, FRAME_HEIGHT), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (index * FRAME_WIDTH, 0))

    strip_out.parent.mkdir(parents=True, exist_ok=True)
    gif_out.parent.mkdir(parents=True, exist_ok=True)
    strip.save(strip_out)

    gif_frames = [_gif_frame(frame) for frame in frames]
    gif_frames[0].save(
        gif_out,
        save_all=True,
        append_images=gif_frames[1:],
        duration=100,
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
    build_walk_preview(arguments.source, arguments.strip_out, arguments.gif_out)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the utility test and verify it passes**

Run:

```bash
python -m unittest tests/test_build_walk_preview.py -v
```

Expected: one test passes with `OK`.

- [ ] **Step 5: Commit the tested utility**

```bash
git add scripts/build_walk_preview.py tests/test_build_walk_preview.py
git commit -m "feat: add walk preview builder"
```

---

### Task 2: Generate and Process the Walk Cycle

**Files:**
- Create temporarily: `tmp/imagegen/avatar-walk-grid-v1-chroma.png`
- Create temporarily: `tmp/imagegen/avatar-walk-grid-v1-rgba.png`
- Create: `assets/avatar/avatar-walk-right.png`
- Create: `assets/avatar/avatar-walk-preview.gif`

**Interfaces:**
- Consumes: `assets/avatar/avatar-master-v1.png` as the sole visual source for character identity and design.
- Consumes: `scripts/build_walk_preview.py` from Task 1.
- Produces: `assets/avatar/avatar-walk-right.png` and `assets/avatar/avatar-walk-preview.gif` for user review and later runtime use.

- [ ] **Step 1: Generate one coherent 4 × 2 pose grid**

Use the built-in image-generation tool with `assets/avatar/avatar-master-v1.png` as the only reference and this prompt:

```text
Use case: stylized-concept
Asset type: 8-frame right-facing pixel-art walk-cycle source grid
Reference role: The supplied approved avatar is the strict and sole source for character identity, face, dark side-parted hair, proportions, outline, palette, navy short-sleeve polo, bare forearms, pale blue-gray cargo pants with cargo pocket, and black sneakers with white midsoles.
Primary request: Draw exactly eight full-body versions of this same character as one coherent relaxed natural walk cycle. Arrange them evenly in an invisible 4-column by 2-row grid, ordered left to right across the first row and then left to right across the second row: 1 contact, 2 recoil, 3 passing, 4 high point, 5 opposite contact, 6 opposite recoil, 7 opposite passing, 8 opposite high point.
Motion: character always faces right; natural opposing arm swing; subtle torso rotation; stable face and head; only slight vertical bounce; convincing planted foot during contact; seamless transition from pose 8 back to pose 1.
Style: preserve the approved chunky 48 × 80 logical-pixel cartoon aesthetic exactly; crisp square pixels; nearest-neighbor appearance; large intentional pixel clusters; bold dark outline; minimal shading; identical scale and proportions in every pose.
Layout: all eight characters fully visible, isolated from one another, centered within equal invisible cells, sharing a consistent ground baseline. No labels, borders, grid lines, or overlap.
Backdrop: perfectly flat solid #00ff00 chroma-key field with no floor, shadow, gradient, texture, or lighting variation. Do not use #00ff00 in the character.
Avoid: character redesign, facial drift, palette drift, changing hairline, changing clothing, changing cargo-pocket side, changing shoes, backpack, straps, accessories, extra limbs, missing limbs, extra characters, scenery, text, numbers, cast shadow, contact shadow, reflection, anti-aliasing, photorealism, vector art, CSS-art appearance.
```

Expected result: exactly eight visually consistent poses in a clean 4 × 2 grid.

- [ ] **Step 2: Save the source and remove the chroma key**

Copy the selected built-in output to `tmp/imagegen/avatar-walk-grid-v1-chroma.png`, then run:

```bash
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py" \
  --input tmp/imagegen/avatar-walk-grid-v1-chroma.png \
  --out tmp/imagegen/avatar-walk-grid-v1-rgba.png \
  --auto-key border \
  --transparent-threshold 12 \
  --opaque-threshold 220 \
  --despill
```

Expected result: an RGBA grid with transparent corners and no visible key-color field.

- [ ] **Step 3: Build the strip and animated preview**

Run:

```bash
python scripts/build_walk_preview.py \
  tmp/imagegen/avatar-walk-grid-v1-rgba.png \
  assets/avatar/avatar-walk-right.png \
  assets/avatar/avatar-walk-preview.gif
```

Expected result: a 512 × 96 transparent strip and an eight-frame looping GIF.

- [ ] **Step 4: Verify artifact metadata and tests**

Run:

```bash
python -m unittest tests/test_build_walk_preview.py -v
sips -g format -g pixelWidth -g pixelHeight -g hasAlpha assets/avatar/avatar-walk-right.png
sips -g format -g pixelWidth -g pixelHeight assets/avatar/avatar-walk-preview.gif
```

Expected: the unit test reports `OK`; the strip is a 512 × 96 PNG with alpha; the preview is a GIF.

- [ ] **Step 5: Visually review the loop**

Inspect the strip and GIF. Accept only if all eight poses are present in row-major order; the character remains recognizable and consistent; the head is stable; arms oppose legs; contact feet appear planted; vertical bounce is subtle; the loop has no obvious hitch; and no straps, accessories, background, green fringe, text, or shadows appear.

If any visual acceptance check fails, keep the failed assets uncommitted, regenerate the single 4 × 2 source grid with the same prompt plus one sentence naming only the observed defect, and repeat Steps 2–5.

- [ ] **Step 6: Commit the approved review assets**

```bash
git add assets/avatar/avatar-walk-right.png assets/avatar/avatar-walk-preview.gif
git commit -m "feat: add avatar walk cycle preview"
```
