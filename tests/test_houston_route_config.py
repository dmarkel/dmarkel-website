import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class HoustonRouteConfigTests(unittest.TestCase):
    def test_static_site_bypasses_unneeded_jekyll_build(self):
        self.assertTrue((ROOT / ".nojekyll").exists())

    def test_route_imports_modular_foreground(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn('from "./houston-foreground.js?v=chapter-8"', source)

    def test_route_no_longer_loads_baked_foreground_panels(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertNotIn("foreground-01-v3.png", source)
        self.assertNotIn("foreground-03-v4.png", source)

    def test_avatar_walks_on_source_line_735(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("groundLine: 735", source)

    def test_route_uses_chapter_8_cache_version(self):
        source = (ROOT / "houston.html").read_text()
        self.assertIn("houston-game.js?v=chapter-8", source)

    def test_changed_geometry_module_uses_chapter_8_cache_version(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn('from "./scene-geometry.js?v=chapter-8"', source)

    def test_route_uses_road_free_airport_environment(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("environment-02-v2.png", source)
        self.assertNotIn('"assets/backgrounds/houston-chapter/environment-02.png"', source)

    def test_environment_uses_endpoint_aligned_parallax(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("endpointAlignedFactor", source)
        self.assertIn('layer.name === "environment"', source)

    def test_only_lamar_environment_has_vertical_offset(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("panelOffsetYs: [80, 0]", source)
        self.assertIn("layer.panelOffsetYs", source)

    def test_world_ends_at_manifest_terminal_edge(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("width: FOREGROUND.endSourceX * scene.scale", source)
        self.assertNotIn("width: scene.width * 4", source)

    def test_avatar_is_painted_between_back_and_front_props(self):
        source = (ROOT / "src/houston-game.js").read_text()
        back_statement = "drawProps(images, FOREGROUND.backProps, cameraX);"
        player_statement = "drawPlayer(images, alpha);"
        front_statement = "drawProps(images, FOREGROUND.frontProps, cameraX);"
        self.assertIn(back_statement, source)
        self.assertIn(player_statement, source)
        self.assertIn(front_statement, source)
        back_call = source.index(back_statement)
        player_call = source.index(player_statement)
        front_call = source.index(front_statement)
        self.assertLess(back_call, player_call)
        self.assertLess(player_call, front_call)


if __name__ == "__main__":
    unittest.main()
