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
REPAIRED_FOREGROUND = [
    CHAPTER / "foreground-02-v2.png",
    CHAPTER / "foreground-03-v2.png",
    CHAPTER / "foreground-04-v2.png",
]


def opaque_ratio(image, box):
    left, top, right, bottom = box
    opaque = sum(
        image.getpixel((x, y))[3] > 240
        for x in range(left, right)
        for y in range(top, bottom)
    )
    return opaque / ((right - left) * (bottom - top))


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

    def test_repaired_foreground_panels_share_the_approved_frame(self):
        for path in REPAIRED_FOREGROUND:
            with Image.open(path) as image:
                self.assertEqual(image.size, (1906, 825), path.name)

    def test_repaired_foreground_has_solid_walkable_ground(self):
        for path in REPAIRED_FOREGROUND:
            image = Image.open(path).convert("RGBA")
            for x in range(image.width):
                self.assertTrue(
                    all(image.getpixel((x, y))[3] > 240 for y in range(665, 825)),
                    f"{path.name} has transparent ground at x={x}",
                )

    def test_repaired_panel_two_closes_the_empty_rear_edge(self):
        image = Image.open(REPAIRED_FOREGROUND[0]).convert("RGBA")
        self.assertGreaterEqual(opaque_ratio(image, (650, 610, 1200, 665)), 0.55)

    def test_repaired_airport_boundary_has_no_large_crossing_object(self):
        panel_three = Image.open(REPAIRED_FOREGROUND[1]).convert("RGBA")
        panel_four = Image.open(REPAIRED_FOREGROUND[2]).convert("RGBA")
        self.assertLess(opaque_ratio(panel_three, (1858, 300, 1906, 640)), 0.25)
        self.assertLess(opaque_ratio(panel_four, (0, 300, 48, 640)), 0.25)


if __name__ == "__main__":
    unittest.main()
