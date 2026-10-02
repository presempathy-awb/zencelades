"""Exercise release packaging and fail-closed recording without external tools."""

import json
import subprocess
import sys
import tarfile

import pytest

from scripts import deploy_site


@pytest.mark.parametrize("recording_fails", [False, True])
def test_release_contains_fresh_recording_or_stops_before_upload(
    tmp_path, monkeypatch, recording_fails
):
    monkeypatch.setattr(deploy_site, "ROOT", tmp_path)
    monkeypatch.setattr(sys, "argv", ["deploy-site", "--host", "fixture", "--apply"])
    (tmp_path / "site/dist").mkdir(parents=True)
    (tmp_path / "site/dist/index.html").write_text("<body><main>Catalog</main></body>")
    (tmp_path / "site/homepage-loop.html").write_text(
        '<video src="/film/homepage-loop.mp4"></video>'
    )
    (tmp_path / "cockpit/dist/film").mkdir(parents=True)
    (tmp_path / "cockpit/dist/film/homepage-loop.mp4").write_bytes(b"stale")
    (tmp_path / "assets").mkdir()
    (tmp_path / "deploy").mkdir()
    for name in ("Caddyfile", "thatsnozorb.service", "activate.sh"):
        (tmp_path / "deploy" / name).write_text("fixture")
    monkeypatch.setattr(deploy_site, "build", lambda: None)
    uploads = []

    def run(command, **kwargs):
        if command[0] == "node":
            if recording_fails:
                raise subprocess.CalledProcessError(1, command)
            (tmp_path / "cockpit/dist/film/homepage-loop.mp4").write_bytes(b"fresh")
        elif command[0] == "scp":
            if recording_fails:
                pytest.fail("An unsuccessful recording must never reach upload")
            with tarfile.open(command[1]) as archive:
                uploads.append(
                    archive.extractfile("site/dist/film/homepage-loop.mp4").read()
                )
                home = archive.extractfile("site/dist/index.html").read().decode()
                assert '<video src="/film/homepage-loop.mp4">' in home
                assert "<main>Catalog</main>" in home
                manifest = json.load(archive.extractfile("release-files.json"))
                movie = next(
                    e
                    for e in manifest
                    if e["path"] == "site/dist/film/homepage-loop.mp4"
                )
                assert movie["bytes"] == 5
                assert (
                    movie["sha256"]
                    == "d098ab5e44b9aabb755f76d806598f43573c662b35e4a2eab1e312ec9ad195e2"
                )
        return subprocess.CompletedProcess(command, 0)

    monkeypatch.setattr(deploy_site.subprocess, "run", run)
    if recording_fails:
        with pytest.raises(subprocess.CalledProcessError):
            deploy_site.main()
        assert not (tmp_path / "assets/deployment-receipt.json").exists()
    else:
        deploy_site.main()
        assert uploads == [b"fresh"]
