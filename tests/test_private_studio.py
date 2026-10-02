"""Private-studio release boundary tests, without network or credentials."""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.private_studio import guard_config, retired_config, write_private_artifacts


class PrivateStudioBoundary(unittest.TestCase):
    def test_later_releases_keep_previously_retired_prompt_urls_blocked(self):
        previous = retired_config(["site/dist/studio-assets/index-first.js"])
        updated = retired_config(["site/dist/studio-assets/index-second.js"], previous)
        self.assertIn("/studio-assets/index-first.js*", updated)
        self.assertIn("/studio-assets/index-second.js*", updated)
        with self.assertRaises(ValueError):
            retired_config([], previous + "file_server\n")

    def test_complete_build_places_private_files_outside_public_root(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            public, private = root / "public", root / "private"
            public.mkdir()
            private.mkdir()
            (public / "old.js").write_bytes(b"private prompt")
            (private / "index.html").write_bytes(b"private prompt")
            with patch(
                "scripts.private_studio.prompt_markers",
                return_value=[b"private prompt"],
            ):
                write_private_artifacts(
                    public, private, root / "output-private", root / "deny.caddy"
                )
            self.assertEqual(
                (root / "output-private/index.html").read_bytes(), b"private prompt"
            )
            self.assertFalse((public / "index.html").exists())
            self.assertIn("/old.js*", (root / "deny.caddy").read_text())

    def test_preserves_live_config_and_installs_guard_once(self):
        original = ":18131 {\n    bind 127.0.0.1\n    root * /live/site/dist\n    file_server\n}\n"
        updated = guard_config(original)
        self.assertIn("root * /live/site/dist", updated)
        self.assertEqual(guard_config(updated), updated)
        self.assertIn("import private-studio.caddy", updated)
        with self.assertRaises(ValueError):
            guard_config(":443 { file_server }")

    def test_retired_paths_cannot_add_caddy_directives(self):
        rendered = retired_config(["site/dist/studio-assets/index-old.js"])
        self.assertIn("path /studio-assets/index-old.js*", rendered)
        self.assertIn("respond @retiredPrivatePrompts 404", rendered)
        for bad in [
            "site/dist/../escape",
            "site/dist/a\nfile_server",
            'site/dist/a"b.js',
        ]:
            with self.assertRaises(ValueError):
                retired_config([bad])
        self.assertEqual(retired_config([]), "# No retired private prompt bundles.\n")


if __name__ == "__main__":
    unittest.main()
