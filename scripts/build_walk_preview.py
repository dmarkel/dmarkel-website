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
        tile = source.crop(
            (
                column * tile_width,
                row * tile_height,
                (column + 1) * tile_width,
                (row + 1) * tile_height,
            )
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
    transparent_mask = frame.getchannel("A").point(
        lambda alpha: 255 if alpha == 0 else 0
    )
    palette_frame.paste(255, mask=transparent_mask)
    palette_frame.info["transparency"] = 255
    return palette_frame


def build_walk_preview(source: Path, strip_out: Path, gif_out: Path) -> None:
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
