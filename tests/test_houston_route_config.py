import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class HoustonRouteConfigTests(unittest.TestCase):
    def test_route_uses_rebuilt_middle_panel(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("foreground-03-v4.png", source)

    def test_avatar_walks_on_source_line_735(self):
        source = (ROOT / "src/houston-game.js").read_text()
        self.assertIn("groundLine: 735", source)


if __name__ == "__main__":
    unittest.main()
