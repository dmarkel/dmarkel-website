import sys
import unittest
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tools.extract_connected_chroma import extract_connected_chroma


class ConnectedChromaTests(unittest.TestCase):
    def test_border_background_is_removed_but_enclosed_key_color_survives(self):
        image = Image.new("RGB", (20, 20), "#ff00ff")
        draw = ImageDraw.Draw(image)
        draw.rectangle((5, 5, 14, 14), fill="#375461")
        draw.rectangle((8, 8, 11, 11), fill="#f10aee")

        result = extract_connected_chroma(image, (255, 0, 255), 35)

        self.assertEqual(result.getpixel((0, 0))[3], 0)
        self.assertEqual(result.getpixel((9, 9))[3], 255)

    def test_opaque_ground_remains_opaque(self):
        image = Image.new("RGB", (20, 20), "#ff00ff")
        ImageDraw.Draw(image).rectangle((0, 14, 19, 19), fill="#9d8e75")

        result = extract_connected_chroma(image, (255, 0, 255), 35)

        self.assertTrue(
            all(
                result.getpixel((x, y))[3] == 255
                for x in range(20)
                for y in range(14, 20)
            )
        )


if __name__ == "__main__":
    unittest.main()
