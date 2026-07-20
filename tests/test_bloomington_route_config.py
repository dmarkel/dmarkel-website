import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class BloomingtonRouteConfigTests(unittest.TestCase):
    def test_route_exists_and_uses_bloomington_cache_key(self):
        html = (ROOT / "bloomington.html").read_text()
        self.assertIn("Bloomington · 2007 proof", html)
        self.assertIn("bloomington-game.js?v=bloomington-6", html)

    def test_game_uses_only_bloomington_scene_art(self):
        source = (ROOT / "src/bloomington-game.js").read_text()
        self.assertIn('from "./bloomington-foreground.js?v=bloomington-6"', source)
        self.assertIn('from "./modular-foreground.js?v=bloomington-5"', source)
        self.assertIn("assets/backgrounds/bloomington-proof/far-01.png", source)
        self.assertIn("assets/backgrounds/bloomington-proof/environment-01-v2.png", source)
        self.assertIn(
            "assets/backgrounds/bloomington-proof/environment-02-v4.png?v=bloomington-6",
            source,
        )
        self.assertNotIn(
            '"assets/backgrounds/bloomington-proof/environment-02.png',
            source,
        )
        self.assertNotIn("assets/backgrounds/bloomington-proof/environment-01.png", source)
        self.assertNotIn("assets/backgrounds/houston", source)

    def test_avatar_and_shared_physics_are_reused(self):
        source = (ROOT / "src/bloomington-game.js").read_text()
        self.assertIn('from "./player.js"', source)
        self.assertIn("assets/avatar/avatar-walk-right.png", source)
        self.assertIn("assets/avatar/avatar-jump-right.png", source)

    def test_world_ends_at_nicks_manifest_edge(self):
        source = (ROOT / "src/bloomington-game.js").read_text()
        self.assertIn("width: FOREGROUND.endSourceX * scene.scale", source)
        self.assertNotIn("width: scene.width * 2", source)

    def test_kirkwood_environment_meets_the_visible_street_grade(self):
        source = (ROOT / "src/bloomington-game.js").read_text()
        self.assertIn("offsetYs: [0, -54]", source)
        self.assertIn("layer.offsetYs", source)

    def test_curb_props_use_the_avatar_visual_scale(self):
        source = (ROOT / "src/bloomington-game.js").read_text()
        self.assertIn("sceneY,\n      scale,", source)

    def test_avatar_is_painted_between_back_and_curb_props(self):
        source = (ROOT / "src/bloomington-game.js").read_text()
        back = "drawProps(images, FOREGROUND.backProps, cameraX);"
        player = "drawPlayer(images, alpha);"
        front = "drawProps(images, FOREGROUND.frontProps, cameraX);"
        self.assertLess(source.index(back), source.index(player))
        self.assertLess(source.index(player), source.index(front))

    def test_home_and_houston_routes_are_unchanged(self):
        self.assertTrue((ROOT / "index.html").exists())
        self.assertTrue((ROOT / "houston.html").exists())


if __name__ == "__main__":
    unittest.main()
