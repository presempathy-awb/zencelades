import hashlib
import json
from pathlib import Path

import pytest

from scripts import restore_assets


def write_catalog(root: Path, records: list[dict]) -> None:
    (root / "assets").mkdir(parents=True, exist_ok=True)
    (root / "assets/catalog.json").write_text(json.dumps({"files": records}))
    (root / "assets/v4-catalog.json").write_text(json.dumps({"files": []}))


def entry(path: str, data: bytes, category: str = "original-upload") -> dict:
    return {
        "path": path,
        "bytes": len(data),
        "content_sha256": hashlib.sha256(data).hexdigest(),
        "category": category,
    }


@pytest.mark.unit
@pytest.mark.parametrize("manifest_name", ["catalog.json", "build-inputs.json"])
def test_apply_copies_exact_bytes_and_is_idempotent(
    tmp_path, monkeypatch, manifest_name
):
    root, retained = tmp_path / "target", tmp_path / "retained"
    root.mkdir()
    data = b"original bytes"
    record = entry("deliveries/enceladus_v3/models/original.glb", data, "models")
    write_catalog(root, [record])
    if manifest_name != "catalog.json":
        (root / "assets/catalog.json").rename(root / "assets" / manifest_name)
    (retained / "deliveries/enceladus_v3/models").mkdir(parents=True)
    (retained / record["path"]).write_bytes(data)
    monkeypatch.setattr(restore_assets, "ROOT", root)

    assert restore_assets.restore(retained) == (1, len(data))
    assert not (root / record["path"]).exists()
    assert restore_assets.restore(retained, apply=True) == (1, len(data))
    assert (root / record["path"]).read_bytes() == data
    assert restore_assets.restore(retained, apply=True) == (0, len(data))


@pytest.mark.unit
def test_bad_hash_and_missing_source_prevalidate_before_any_copy(tmp_path, monkeypatch):
    root, retained = tmp_path / "target", tmp_path / "retained"
    root.mkdir()
    good = entry("source/uploads/good.bin", b"good")
    bad = entry("deliveries/bad.bin", b"expected")
    write_catalog(root, [good, bad])
    (retained / "source/uploads").mkdir(parents=True)
    (retained / "deliveries").mkdir()
    (retained / good["path"]).write_bytes(b"good")
    (retained / bad["path"]).write_bytes(b"wrong")
    monkeypatch.setattr(restore_assets, "ROOT", root)
    with pytest.raises(ValueError):
        restore_assets.restore(retained, apply=True)
    assert not (root / good["path"]).exists()
    (retained / bad["path"]).unlink()
    with pytest.raises(ValueError):
        restore_assets.restore(retained, apply=True)
    assert not (root / good["path"]).exists()


@pytest.mark.unit
def test_refuses_invalid_paths_and_linked_sources_or_destinations(
    tmp_path, monkeypatch
):
    root, retained = tmp_path / "target", tmp_path / "retained"
    root.mkdir()
    monkeypatch.setattr(restore_assets, "ROOT", root)
    write_catalog(root, [entry("source/../escape", b"x")])
    with pytest.raises(ValueError):
        restore_assets.restore(retained)
    record = entry("source/uploads/input.bin", b"x")
    write_catalog(root, [record])
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "input.bin").write_bytes(b"x")
    (retained / "source/uploads").mkdir(parents=True)
    (retained / record["path"]).symlink_to(outside / "input.bin")
    with pytest.raises(ValueError):
        restore_assets.restore(retained)
    (retained / record["path"]).unlink()
    (retained / record["path"]).write_bytes(b"x")
    (root / "source").symlink_to(outside, target_is_directory=True)
    with pytest.raises(ValueError):
        restore_assets.restore(retained, apply=True)


@pytest.mark.unit
def test_refuses_conflicting_duplicate_manifests_before_copy(tmp_path, monkeypatch):
    root, retained = tmp_path / "target", tmp_path / "retained"
    root.mkdir()
    first, second = (
        entry("source/uploads/same.bin", b"one"),
        entry("source/uploads/same.bin", b"two"),
    )
    write_catalog(root, [first])
    (root / "assets/v4-catalog.json").write_text(json.dumps({"files": [second]}))
    (retained / "source/uploads").mkdir(parents=True)
    (retained / first["path"]).write_bytes(b"one")
    monkeypatch.setattr(restore_assets, "ROOT", root)
    with pytest.raises(ValueError):
        restore_assets.restore(retained, apply=True)
    assert not (root / first["path"]).exists()


