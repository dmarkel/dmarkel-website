from pathlib import Path

from PIL import Image

from extract_connected_chroma import extract_connected_chroma


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "tmp/imagegen/houston-depth-v2"
MODULAR = ROOT / "assets/backgrounds/houston-modular"
CHAPTER = ROOT / "assets/backgrounds/houston-chapter"


def neutralize_magenta(image):
    cleaned = []
    for red, green, blue, alpha in image.convert("RGBA").getdata():
        if alpha > 0 and red > 90 and blue > 90 and min(red, blue) - green > 35:
            red = green
            blue = min(blue, green)
        cleaned.append((red, green, blue, 255 if alpha else 0))
    image = image.convert("RGBA")
    image.putdata(cleaned)
    return image


def build_verge():
    source = Image.open(SOURCES / "middle-verge-keyed.png").convert("RGBA")
    image = extract_connected_chroma(source, (255, 0, 255), 90)
    image = neutralize_magenta(image)
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("middle verge contains no visible pixels")
    image = image.crop(bbox)
    height = round(image.height * 1500 / image.width)
    image = image.resize((1500, height), Image.Resampling.NEAREST)
    MODULAR.mkdir(parents=True, exist_ok=True)
    image.save(MODULAR / "middle-verge.png")


def build_environment():
    source = Image.open(SOURCES / "environment-02-v2-keyed.png").convert("RGBA")
    if source.size != (1906, 825):
        source = source.resize((1906, 825), Image.Resampling.NEAREST)
    image = extract_connected_chroma(source, (255, 0, 255), 90)
    image = neutralize_magenta(image)
    CHAPTER.mkdir(parents=True, exist_ok=True)
    image.save(CHAPTER / "environment-02-v2.png")


def main():
    build_verge()
    build_environment()


if __name__ == "__main__":
    main()
