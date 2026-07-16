from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "tmp/imagegen/houston-modular"
OUTPUT = ROOT / "assets/backgrounds/houston-modular"

SPECS = {
    "iron-sheet.png": {
        "iron-start.png": ((70, 210, 165, 660), 0.5),
        "iron-middle.png": ((225, 210, 820, 660), 0.5),
        "iron-gate.png": ((930, 190, 1710, 660), 0.5),
        "iron-end.png": ((1750, 210, 1865, 660), 0.5),
    },
    "chain-sheet.png": {
        "chain-start.png": ((145, 185, 395, 655), 0.48),
        "chain-middle.png": ((530, 185, 1355, 655), 0.48),
        "chain-end.png": ((1500, 185, 1750, 655), 0.48),
    },
    "props-sheet.png": {
        "planter.png": ((100, 145, 455, 435), 0.4),
        "cabinet.png": ((525, 90, 845, 435), 0.4),
        "bench.png": ((925, 160, 1340, 435), 0.4),
        "bike-rack.png": ((1440, 160, 1625, 435), 0.4),
        "bollards.png": ((455, 580, 925, 845), 0.4),
        "street-lamp.png": ((1105, 400, 1285, 845), 0.4),
    },
}


def remove_magenta(image):
    image = image.convert("RGBA")
    cleaned = []
    for red, green, blue, _ in image.getdata():
        key_distance = ((red - 255) ** 2 + green ** 2 + (blue - 255) ** 2) ** 0.5
        if key_distance < 150:
            cleaned.append((0, 0, 0, 0))
            continue
        if red > 90 and blue > 90 and min(red, blue) - green > 35:
            red = green
            blue = min(blue, green)
        cleaned.append((red, green, blue, 255))
    image.putdata(cleaned)
    return image


def trim_and_border(image):
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("crop contained no visible pixels")
    image = image.crop(bbox)
    bordered = Image.new("RGBA", (image.width + 2, image.height + 2))
    bordered.paste(image, (1, 1))
    return bordered


def prepare(crop, scale):
    image = remove_magenta(crop)
    image = trim_and_border(image)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    image = image.resize(size, Image.Resampling.NEAREST)
    return trim_and_border(image)


def extract_terminal():
    source = Image.open(
        ROOT / "assets/backgrounds/houston-chapter/foreground-04-v3.png"
    ).convert("RGBA")
    terminal = source.crop((840, 70, 1906, 665))
    alpha = terminal.getchannel("A").point(lambda value: 255 if value else 0)
    terminal.putalpha(alpha)
    return trim_and_border(terminal)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for sheet_name, outputs in SPECS.items():
        sheet = Image.open(SHEETS / sheet_name).convert("RGBA")
        for name, (box, scale) in outputs.items():
            prepare(sheet.crop(box), scale).save(OUTPUT / name)
    extract_terminal().save(OUTPUT / "terminal.png")


if __name__ == "__main__":
    main()
