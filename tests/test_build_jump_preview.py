import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageDraw, ImageSequence

from scripts.build_jump_preview import build_jump_preview


class BuildJumpPreviewTests(unittest.TestCase):
    def test_builds_five_cell_strip_and_timed_preview(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "source.png"
            strip = root / "strip.png"
            preview = root / "preview.gif"

            sheet = Image.new("RGBA", (500, 200), (0, 0, 0, 0))
            draw = ImageDraw.Draw(sheet)
            colors = [
                (220, 40, 40, 255),
                (220, 130, 40, 255),
                (220, 210, 40, 255),
                (40, 160, 210, 255),
                (130, 70, 210, 255),
            ]
            for index, color in enumerate(colors):
                x = index * 100 + 25
                draw.rectangle((x, 35, x + 50, 155), fill=color)
            sheet.save(source)

            build_jump_preview(source, strip, preview)

            with Image.open(strip) as result:
                self.assertEqual(result.size, (320, 96))
                self.assertEqual(result.mode, "RGBA")
                self.assertEqual(result.getpixel((0, 0))[3], 0)
                sampled = [
                    result.getpixel((index * 64 + 32, 40))[:3]
                    for index in range(5)
                ]
                self.assertEqual(sampled, [color[:3] for color in colors])

            with Image.open(preview) as animation:
                self.assertEqual(animation.size, (256, 384))
                self.assertEqual(animation.n_frames, 5)
                self.assertEqual(animation.info.get("loop"), 0)
                durations = [
                    frame.info.get("duration")
                    for frame in ImageSequence.Iterator(animation)
                ]
                self.assertEqual(durations, [100, 100, 180, 100, 160])


if __name__ == "__main__":
    unittest.main()
