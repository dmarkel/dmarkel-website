import unittest

from PIL import Image

from tools.extend_bloomington_ground import extend_ground


class ExtendBloomingtonGroundTests(unittest.TestCase):
    def test_extension_preserves_every_approved_source_pixel(self):
        source = Image.new("RGBA", (8, 4))
        for x in range(source.width):
            for y in range(source.height):
                source.putpixel((x, y), (20 + x, 40 + y, 60, 255))

        result = extend_ground(source, target_width=16, stadium_start=12, blend_width=2)

        self.assertEqual(result.size, (16, 4))
        self.assertEqual(result.crop((0, 0, 8, 4)).tobytes(), source.tobytes())

    def test_extension_repeats_geometry_without_alpha_gaps(self):
        source = Image.new("RGBA", (8, 4), (120, 110, 100, 255))

        result = extend_ground(source, target_width=16, stadium_start=12, blend_width=2)

        self.assertEqual(result.getchannel("A").getextrema(), (255, 255))
        self.assertNotEqual(result.getpixel((15, 1)), source.getpixel((7, 1)))


if __name__ == "__main__":
    unittest.main()
