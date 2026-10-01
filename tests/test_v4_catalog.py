"""Direct unittest checks for the supplied flat-manifest package format."""

import hashlib
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from scripts.catalog_v4 import verify_package


class PackageIntegrityTest(unittest.TestCase):
    def test_accepts_exact_package_and_rejects_changed_file_sets(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            release = root / "release"
            release.mkdir()
            payload = release / "README.md"
            payload.write_bytes(b"source data\n")
            manifest = {
                "README.md": {
                    "bytes": 12,
                    "sha256": hashlib.sha256(payload.read_bytes()).hexdigest(),
                }
            }
            (release / "manifest.json").write_text(json.dumps(manifest))
            archive = root / "package.zip"
            with zipfile.ZipFile(archive, "w") as bundle:
                for path in release.iterdir():
                    bundle.write(path, str(path.relative_to(root)))
            self.assertEqual(verify_package(release, archive), 1)
            for bad in (b"changed text", b"short"):
                with self.subTest(payload=bad):
                    payload.write_bytes(bad)
                    with self.assertRaisesRegex(ValueError, "differs"):
                        verify_package(release, archive)
            payload.write_bytes(b"source data\n")
            extra = release / "unlisted.txt"
            extra.write_text("not in manifest")
            with self.assertRaisesRegex(ValueError, "file set"):
                verify_package(release, archive)
            extra.unlink()
            payload.unlink()
            with self.assertRaisesRegex(ValueError, "file set"):
                verify_package(release, archive)


if __name__ == "__main__":
    unittest.main()
