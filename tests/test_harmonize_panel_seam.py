import unittest

from PIL import Image

from tools.harmonize_panel_seam import harmonize_vertical_seam


class HarmonizePanelSeamTests(unittest.TestCase):
    def test_join_pixels_match_without_changing_distant_interior(self):
        left = Image.new("RGB", (20, 8), (40, 120, 180))
        right = Image.new("RGB", (20, 8), (70, 150, 210))

        corrected_left, corrected_right = harmonize_vertical_seam(left, right, 6)

        self.assertEqual(
            list(corrected_left.crop((19, 0, 20, 8)).getdata()),
            list(corrected_right.crop((0, 0, 1, 8)).getdata()),
        )
        self.assertEqual(corrected_left.getpixel((0, 4)), (40, 120, 180, 255))
        self.assertEqual(corrected_right.getpixel((19, 4)), (70, 150, 210, 255))

    def test_mismatched_panel_heights_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "same height"):
            harmonize_vertical_seam(
                Image.new("RGB", (20, 8)),
                Image.new("RGB", (20, 9)),
                4,
            )


if __name__ == "__main__":
    unittest.main()
