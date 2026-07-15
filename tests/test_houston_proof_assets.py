import unittest
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
LAYER_DIR = ROOT / "assets" / "backgrounds" / "houston-proof"
NAMES = ["far.png", "environment.png", "foreground.png"]


class HoustonProofAssetTests(unittest.TestCase):
    def setUp(self):
        self.images = {
            name: Image.open(LAYER_DIR / name).convert("RGBA")
            for name in NAMES
        }

    def test_layers_share_the_proof_frame(self):
        self.assertEqual({image.size for image in self.images.values()}, {(1906, 825)})

    def test_far_layer_is_fully_opaque(self):
        self.assertEqual(self.images["far.png"].getchannel("A").getextrema(), (255, 255))

    def test_overlays_contain_transparent_and_opaque_pixels(self):
        for name in ("environment.png", "foreground.png"):
            self.assertEqual(self.images[name].getchannel("A").getextrema(), (0, 255))

    def test_foreground_sidewalk_covers_every_column(self):
        foreground = self.images["foreground.png"]
        for x in range(foreground.width):
            column_has_ground = any(
                foreground.getpixel((x, y))[3] > 240
                for y in range(690, foreground.height)
            )
            self.assertTrue(column_has_ground, f"missing sidewalk at x={x}")


if __name__ == "__main__":
    unittest.main()
