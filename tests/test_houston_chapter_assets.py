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
EDGE_SAFE_FOREGROUND = [
    CHAPTER / "foreground-01-v3.png",
    CHAPTER / "foreground-02-v3.png",
    CHAPTER / "foreground-03-v3.png",
    CHAPTER / "foreground-04-v3.png",
]
MIDDLE_REBUILD = CHAPTER / "foreground-03-v4.png"


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

    def test_edge_safe_foregrounds_share_the_approved_frame(self):
        for path in EDGE_SAFE_FOREGROUND:
            with Image.open(path) as image:
                self.assertEqual(image.size, (1906, 825), path.name)

    def test_edge_safe_foregrounds_have_solid_walkable_ground(self):
        for path in EDGE_SAFE_FOREGROUND:
            image = Image.open(path).convert("RGBA")
            for x in range(image.width):
                self.assertTrue(
                    all(image.getpixel((x, y))[3] > 240 for y in range(665, 825)),
                    f"{path.name} has transparent ground at x={x}",
                )

    def test_first_boundary_keeps_large_objects_out_of_edge_zones(self):
        panel_one = Image.open(EDGE_SAFE_FOREGROUND[0]).convert("RGBA")
        panel_two = Image.open(EDGE_SAFE_FOREGROUND[1]).convert("RGBA")
        self.assertLess(opaque_ratio(panel_one, (1810, 0, 1906, 610)), 0.25)
        self.assertLess(opaque_ratio(panel_two, (0, 0, 96, 610)), 0.25)

    def test_second_boundary_keeps_large_objects_out_of_edge_zones(self):
        panel_two = Image.open(EDGE_SAFE_FOREGROUND[1]).convert("RGBA")
        panel_three = Image.open(EDGE_SAFE_FOREGROUND[2]).convert("RGBA")
        self.assertLess(opaque_ratio(panel_two, (1810, 0, 1906, 610)), 0.25)
        self.assertLess(opaque_ratio(panel_three, (0, 0, 96, 610)), 0.25)

    def test_third_panel_has_no_elevated_foreground_freeway_mass(self):
        panel_three = Image.open(EDGE_SAFE_FOREGROUND[2]).convert("RGBA")
        self.assertLess(opaque_ratio(panel_three, (850, 280, 1500, 590)), 0.18)

    def test_terminal_decoration_has_no_large_partial_alpha_mass(self):
        panel_four = Image.open(EDGE_SAFE_FOREGROUND[3]).convert("RGBA")
        alpha = panel_four.crop((1600, 320, 1835, 665)).getchannel("A")
        values = list(alpha.getdata())
        partial_ratio = sum(0 < value < 255 for value in values) / len(values)
        self.assertLess(partial_ratio, 0.02)

    def test_middle_rebuild_has_approved_frame(self):
        with Image.open(MIDDLE_REBUILD) as image:
            self.assertEqual(image.size, (1906, 825))

    def test_middle_rebuild_has_solid_walkable_ground(self):
        image = Image.open(MIDDLE_REBUILD).convert("RGBA")
        self.assertTrue(
            all(
                image.getpixel((x, y))[3] > 240
                for x in range(1906)
                for y in range(665, 825)
            )
        )

    def test_middle_rebuild_has_no_overhead_sign(self):
        image = Image.open(MIDDLE_REBUILD).convert("RGBA")
        self.assertLess(opaque_ratio(image, (350, 120, 1100, 360)), 0.04)

    def test_middle_rebuild_has_no_empty_center_runs(self):
        image = Image.open(MIDDLE_REBUILD).convert("RGBA")
        for left in range(96, 1810, 160):
            with self.subTest(left=left):
                self.assertGreater(
                    opaque_ratio(image, (left, 500, min(left + 160, 1810), 665)),
                    0.12,
                )

    def test_middle_rebuild_limits_partial_alpha_damage(self):
        alpha = (
            Image.open(MIDDLE_REBUILD)
            .convert("RGBA")
            .crop((96, 500, 1810, 665))
            .getchannel("A")
        )
        visible = [value for value in alpha.getdata() if value > 0]
        self.assertTrue(visible)
        self.assertLess(sum(value < 255 for value in visible) / len(visible), 0.03)


if __name__ == "__main__":
    unittest.main()
