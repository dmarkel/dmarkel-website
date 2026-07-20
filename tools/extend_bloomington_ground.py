#!/usr/bin/env python3
"""Extend the approved Bloomington sidewalk without changing its first chapter."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def extend_ground(
    source: Image.Image,
    *,
    target_width: int = 7624,
    stadium_start: int = 5718,
    blend_width: int = 192,
) -> Image.Image:
    """Tile proven geometry and apply a subtle stadium-plaza color transition."""
    approved = source.convert("RGBA")
    if target_width < approved.width:
        raise ValueError("target width cannot be smaller than the approved strip")
    if not 0 <= stadium_start < target_width:
        raise ValueError("stadium start must be inside the target strip")
    if blend_width <= 0:
        raise ValueError("blend width must be positive")

    result = Image.new("RGBA", (target_width, approved.height))
    for x in range(0, target_width, approved.width):
        result.alpha_composite(approved, (x, 0))

    pixels = result.load()
    for x in range(stadium_start, target_width):
        amount = min(1.0, (x - stadium_start + 1) / blend_width)
        for y in range(result.height):
            red, green, blue, alpha = pixels[x, y]
            warm = (min(255, red + 12), max(0, green - 4), max(0, blue - 9))
            pixels[x, y] = (
                round(red + (warm[0] - red) * amount),
                round(green + (warm[1] - green) * amount),
                round(blue + (warm[2] - blue) * amount),
                alpha,
            )
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--target-width", type=int, default=7624)
    parser.add_argument("--stadium-start", type=int, default=5718)
    parser.add_argument("--blend-width", type=int, default=192)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    source = Path(args.input)
    output = Path(args.out)
    if not source.exists():
        parser.error(f"input image does not exist: {source}")
    if output.exists() and not args.force:
        parser.error(f"output image already exists: {output}; use --force to overwrite")

    with Image.open(source) as image:
        result = extend_ground(
            image,
            target_width=args.target_width,
            stadium_start=args.stadium_start,
            blend_width=args.blend_width,
        )
    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output)


if __name__ == "__main__":
    main()
