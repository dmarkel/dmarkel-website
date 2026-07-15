import unittest
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / "assets" / "backgrounds" / "houston-proof"
CHAPTER = ROOT / "assets" / "backgrounds" / "houston-chapter"
FAR = [PROOF / "far.png", CHAPTER / "far-02.png"]
ENVIRONMENT = [PROOF / "environment.png", CHAPTER / "environment-02.png"]
FOREGROUND = [
    PROOF / "foreground.png",
    CHAPTER / "foreground-02.png",
    CHAPTER / "foreground-03.png",
    CHAPTER / "foreground-04.png",
]


class HoustonChapterAssetTests(unittest.TestCase):
    def test_all_panels_share_the_approved_frame(self):
        paths = FAR + ENVIRONMENT + FOREGROUND
        sizes = set()
        for path in paths:
            with Image.open(path) as image:
                sizes.add(image.size)
        self.assertEqual(sizes, {(1906, 825)})

    def test_far_strip_is_fully_opaque(self):
        for path in FAR:
            alpha = Image.open(path).convert("RGBA").getchannel("A")
            self.assertEqual(alpha.getextrema(), (255, 255))

    def test_environment_strip_has_useful_alpha(self):
        for path in ENVIRONMENT:
            alpha = Image.open(path).convert("RGBA").getchannel("A")
            self.assertEqual(alpha.getextrema(), (0, 255))

    def test_every_foreground_column_has_walkable_ground(self):
        for path in FOREGROUND:
            image = Image.open(path).convert("RGBA")
            for x in range(image.width):
                self.assertTrue(
                    any(image.getpixel((x, y))[3] > 240 for y in range(640, 825)),
                    f"{path.name} is missing ground at x={x}",
                )


if __name__ == "__main__":
    unittest.main()
