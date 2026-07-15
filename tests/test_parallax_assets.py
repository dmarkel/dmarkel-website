import unittest
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
LAYER_DIR = ROOT / "assets" / "backgrounds" / "houston"
NAMES = [
    "layer-01-sky.png",
    "layer-02-clouds.png",
    "layer-03-far-landmarks.png",
    "layer-04-primary-architecture.png",
    "layer-05-near-environment.png",
    "layer-06-foreground-accents.png",
    "layer-07-ground.png",
]


class ParallaxAssetTests(unittest.TestCase):
    def test_layers_share_dimensions_and_overlays_have_useful_alpha(self):
        images = [Image.open(LAYER_DIR / name).convert("RGBA") for name in NAMES]
        self.assertEqual({image.size for image in images}, {(1906, 825)})
        # The foreground tree intentionally touches the upper-left edge, while
        # every overlay leaves the upper-right corner open to the sky.
        self.assertTrue(all(image.getpixel((1905, 0))[3] == 0 for image in images[1:]))
        for image in images[1:]:
            alpha = image.getchannel("A")
            low, high = alpha.getextrema()
            self.assertEqual(low, 0)
            self.assertGreater(high, 200)


if __name__ == "__main__":
    unittest.main()
