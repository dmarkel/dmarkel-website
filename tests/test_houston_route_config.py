import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class HoustonRouteConfigTests(unittest.TestCase):
    def test_static_site_bypasses_unneeded_jekyll_build(self):
        self.assertTrue((ROOT / ".nojekyll").exists())

    def test_route_imports_modular_foreground(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn('from "./houston-foreground.js?v=chapter-6"', source)

    def test_route_no_longer_loads_baked_foreground_panels(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertNotIn("foreground-01-v3.png", source)
        self.assertNotIn("foreground-03-v4.png", source)

    def test_avatar_walks_on_source_line_735(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("groundLine: 735", source)

    def test_route_uses_chapter_6_cache_version(self):
        source = (ROOT / "houston.html").read_text()
        self.assertIn("houston-game.js?v=chapter-6", source)

    def test_changed_geometry_module_uses_chapter_6_cache_version(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn('from "./scene-geometry.js?v=chapter-6"', source)

    def test_route_uses_road_free_airport_environment(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("environment-02-v2.png", source)
        self.assertNotIn('"assets/backgrounds/houston-chapter/environment-02.png"', source)

    def test_environment_uses_endpoint_aligned_parallax(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("endpointAlignedFactor", source)
        self.assertIn('layer.name === "environment"', source)


if __name__ == "__main__":
    unittest.main()
