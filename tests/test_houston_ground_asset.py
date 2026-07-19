import os
import unittest
from pathlib import Path

import numpy as np
from PIL import Image


GROUND_PATH = Path(
    os.environ.get(
        "HOUSTON_GROUND_PATH",
        "assets/backgrounds/houston-modular/ground-strip.png",
    )
)


def seam_scores(mask, slope):
    height, width = mask.shape
    ys = np.arange(8, min(80, height))
    scores = []
    for x0 in range(0, width, 4):
        xs = np.rint(x0 + slope * (ys - 8)).astype(int)
        valid = (xs >= 0) & (xs < width)
        if valid.any():
            scores.append(float(mask[ys[valid], xs[valid]].mean()))
    return scores


class HoustonGroundAssetTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.image = Image.open(GROUND_PATH).convert("RGBA")
        cls.pixels = np.asarray(cls.image)

    def test_ground_strip_keeps_game_geometry(self):
        self.assertEqual(self.image.size, (3812, 160))
        self.assertTrue(np.all(self.pixels[:, :, 3] == 255))

    def test_top_edge_contains_clean_sidewalk_not_background_fringes(self):
        top = self.pixels[:20, :, :3].astype(float)
        green_background = (
            (top[:, :, 1] > top[:, :, 0] * 1.08)
            & (top[:, :, 1] > top[:, :, 2] * 1.20)
        )
        dark_border = top.mean(axis=2) < 45
        self.assertLess(
            float(green_background.mean()),
            0.003,
            "top of ground strip still contains green background pixels",
        )
        self.assertLess(
            float(dark_border.mean()),
            0.003,
            "top of ground strip still contains a dark generator border",
        )

    def test_sidewalk_seams_use_one_consistent_diagonal_direction(self):
        pavement = self.pixels[:90, :, :3].astype(float)
        grayscale = pavement.mean(axis=2)
        row_median = np.median(grayscale, axis=1)[:, None]
        dark_detail = grayscale < row_median - 22

        right_leaning = max(
            sum(score > 0.28 for score in seam_scores(dark_detail, slope))
            for slope in (0.75, 1.0, 1.25, 1.5)
        )
        left_leaning = max(
            sum(score > 0.28 for score in seam_scores(dark_detail, slope))
            for slope in (-0.75, -1.0, -1.25, -1.5)
        )

        self.assertGreater(
            right_leaning,
            left_leaning * 1.40,
            "sidewalk contains competing left- and right-leaning seam perspectives",
        )


if __name__ == "__main__":
    unittest.main()
