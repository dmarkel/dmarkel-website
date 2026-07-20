#!/usr/bin/env python3
"""Build the Bloomington panel with independent Gates and Kirkwood grades."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "backgrounds" / "bloomington-proof"
SOURCE = ASSET_DIR / "environment-02-v2.png"
OUTPUT = ASSET_DIR / "environment-02-v3.png"
SIZE = (1906, 825)
SPLIT_X = 815
LEFT_SHIFT = 16


def build(source_path=SOURCE, output_path=OUTPUT):
    with Image.open(source_path) as source:
        if source.mode != "RGBA":
            raise ValueError(f"expected RGBA source, got {source.mode}")
        if source.size != SIZE:
            raise ValueError(f"expected source size {SIZE}, got {source.size}")
        if not 0 < SPLIT_X < source.width:
            raise ValueError(f"split x must be inside the source: {SPLIT_X}")

        corrected = Image.new("RGBA", SIZE, (0, 0, 0, 0))
        gates = source.crop((0, LEFT_SHIFT, SPLIT_X, source.height))
        kirkwood = source.crop((SPLIT_X, 0, source.width, source.height))
        corrected.paste(gates, (0, 0))
        corrected.paste(kirkwood, (SPLIT_X, 0))
        corrected.save(output_path)

    return output_path


if __name__ == "__main__":
    print(build())
