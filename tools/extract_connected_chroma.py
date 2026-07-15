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


NEIGHBORS = tuple(
    (dx, dy)
    for dy in (-1, 0, 1)
    for dx in (-1, 0, 1)
    if not (dx == 0 and dy == 0)
)


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
        for dx, dy in NEIGHBORS:
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


def _large_enclosed_key_regions(
    image: Image.Image,
    key: Color,
    tolerance: int,
    excluded: set[tuple[int, int]],
    minimum_size: int = 24,
) -> set[tuple[int, int]]:
    pixels = image.load()
    width, height = image.size
    visited = set(excluded)
    removable: set[tuple[int, int]] = set()

    for y in range(height):
        for x in range(width):
            start = x, y
            if start in visited or _distance(pixels[start][:3], key) > tolerance:
                continue
            component = {start}
            visited.add(start)
            queue = deque((start,))
            while queue:
                current_x, current_y = queue.popleft()
                for dx, dy in NEIGHBORS:
                    neighbor = current_x + dx, current_y + dy
                    nx, ny = neighbor
                    if not (0 <= nx < width and 0 <= ny < height):
                        continue
                    if neighbor in visited:
                        continue
                    if _distance(pixels[neighbor][:3], key) <= tolerance:
                        visited.add(neighbor)
                        component.add(neighbor)
                        queue.append(neighbor)
            if len(component) >= minimum_size:
                removable.update(component)

    return removable


def _despill_visible_edges(image: Image.Image) -> None:
    pixels = image.load()
    width, height = image.size
    replacements: dict[tuple[int, int], tuple[int, int, int, int]] = {}
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0 or min(red, blue) - green <= 20:
                continue
            touches_transparency = any(
                0 <= x + dx < width
                and 0 <= y + dy < height
                and pixels[x + dx, y + dy][3] == 0
                for dx, dy in NEIGHBORS
            )
            if touches_transparency:
                replacements[x, y] = (min(red, green), green, min(blue, green), alpha)
    for point, color in replacements.items():
        pixels[point] = color


def _seal_floor(image: Image.Image, opaque_from_y: int) -> None:
    pixels = image.load()
    width, height = image.size
    if not 0 <= opaque_from_y < height:
        raise ValueError("opaque_from_y must fall inside the image")
    for x in range(width):
        replacement = next(
            (pixels[x, y] for y in range(opaque_from_y, height) if pixels[x, y][3] > 0),
            (93, 88, 80, 255),
        )
        replacement = (*replacement[:3], 255)
        for y in range(opaque_from_y, height):
            if pixels[x, y][3] == 0:
                pixels[x, y] = replacement


def extract_connected_chroma(
    image: Image.Image,
    key: Color,
    tolerance: int,
    *,
    opaque_from_y: int | None = None,
) -> Image.Image:
    rgba = image.convert("RGBA")
    background = _connected_background(rgba, key, tolerance)
    background.update(
        _large_enclosed_key_regions(rgba, key, tolerance, background)
    )
    pixels = rgba.load()
    for point in background:
        pixels[point] = (0, 0, 0, 0)
    _despill_visible_edges(rgba)
    if opaque_from_y is not None:
        _seal_floor(rgba, opaque_from_y)
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
    parser.add_argument("--opaque-from-y", type=int)
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
        result = extract_connected_chroma(
            image,
            args.key_color,
            args.tolerance,
            opaque_from_y=args.opaque_from_y,
        )
    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output)


if __name__ == "__main__":
    main()
