#!/usr/bin/env python3
"""Color-harmonize adjacent opaque scene panels without stretching them."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def harmonize_vertical_seam(
    left: Image.Image,
    right: Image.Image,
    blend_width: int,
) -> tuple[Image.Image, Image.Image]:
    if left.height != right.height:
        raise ValueError("panels must have the same height")
    if not 1 < blend_width <= min(left.width, right.width):
        raise ValueError("blend width must fit inside both panels")

    left_pixels = np.asarray(left.convert("RGBA")).astype(np.float32).copy()
    right_pixels = np.asarray(right.convert("RGBA")).astype(np.float32).copy()
    left_edge = left_pixels[:, -1, :3]
    right_edge = right_pixels[:, 0, :3]
    target = (left_edge + right_edge) / 2

    left_weights = np.linspace(0, 1, blend_width, dtype=np.float32)[None, :, None]
    right_weights = np.linspace(1, 0, blend_width, dtype=np.float32)[None, :, None]
    left_pixels[:, -blend_width:, :3] += (
        target - left_edge
    )[:, None, :] * left_weights
    right_pixels[:, :blend_width, :3] += (
        target - right_edge
    )[:, None, :] * right_weights
    left_pixels[:, :, 3] = 255
    right_pixels[:, :, 3] = 255

    return (
        Image.fromarray(np.clip(left_pixels, 0, 255).astype(np.uint8), "RGBA"),
        Image.fromarray(np.clip(right_pixels, 0, 255).astype(np.uint8), "RGBA"),
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--left", required=True)
    parser.add_argument("--right", required=True)
    parser.add_argument("--out-left", required=True)
    parser.add_argument("--out-right", required=True)
    parser.add_argument("--blend-width", type=int, default=256)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    outputs = (Path(args.out_left), Path(args.out_right))
    for output in outputs:
        if output.exists() and not args.force:
            parser.error(f"output already exists: {output}; use --force to overwrite")

    with Image.open(args.left) as left, Image.open(args.right) as right:
        corrected = harmonize_vertical_seam(left, right, args.blend_width)
    for output, image in zip(outputs, corrected):
        output.parent.mkdir(parents=True, exist_ok=True)
        image.save(output)


if __name__ == "__main__":
    main()