@pytest.mark.unit
def test_refuses_different_existing_destination(tmp_path, monkeypatch):
    root, retained = tmp_path / "target", tmp_path / "retained"
    root.mkdir()
    record = entry("deliveries/preserved.bin", b"catalog bytes")
    write_catalog(root, [record])
    (retained / "deliveries").mkdir(parents=True)
    (retained / record["path"]).write_bytes(b"catalog bytes")
    (root / "deliveries").mkdir()
    (root / record["path"]).write_bytes(b"Andrew's different file")
    monkeypatch.setattr(restore_assets, "ROOT", root)
    with pytest.raises(ValueError):
        restore_assets.restore(retained, apply=True)
    assert (root / record["path"]).read_bytes() == b"Andrew's different file"


@pytest.mark.unit
def test_collects_research_originals_and_projection_inputs(tmp_path, monkeypatch):
    root, retained = tmp_path / "target", tmp_path / "retained"
    root.mkdir()
    write_catalog(root, [])
    videos = root / "assets/enceladus-videos"
    videos.mkdir()
    video = entry("source/research/enceladus-videos/originals/film.mp4", b"film")
    (videos / "catalog.json").write_text(
        json.dumps(
            {
                "sources": [
                    {
                        "local_path": video["path"],
                        "relative_path": "originals/film.mp4",
                        "bytes": video["bytes"],
                        "content_sha256": video["content_sha256"],
                    }
                ]
            }
        )
    )
    projection = root / "assets/enceladus-projection"
    projection.mkdir()
    models = [
        entry("deliveries/grant-3d-p059/lander.glb", b"lander"),
        entry("deliveries/grant-3d-p059/suspended.glb", b"suspended"),
    ]
    (projection / "catalog.json").write_text(json.dumps({"inputs": models}))
    for record in [video, *models]:
        source = retained / record["path"]
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_bytes(
            b"film"
            if record is video
            else record["path"].rsplit("/", 1)[-1].split(".")[0].encode()
        )
    monkeypatch.setattr(restore_assets, "ROOT", root)

    assert restore_assets.restore(retained, apply=True)[0] == 3
    for record in [video, *models]:
        assert (root / record["path"]).read_bytes() == (
            retained / record["path"]
        ).read_bytes()


@pytest.mark.unit
def test_changed_source_during_copy_is_not_published(tmp_path, monkeypatch):
    root, retained = tmp_path / "target", tmp_path / "retained"
    root.mkdir()
    record = entry("source/uploads/change.bin", b"original")
    write_catalog(root, [record])
    source = retained / record["path"]
    source.parent.mkdir(parents=True)
    source.write_bytes(b"original")
    monkeypatch.setattr(restore_assets, "ROOT", root)
    copyfileobj = restore_assets.shutil.copyfileobj

    def change_before_copy(src, dst):
        source.write_bytes(b"changed")
        copyfileobj(src, dst)

    monkeypatch.setattr(restore_assets.shutil, "copyfileobj", change_before_copy)
    with pytest.raises(ValueError, match="changed while copying"):
        restore_assets.restore(retained, apply=True)
    assert not (root / record["path"]).exists()
    assert not list((root / "source/uploads").glob(".restore-assets-*"))


@pytest.mark.unit
def test_rejects_dangling_source_and_destination_parent_links(tmp_path, monkeypatch):
    root, retained = tmp_path / "target", tmp_path / "retained"
    root.mkdir()
    record = entry("source/uploads/original.bin", b"original")
    write_catalog(root, [record])
    monkeypatch.setattr(restore_assets, "ROOT", root)
    (retained / "source").mkdir(parents=True)
    (retained / "source/uploads").symlink_to(tmp_path / "missing-source")
    with pytest.raises(ValueError, match="Symbolic link"):
        restore_assets.restore(retained)

    (retained / "source/uploads").unlink()
    (retained / "source/uploads").mkdir()
    (retained / record["path"]).write_bytes(b"original")
    (root / "source").symlink_to(tmp_path / "missing-destination")
    with pytest.raises(ValueError, match="Symbolic link"):
        restore_assets.restore(retained, apply=True)
