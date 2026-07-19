import unittest
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "backgrounds" / "bloomington-proof"
FAR = ("far-01.png", "far-02.png")
ENVIRONMENT = ("environment-01.png", "environment-02.png")
GROUND = "ground-strip.png"
PROPS = {
    "bench.png": (150, 96),
    "campus-lamp.png": (64, 190),
    "planter.png": (128, 100),
    "newspaper-box.png": (80, 108),
    "parking-meter.png": (45, 118),
    "bike-rack.png": (80, 88),
    "student-pair.png": (150, 150),
}


def open_rgba(name):
    path = ASSET_DIR / name
    if not path.exists():
        raise AssertionError(f"missing Bloomington proof asset: {path}")
    return Image.open(path).convert("RGBA")


def seam_scores(mask, slope):
    height, width = mask.shape
    ys = np.arange(8, min(90, height))
    scores = []
    for x0 in range(0, width, 4):
        xs = np.rint(x0 + slope * (ys - 8)).astype(int)
        valid = (xs >= 0) & (xs < width)
        if valid.any():
            scores.append(float(mask[ys[valid], xs[valid]].mean()))
    return scores


class BloomingtonProofAssetTests(unittest.TestCase):
    def test_far_and_environment_panels_use_proof_geometry(self):
        for name in FAR + ENVIRONMENT:
            with self.subTest(name=name):
                self.assertEqual(open_rgba(name).size, (1906, 825))

    def test_far_panels_are_fully_opaque(self):
        for name in FAR:
            with self.subTest(name=name):
                self.assertEqual(open_rgba(name).getchannel("A").getextrema(), (255, 255))

    def test_environment_join_has_no_large_upper_object(self):
        panel_one = np.asarray(open_rgba("environment-01.png"))
        panel_two = np.asarray(open_rgba("environment-02.png"))
        seam_regions = (panel_one[:560, -128:, 3], panel_two[:560, :128, 3])
        for index, alpha in enumerate(seam_regions, start=1):
            self.assertLess(
                float((alpha > 0).mean()),
                0.05,
                f"environment seam side {index} contains a large upper object",
            )

    def test_environment_panels_have_no_visible_magenta_contamination(self):
        for name in ENVIRONMENT:
            with self.subTest(name=name):
                pixels = np.asarray(open_rgba(name)).astype(np.int16)
                visible = pixels[:, :, 3] > 0
                red, green, blue = (
                    pixels[:, :, 0], pixels[:, :, 1], pixels[:, :, 2]
                )
                contaminated = visible & (red > 90) & (blue > 90) & (
                    np.minimum(red, blue) - green > 35
                )
                self.assertFalse(bool(contaminated.any()))

    def test_ground_is_opaque_and_uses_exact_geometry(self):
        image = open_rgba(GROUND)
        self.assertEqual(image.size, (3812, 160))
        self.assertEqual(image.getchannel("A").getextrema(), (255, 255))

    def test_ground_top_edge_contains_only_clean_pavement(self):
        pixels = np.asarray(open_rgba(GROUND))[:20, :, :3].astype(float)
        green_background = (
            (pixels[:, :, 1] > pixels[:, :, 0] * 1.08)
            & (pixels[:, :, 1] > pixels[:, :, 2] * 1.20)
        )
        near_black = pixels.mean(axis=2) < 45
        self.assertLess(float(green_background.mean()), 0.003)
        self.assertLess(float(near_black.mean()), 0.003)

    def test_ground_seams_use_only_downward_right_perspective(self):
        pavement = np.asarray(open_rgba(GROUND))[:90, :, :3].astype(float)
        grayscale = pavement.mean(axis=2)
        row_median = np.median(grayscale, axis=1)[:, None]
        dark_detail = grayscale < row_median - 22

        desired = max(
            sum(score > 0.28 for score in seam_scores(dark_detail, slope))
            for slope in (0.75, 1.0, 1.25, 1.5)
        )
        competing = max(
            sum(score > 0.28 for score in seam_scores(dark_detail, slope))
            for slope in (-0.75, -1.0, -1.25, -1.5)
        )
        self.assertGreater(desired, competing * 1.40)

    def test_props_have_exact_geometry_and_clean_binary_alpha(self):
        for name, size in PROPS.items():
            with self.subTest(name=name):
                image = open_rgba(name)
                self.assertEqual(image.size, size)
                alpha = np.asarray(image.getchannel("A"))
                self.assertLessEqual(set(np.unique(alpha)), {0, 255})
                self.assertEqual(int(alpha[0, 0]), 0)
                self.assertEqual(int(alpha[0, -1]), 0)
                self.assertEqual(int(alpha[-1, 0]), 0)
                self.assertEqual(int(alpha[-1, -1]), 0)

                pixels = np.asarray(image).astype(np.int16)
                visible = pixels[:, :, 3] > 0
                coverage = float(visible.mean())
                self.assertGreater(coverage, 0.05)
                self.assertLess(coverage, 0.85)
                red, green, blue = (
                    pixels[:, :, 0], pixels[:, :, 1], pixels[:, :, 2]
                )
                contaminated = visible & (red > 90) & (blue > 90) & (
                    np.minimum(red, blue) - green > 35
                )
                self.assertFalse(bool(contaminated.any()))


if __name__ == "__main__":
    unittest.main()
