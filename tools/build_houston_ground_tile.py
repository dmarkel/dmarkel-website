from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/backgrounds/houston-chapter/foreground-02-v3.png"
OUTPUT = ROOT / "assets/backgrounds/houston-modular/ground-strip.png"


def main():
    source = Image.open(SOURCE).convert("RGBA")
    half = source.crop((0, 665, 1906, 825))
    tile = Image.new("RGBA", (3812, 160))
    tile.paste(half, (0, 0))
    tile.paste(ImageOps.mirror(half), (1906, 0))
    tile.putalpha(255)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    tile.save(OUTPUT)


if __name__ == "__main__":
    main()
