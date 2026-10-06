"""Exercise the installed scanner against public synthetic digest fixtures."""

import hashlib
import json
import shutil
import subprocess
from pathlib import Path

import pytest


@pytest.mark.integration
@pytest.mark.skipif(
    shutil.which("gitleaks") is None, reason="Gitleaks is not installed"
)
def test_digest_exceptions_require_the_exact_path_and_value(tmp_path):
    config = Path(__file__).resolve().parents[1] / ".gitleaks.toml"
    released = "867bbc4cf698c11b662e98d419b58bfb72db99cc3236f0eb75ac3590afd85954"
    renderer = "d94fcc97c0b272619406aadda9a1c58bd5c72d6a157707b307fe9b8d61998fff"
    fixtures = [
        ("docs/naming-verification.md", released),
        ("source/research/enceladus-cinema/web/homepage-recording.json", renderer),
    ]
    changed = hashlib.sha256(b"public p148 scanner negative fixture").hexdigest()
    for number, (allowed_path, digest) in enumerate(fixtures):
        for label, relative, value, expected in [
            ("allowed", allowed_path, digest, 0),
            ("wrong-path", "another-document.txt", digest, 1),
            ("wrong-component", "other" + allowed_path, digest, 1),
            ("wrong-value", allowed_path, changed, 1),
        ]:
            folder = tmp_path / f"{number}-{label}"
            file = folder / relative
            file.parent.mkdir(parents=True)
            file.write_text(json.dumps({"api_key": value}))
            result = subprocess.run(
                [
                    "gitleaks",
                    "dir",
                    str(folder),
                    "--config",
                    str(config),
                    "--no-banner",
                    "--no-color",
                    "--redact",
                    "--timeout",
                    "10",
                ],
                capture_output=True,
                text=True,
                timeout=20,
                check=False,
            )
            assert result.returncode == expected, (
                label,
                result.stdout,
                result.stderr,
            )
