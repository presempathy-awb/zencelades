import hashlib
import json
import zipfile
from pathlib import Path

import pytest

from scripts.assets import extract_zip, verify_release


def archive(path: Path, entries: dict[str, bytes]) -> Path:
    with zipfile.ZipFile(path, "w") as handle:
        for name, data in entries.items():
            handle.writestr(name, data)
    return path


@pytest.mark.unit
def test_extract_preserves_bytes_and_rejects_escape_before_writing(tmp_path):
    source = archive(tmp_path / "valid.zip", {"enceladus_v3/a.txt": b"original\r\n"})
    target = tmp_path / "delivery"
    extract_zip(source, target)
    assert (target / "enceladus_v3/a.txt").read_bytes() == b"original\r\n"
    invalid = archive(tmp_path / "bad.zip", {"ok.txt": b"ok", "../escape": b"bad"})
    with pytest.raises(ValueError):
        extract_zip(invalid, tmp_path / "bad")
    assert not (tmp_path / "bad/ok.txt").exists()
    assert not (tmp_path / "escape").exists()


@pytest.mark.unit
def test_extract_refuses_changed_existing_file(tmp_path):
    target = tmp_path / "delivery"
    target.mkdir()
    (target / "a.txt").write_bytes(b"Andrew's work")
    source = archive(tmp_path / "input.zip", {"a.txt": b"other"})
    with pytest.raises(ValueError):
        extract_zip(source, target)
    assert (target / "a.txt").read_bytes() == b"Andrew's work"


@pytest.mark.unit
def test_release_requires_exact_file_set_and_matching_bytes(tmp_path):
    body = b"original"
    (tmp_path / "a.txt").write_bytes(body)
    manifest = {
        "files": {
            "a.txt": {"bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()}
        }
    }
    (tmp_path / "manifest.json").write_text(json.dumps(manifest))
    assert verify_release(tmp_path) == 1
    (tmp_path / "a.txt").write_bytes(b"tampered")
    with pytest.raises(ValueError):
        verify_release(tmp_path)
    (tmp_path / "a.txt").write_bytes(body)
    (tmp_path / "unexpected.txt").write_bytes(b"new")
    with pytest.raises(ValueError):
        verify_release(tmp_path)
