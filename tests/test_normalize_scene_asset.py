import subprocess
import sys
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

from tools.normalize_scene_asset import (
    align_visible_bottom,
    align_visible_band_right,
    align_visible_right,
    cover_resize,
    normalize_keyed,
    normalize_opaque,
    trim_dark_matte,
)


class NormalizeSceneAssetTests(unittest.TestCase):
    def test_script_entrypoint_imports_sibling_tool_from_repo_root(self):
        root = Path(__file__).resolve().parents[1]
        result = subprocess.run(
            [sys.executable, "tools/normalize_scene_asset.py", "--help"],
            cwd=root,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("--key-color", result.stdout)

    def test_cover_resize_preserves_target_aspect_without_stretching(self):
        source = Image.new("RGB", (200, 200), "#223344")
        result = cover_resize(source, 400, 100)
        self.assertEqual(result.size, (400, 100))

    def test_dark_matte_is_removed_from_a_wide_generated_strip(self):
        source = Image.new("RGB", (300, 200), "#000000")
        ImageDraw.Draw(source).rectangle((0, 70, 299, 129), fill="#b8a98f")
        result = trim_dark_matte(source)
        self.assertEqual(result.size, (300, 60))
        self.assertGreater(min(result.convert("RGB").getpixel((10, 10))), 24)

    def test_empty_dark_matte_is_rejected(self):
        source = Image.new("RGB", (20, 20), "#000000")
        with self.assertRaisesRegex(ValueError, "no non-matte pixels"):
            trim_dark_matte(source)

    def test_opaque_normalization_forces_full_alpha(self):
        source = Image.new("RGBA", (10, 10), (50, 80, 100, 30))
        result = normalize_opaque(source, (20, 10), trim_matte=False)
        self.assertEqual(result.size, (20, 10))
        self.assertEqual(result.getchannel("A").getextrema(), (255, 255))

    def test_keyed_normalization_has_binary_alpha_and_clear_border(self):
        source = Image.new("RGB", (20, 20), "#ff00ff")
        ImageDraw.Draw(source).rectangle((5, 4, 14, 19), fill="#375461")
        result = normalize_keyed(source, (20, 20), (255, 0, 255), 35)

        self.assertLessEqual(set(result.getchannel("A").getdata()), {0, 255})
        for x in range(20):
            self.assertEqual(result.getpixel((x, 0))[3], 0)
            self.assertEqual(result.getpixel((x, 19))[3], 0)
        for y in range(20):
            self.assertEqual(result.getpixel((0, y))[3], 0)
            self.assertEqual(result.getpixel((19, y))[3], 0)

    def test_keyed_normalization_neutralizes_enclosed_magenta_spill(self):
        source = Image.new("RGB", (20, 20), "#ff00ff")
        draw = ImageDraw.Draw(source)
        draw.rectangle((4, 4, 15, 15), fill="#375461")
        draw.point((10, 10), fill="#965096")

        result = normalize_keyed(source, (20, 20), (255, 0, 255), 35)

        red, green, blue, alpha = result.getpixel((10, 10))
        self.assertEqual(alpha, 255)
        self.assertLessEqual(red, green)
        self.assertLessEqual(blue, green)

    def test_keyed_environment_can_preserve_an_opaque_endpoint_edge(self):
        source = Image.new("RGB", (20, 20), "#ff00ff")
        ImageDraw.Draw(source).rectangle((12, 4, 19, 19), fill="#375461")

        result = normalize_keyed(
            source,
            (20, 20),
            (255, 0, 255),
            35,
            transparent_border=0,
        )

        self.assertEqual(result.getpixel((19, 10))[3], 255)

    def test_visible_subject_can_be_aligned_to_the_right_endpoint(self):
        source = Image.new("RGBA", (20, 10), (0, 0, 0, 0))
        ImageDraw.Draw(source).rectangle((4, 2, 15, 8), fill="#375461")

        result = align_visible_right(source)

        self.assertEqual(result.getpixel((19, 5))[3], 255)
        self.assertEqual(result.getpixel((3, 5))[3], 0)

    def test_architecture_band_can_define_the_right_endpoint(self):
        source = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
        draw = ImageDraw.Draw(source)
        draw.rectangle((4, 2, 15, 12), fill="#375461")
        draw.line((4, 18, 19, 18), fill="#375461")

        result = align_visible_band_right(source, 14)

        self.assertEqual(result.getpixel((19, 8))[3], 255)
        self.assertEqual(result.getpixel((3, 8))[3], 0)

    def test_visible_subject_can_be_aligned_to_a_shared_bottom_baseline(self):
        source = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
        ImageDraw.Draw(source).rectangle((4, 2, 15, 11), fill="#375461")

        result = align_visible_bottom(source, 14)

        self.assertEqual(result.getchannel("A").getbbox(), (4, 5, 16, 15))

    def test_bottom_alignment_rejects_an_out_of_bounds_baseline(self):
        source = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
        ImageDraw.Draw(source).rectangle((4, 2, 15, 11), fill="#375461")

        with self.assertRaisesRegex(ValueError, "visible bottom"):
            align_visible_bottom(source, 20)


if __name__ == "__main__":
    unittest.main()
