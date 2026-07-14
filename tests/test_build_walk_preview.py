import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

from scripts.build_walk_preview import build_walk_preview


class BuildWalkPreviewTests(unittest.TestCase):
    def test_builds_eight_cell_strip_and_looping_gif(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "source.png"
            strip = root / "strip.png"
            preview = root / "preview.gif"

            grid = Image.new("RGBA", (400, 300), (0, 0, 0, 0))
            draw = ImageDraw.Draw(grid)
            colors = [
                (220, 40, 40, 255),
                (220, 120, 40, 255),
                (220, 200, 40, 255),
                (40, 180, 60, 255),
                (40, 160, 210, 255),
                (60, 80, 220, 255),
                (150, 70, 210, 255),
                (210, 60, 150, 255),
            ]
            for index, color in enumerate(colors):
                column = index % 4
                row = index // 4
                x = column * 100 + 20
                y = row * 150 + 25
                draw.rectangle((x, y, x + 50, y + 100), fill=color)
            grid.save(source)

            build_walk_preview(source, strip, preview)

            with Image.open(strip) as result:
                self.assertEqual(result.size, (512, 96))
                self.assertEqual(result.mode, "RGBA")
                self.assertEqual(result.getpixel((0, 0))[3], 0)
                sampled = [
                    result.getpixel((index * 64 + 32, 40))[:3]
                    for index in range(8)
                ]
                self.assertEqual(sampled, [color[:3] for color in colors])

            with Image.open(preview) as animation:
                self.assertEqual(animation.size, (256, 384))
                self.assertEqual(animation.n_frames, 8)
                self.assertEqual(animation.info.get("loop"), 0)
                self.assertEqual(animation.info.get("duration"), 100)


if __name__ == "__main__":
    unittest.main()
