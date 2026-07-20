#!/usr/bin/env python3
"""Remove the baked Sample Gates car with a bounded transparent patch."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "backgrounds" / "bloomington-proof"
SOURCE = ASSET_DIR / "environment-02-v3.png"
PATCH = ASSET_DIR / "environment-02-car-removal-patch.png"
OUTPUT = ASSET_DIR / "environment-02-v4.png"
SIZE = (1906, 825)
PATCH_BOX = (670, 610, 890, 725)
PATCH_SIZE = (PATCH_BOX[2] - PATCH_BOX[0], PATCH_BOX[3] - PATCH_BOX[1])


def build(source_path=SOURCE, patch_path=PATCH, output_path=OUTPUT):
    with Image.open(source_path) as source_image, Image.open(patch_path) as patch_image:
        source = source_image.convert("RGBA")
        replacement = patch_image.convert("RGBA")
        if source_image.mode != "RGBA":
            raise ValueError(f"expected RGBA source, got {source_image.mode}")
        if patch_image.mode != "RGBA":
            raise ValueError(f"expected RGBA patch, got {patch_image.mode}")
        if source.size != SIZE:
            raise ValueError(f"expected source size {SIZE}, got {source.size}")
        if replacement.size != PATCH_SIZE:
            raise ValueError(f"expected patch size {PATCH_SIZE}, got {replacement.size}")

        corrected = source.copy()
        corrected.paste(Image.new("RGBA", PATCH_SIZE, (0, 0, 0, 0)), PATCH_BOX[:2])
        corrected.alpha_composite(replacement, PATCH_BOX[:2])
        corrected.save(output_path)

    return output_path


if __name__ == "__main__":
    print(build())
