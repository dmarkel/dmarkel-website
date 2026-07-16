import unittest
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MODULAR = ROOT / "assets" / "backgrounds" / "houston-modular"
GROUND = MODULAR / "ground-strip.png"
REQUIRED_PROPS = (
    "iron-start.png", "iron-middle.png", "iron-gate.png", "iron-end.png",
    "chain-start.png", "chain-middle.png", "chain-end.png",
    "planter.png", "cabinet.png", "bench.png", "bike-rack.png",
    "bollards.png", "street-lamp.png", "terminal.png",
)


class HoustonModularAssetTests(unittest.TestCase):
    def test_ground_tile_is_opaque_and_seamless(self):
        image = Image.open(GROUND).convert("RGBA")
        self.assertEqual(image.size, (3812, 160))
        self.assertEqual(image.getchannel("A").getextrema(), (255, 255))
        left = list(image.crop((0, 0, 1, 160)).getdata())
        right = list(image.crop((3811, 0, 3812, 160)).getdata())
        self.assertEqual(left, right)

    def test_required_props_have_binary_alpha_and_no_magenta_contamination(self):
        for name in REQUIRED_PROPS:
            with self.subTest(name=name):
                image = Image.open(MODULAR / name).convert("RGBA")
                alpha = set(image.getchannel("A").getdata())
                self.assertLessEqual(alpha, {0, 255})
                contaminated = sum(
                    a > 0 and r > 90 and b > 90 and min(r, b) - g > 35
                    for r, g, b, a in image.getdata()
                )
                self.assertEqual(contaminated, 0)


if __name__ == "__main__":
    unittest.main()
