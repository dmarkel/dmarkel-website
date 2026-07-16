import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class HoustonRouteConfigTests(unittest.TestCase):
    def test_route_imports_modular_foreground(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn('from "./houston-foreground.js"', source)

    def test_route_no_longer_loads_baked_foreground_panels(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertNotIn("foreground-01-v3.png", source)
        self.assertNotIn("foreground-03-v4.png", source)

    def test_avatar_walks_on_source_line_735(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("groundLine: 735", source)

    def test_route_uses_chapter_5_cache_version(self):
        source = (ROOT / "houston.html").read_text()
        self.assertIn("houston-game.js?v=chapter-5", source)

    def test_changed_geometry_module_uses_chapter_5_cache_version(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn('from "./scene-geometry.js?v=chapter-5"', source)


if __name__ == "__main__":
    unittest.main()
