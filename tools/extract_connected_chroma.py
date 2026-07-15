#!/usr/bin/env python3
"""Remove only chroma-key pixels connected to an image border."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path
import re

from PIL import Image


Color = tuple[int, int, int]


def _distance(left: Color, right: Color) -> int:
    return max(abs(left[index] - right[index]) for index in range(3))


def _border_points(width: int, height: int):
    for x in range(width):
        yield x, 0
        yield x, height - 1
    for y in range(1, height - 1):
        yield 0, y
        yield width - 1, y


def _connected_background(image: Image.Image, key: Color, tolerance: int) -> set[tuple[int, int]]:
    pixels = image.load()
    width, height = image.size
    background: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    for point in _border_points(width, height):
        if point in background:
            continue
        if _distance(pixels[point][:3], key) <= tolerance:
            background.add(point)
            queue.append(point)

    while queue:
        x, y = queue.popleft()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dx == 0 and dy == 0:
                    continue
                neighbor = x + dx, y + dy
                nx, ny = neighbor
                if not (0 <= nx < width and 0 <= ny < height):
                    continue
                if neighbor in background:
                    continue
                if _distance(pixels[neighbor][:3], key) <= tolerance:
                    background.add(neighbor)
                    queue.append(neighbor)

    return background


def extract_connected_chroma(
    image: Image.Image,
    key: Color,
    tolerance: int,
) -> Image.Image:
    rgba = image.convert("RGBA")
    background = _connected_background(rgba, key, tolerance)
    pixels = rgba.load()
    for point in background:
        pixels[point] = (0, 0, 0, 0)
    return rgba


def _parse_color(value: str) -> Color:
    match = re.fullmatch(r"#?([0-9a-fA-F]{6})", value.strip())
    if not match:
        raise argparse.ArgumentTypeError("key color must be a six-digit hex value")
    raw = match.group(1)
    return tuple(int(raw[index:index + 2], 16) for index in (0, 2, 4))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--key-color", type=_parse_color, default=(255, 0, 255))
    parser.add_argument("--tolerance", type=int, default=35)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    source = Path(args.input)
    output = Path(args.out)
    if not source.exists():
        parser.error(f"input image does not exist: {source}")
    if output.exists() and not args.force:
        parser.error(f"output image already exists: {output}; use --force to overwrite")
    if not 0 <= args.tolerance <= 255:
        parser.error("tolerance must be between 0 and 255")

    with Image.open(source) as image:
        result = extract_connected_chroma(image, args.key_color, args.tolerance)
    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output)


if __name__ == "__main__":
    main()
