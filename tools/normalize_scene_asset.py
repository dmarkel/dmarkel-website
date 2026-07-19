#!/usr/bin/env python3
"""Normalize generated scene artwork without stretching or soft resampling."""

from __future__ import annotations

import argparse
from pathlib import Path
import re

from PIL import Image, ImageChops

try:
    from tools.extract_connected_chroma import extract_connected_chroma
except ModuleNotFoundError:
    from extract_connected_chroma import extract_connected_chroma


Color = tuple[int, int, int]


def cover_resize(image: Image.Image, width: int, height: int) -> Image.Image:
    """Center-crop an image to the target ratio, then resize with hard pixels."""
    if width <= 0 or height <= 0:
        raise ValueError("target width and height must be positive")

    source = image.convert("RGBA")
    source_ratio = source.width / source.height
    target_ratio = width / height
    if source_ratio > target_ratio:
        crop_width = round(source.height * target_ratio)
        left = (source.width - crop_width) // 2
        box = (left, 0, left + crop_width, source.height)
    else:
        crop_height = round(source.width / target_ratio)
        top = (source.height - crop_height) // 2
        box = (0, top, source.width, top + crop_height)

    return source.crop(box).resize((width, height), Image.Resampling.NEAREST)


def trim_dark_matte(image: Image.Image, threshold: int = 24) -> Image.Image:
    """Crop border matte where every RGB channel remains at or below threshold."""
    if not 0 <= threshold <= 255:
        raise ValueError("threshold must be between 0 and 255")

    rgb = image.convert("RGB")
    red, green, blue = rgb.split()
    brightest = ImageChops.lighter(ImageChops.lighter(red, green), blue)
    mask = brightest.point(lambda value: 255 if value > threshold else 0)
    bounds = mask.getbbox()
    if bounds is None:
        raise ValueError("image contains no non-matte pixels")
    return image.crop(bounds)


def normalize_opaque(
    image: Image.Image,
    size: tuple[int, int],
    trim_matte: bool = False,
) -> Image.Image:
    """Normalize an edge-to-edge scene asset and force it fully opaque."""
    source = trim_dark_matte(image) if trim_matte else image
    result = cover_resize(source, *size)
    result.putalpha(255)
    return result


def normalize_keyed(
    image: Image.Image,
    size: tuple[int, int],
    key: Color = (255, 0, 255),
    tolerance: int = 55,
) -> Image.Image:
    """Normalize a chroma-keyed sprite with binary alpha and a clear border."""
    if not 0 <= tolerance <= 255:
        raise ValueError("tolerance must be between 0 and 255")

    resized = cover_resize(image, *size)
    result = extract_connected_chroma(resized, key, tolerance)
    alpha = result.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
    result.putalpha(alpha)

    pixels = result.load()
    width, height = result.size
    border = min(2, width // 2, height // 2)
    for offset in range(border):
        for x in range(width):
            pixels[x, offset] = (0, 0, 0, 0)
            pixels[x, height - 1 - offset] = (0, 0, 0, 0)
        for y in range(height):
            pixels[offset, y] = (0, 0, 0, 0)
            pixels[width - 1 - offset, y] = (0, 0, 0, 0)
    return result


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
    parser.add_argument("--width", type=int, required=True)
    parser.add_argument("--height", type=int, required=True)
    parser.add_argument("--trim-dark-matte", action="store_true")
    parser.add_argument("--key-color", type=_parse_color)
    parser.add_argument("--tolerance", type=int, default=55)
    parser.add_argument("--binary-alpha", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    source = Path(args.input)
    output = Path(args.out)
    if not source.exists():
        parser.error(f"input image does not exist: {source}")
    if output.exists() and not args.force:
        parser.error(f"output image already exists: {output}; use --force to overwrite")
    if args.binary_alpha and args.key_color is None:
        parser.error("--binary-alpha requires --key-color")

    with Image.open(source) as image:
        if args.key_color is None:
            result = normalize_opaque(
                image,
                (args.width, args.height),
                trim_matte=args.trim_dark_matte,
            )
        else:
            keyed_source = trim_dark_matte(image) if args.trim_dark_matte else image
            result = normalize_keyed(
                keyed_source,
                (args.width, args.height),
                args.key_color,
                args.tolerance,
            )

    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output)


if __name__ == "__main__":
    main()
