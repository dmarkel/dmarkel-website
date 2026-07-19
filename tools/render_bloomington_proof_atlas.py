#!/usr/bin/env python3
"""Render source-space Bloomington proof checkpoints for visual QA."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "backgrounds" / "bloomington-proof"
AVATAR = ROOT / "assets" / "avatar" / "avatar-walk-right.png"
OUTPUT = ROOT / "tmp" / "imagegen" / "bloomington-proof" / "proof-atlas.png"
WORLD_SIZE = (3812, 825)
GROUND_Y = 735

PROP_SPECS = {
    "bench": (150, 96, 95),
    "campus-lamp": (64, 190, 189),
    "planter": (128, 100, 99),
    "newspaper-box": (80, 108, 107),
    "parking-meter": (45, 118, 117),
    "bike-rack": (80, 88, 87),
    "student-pair": (150, 150, 149),
}
BACK_PROPS = (("student-pair", 1280, 665),)
FRONT_PROPS = (
    ("bench", 520, 735),
    ("campus-lamp", 930, 735),
    ("planter", 1450, 735),
    ("newspaper-box", 2250, 735),
    ("parking-meter", 2580, 735),
    ("bike-rack", 2910, 735),
)


def load(name: str) -> Image.Image:
    return Image.open(ASSETS / name).convert("RGBA")


def paste_prop(scene: Image.Image, asset_id: str, x: int, ground_y: int) -> None:
    _, _, base_y = PROP_SPECS[asset_id]
    image = load(f"{asset_id}.png")
    scene.alpha_composite(image, (x, ground_y - base_y))


def paste_avatar(scene: Image.Image, x: int) -> None:
    sheet = Image.open(AVATAR).convert("RGBA")
    frame = sheet.crop((64 * 2, 0, 64 * 3, 96))
    scene.alpha_composite(frame, (x, GROUND_Y - 96))


def build_scene(avatar_x: int) -> Image.Image:
    scene = Image.new("RGBA", WORLD_SIZE, "#8ed6f0")
    scene.alpha_composite(load("far-01.png"), (0, 0))
    scene.alpha_composite(load("far-02.png"), (1906, 0))
    scene.alpha_composite(load("environment-01-v2.png"), (0, 0))
    scene.alpha_composite(load("environment-02.png"), (1906, 0))
    scene.alpha_composite(load("ground-strip.png"), (0, 665))
    for prop in BACK_PROPS:
        paste_prop(scene, *prop)
    paste_avatar(scene, avatar_x)
    for prop in FRONT_PROPS:
        paste_prop(scene, *prop)
    return scene


def labeled_crop(
    scene: Image.Image,
    x: int,
    label: str,
    size: tuple[int, int] = (390, 760),
) -> Image.Image:
    width, height = size
    top = WORLD_SIZE[1] - height
    crop = scene.crop((x, top, x + width, top + height)).convert("RGB")
    draw = ImageDraw.Draw(crop)
    draw.rounded_rectangle((12, 12, 12 + len(label) * 7 + 18, 42), 8, fill="#091d22dd")
    draw.text((21, 21), label, fill="white", font=ImageFont.load_default())
    return crop


def main() -> None:
    checkpoints = (
        (120, 250, "Kelley center"),
        (1711, 1850, "safe panel join"),
        (1870, 2050, "campus to Kirkwood"),
        (3422, 3500, "Nick's and endpoint"),
    )
    cards = []
    for crop_x, avatar_x, label in checkpoints:
        cards.append(labeled_crop(build_scene(avatar_x), crop_x, label))

    panorama = build_scene(1130).convert("RGB")
    panorama.thumbnail((1600, 347), Image.Resampling.NEAREST)
    margin = 24
    card_gap = 14
    atlas_width = max(1600 + margin * 2, sum(card.width for card in cards) + card_gap * 3 + margin * 2)
    atlas_height = panorama.height + cards[0].height + margin * 3
    atlas = Image.new("RGB", (atlas_width, atlas_height), "#091d22")
    atlas.paste(panorama, ((atlas_width - panorama.width) // 2, margin))
    y = margin * 2 + panorama.height
    x = margin
    for card in cards:
        atlas.paste(card, (x, y))
        x += card.width + card_gap

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    main()
