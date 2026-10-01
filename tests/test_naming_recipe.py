import json
from copy import deepcopy

import pytest

from scripts import naming_run, naming_runtime
from scripts.naming_studio import DEFAULT_WEIGHTS, QWEN_MODEL


def test_qwen_rejects_9b_alias_and_never_generates(monkeypatch, tmp_path):
    monkeypatch.setattr(
        naming_runtime,
        "request_json",
        lambda *a, **k: {
            "models": [
                {
                    "name": QWEN_MODEL,
                    "digest": "digest",
                    "details": {"parameter_size": "9.7B"},
                }
            ]
        },
    )
    with pytest.raises(ValueError, match="27B"):
        naming_runtime.Qwen("http://localhost:11434", tmp_path, 10)


def test_qwen_records_identity_and_replays_saved_response(monkeypatch, tmp_path):
    calls = []

    def request(url, payload=None, *args, **kwargs):
        calls.append(url)
        if url.endswith("tags"):
            return {
                "models": [
                    {
                        "name": QWEN_MODEL,
                        "digest": "abc",
                        "details": {"parameter_size": "27.8B"},
                    }
                ]
            }
        assert payload["model"] == QWEN_MODEL
        assert payload["think"] is False
        return {
            "model": QWEN_MODEL,
            "done": True,
            "done_reason": "stop",
            "message": {"content": json.dumps({"rows": [{"name": "proto"}]})},
        }

    monkeypatch.setattr(naming_runtime, "request_json", request)
    ai = naming_runtime.Qwen("http://localhost:11434", tmp_path, 10)
    payload = {"count": 1}
    assert ai("invent", payload) == [{"name": "proto"}]
    assert ai("invent", payload) == [{"name": "proto"}]
    assert len(calls) == 2
    assert json.loads((tmp_path / "model.json").read_text())["digest"] == "abc"


def test_render_uses_batch_counts_project_weights_and_preserves_history(tmp_path):
    import shutil

    shutil.copytree(naming_run.ROOT / "site/naming", tmp_path / "template/naming")
    (tmp_path / "data/families").mkdir(parents=True)
    (tmp_path / "data/families/demo.toml").write_text('purpose = "demo"')
    config = {"project": "demo", "mode": "full-auto"}
    state = {
        "authored": [{"name": "proto", "collection": "Invented", "scores": [8] * 8}],
        "groups": [],
        "archive": [],
        "families": [],
        "weights": DEFAULT_WEIGHTS,
        "phase": "complete",
    }
    original_history = json.loads(
        (tmp_path / "template/naming/report.json").read_text()
    )
    naming_run.render(tmp_path, config, state)
    page = (tmp_path / "site/naming/index.html").read_text()
    assert 'data-project="demo"' in page
    assert "1 inventions" in page
    assert "20 names invented by Codex" not in page
    rendered_history = json.loads((tmp_path / "site/naming/report.json").read_text())
    assert rendered_history["groups"][:-1] == original_history["groups"]
    assert rendered_history["groups"][-1]["candidates"]
    assert (
        json.loads((tmp_path / "site/naming/research-rolls.json").read_text())[
            "weights"
        ]
        == DEFAULT_WEIGHTS
    )
    # Rendering another run from an already rendered template must refresh its notice.
    shutil.copy2(
        tmp_path / "site/naming/index.html", tmp_path / "template/naming/index.html"
    )
    state["authored"].append({"name": "luna"})
    naming_run.render(tmp_path, config, state)
    assert "2 inventions" in (tmp_path / "site/naming/index.html").read_text()


def test_publish_plan_has_no_subprocess_or_site_write(monkeypatch, tmp_path):
    def forbidden(*args, **kwargs):
        raise AssertionError("Plan must not deploy")

    monkeypatch.setattr(naming_run.subprocess, "run", forbidden)
    (tmp_path / "site-manifest.json").write_text("{}")
    naming_run.publish(
        tmp_path,
        {"project": "thatsnozorb"},
        {"phase": "complete", "authored": [], "groups": []},
        "test-host",
        False,
    )
    assert not (tmp_path / "before-publication").exists()


def test_cli_defaults_and_invalid_args_before_output(tmp_path):
    args = naming_run.parser().parse_args(
        [
            "run",
            "--engine",
            str(tmp_path),
            "--palette",
            str(tmp_path / "palette.toml"),
            "--output",
            str(tmp_path / "run"),
        ]
    )
    assert (args.mode, args.count, args.invent_count, args.multi_count) == (
        "assisted",
        40,
        20,
        40,
    )
    assert args.word_counts == [3, 4]
    bad = deepcopy(args)
    bad.weights = [0] * 8
    with pytest.raises(ValueError, match="weights"):
        naming_run.prepare(bad)
    assert not (tmp_path / "run").exists()


def test_deployment_catalog_tracks_supplied_words_and_reserves(tmp_path):
    from scripts.deploy_naming import expected_catalog

    palette = tmp_path / "families.toml"
    palette.write_text(
        '[[families]]\nname="life"\nwords=["proto","plasm"]\nreserve=["genesis"]\n'
    )
    assert json.loads(expected_catalog(palette)) == {
        "life": {"words": ["proto", "plasm"], "pool": ["genesis"]}
    }


def test_publication_passes_saved_paths_and_keeps_backup(monkeypatch, tmp_path):
    root = tmp_path / "artwork"
    output = tmp_path / "run"
    (root / "site/naming").mkdir(parents=True)
    (root / "site/naming/index.html").write_text("before")
    (root / "assets").mkdir()
    (root / "assets/naming-deployment-receipt.json").write_text("{}")
    (output / "site/naming").mkdir(parents=True)
    (output / "site/naming/index.html").write_text("after")
    binary = output / "naming-workbench-linux"
    binary.write_bytes(b"saved Linux binary")
    naming_runtime.save_json(
        output / "inputs.json", {"linux_sha256": naming_run.sha256(binary)}
    )
    naming_runtime.save_json(
        output / "site-manifest.json",
        {"naming/index.html": naming_run.sha256(output / "site/naming/index.html")},
    )
    calls = []
    monkeypatch.setattr(naming_run, "ROOT", root)
    monkeypatch.setattr(
        naming_run, "verify_publication", lambda _: {"verified_files": 1}
    )
    monkeypatch.setattr(
        naming_run.subprocess,
        "run",
        lambda args, **kwargs: calls.append((args, kwargs)),
    )
    naming_run.publish(
        output,
        {"project": "thatsnozorb"},
        {"phase": "complete", "authored": [], "groups": []},
        "example-peer",
        True,
    )
    assert (output / "before-publication/index.html").read_text() == "before"
    assert (root / "site/naming/index.html").read_text() == "after"
    assert calls[0][0] == [
        "just",
        "deploy-naming",
        "--host",
        "example-peer",
        "--binary",
        str(binary),
        "--palette",
        str(output / "data/families/thatsnozorb.toml"),
        "--apply",
    ]
    assert calls[1][0] == ["just", "deploy-site", "--host", "example-peer", "--apply"]
    assert all(call[1]["cwd"] == root and call[1]["check"] for call in calls)


def test_public_verification_rejects_stale_page_bytes(monkeypatch, tmp_path):
    import hashlib
    import io

    (tmp_path / "deploy").mkdir()
    (tmp_path / "deploy/naming-workbench.service").write_text(
        "ExecStart=server --origin https://example.test"
    )
    (tmp_path / "data/families").mkdir(parents=True)
    (tmp_path / "data/families/thatsnozorb.toml").write_text(
        '[[families]]\nname="life"\nwords=["proto"]\n'
    )
    naming_runtime.save_json(
        tmp_path / "site-manifest.json",
        {"naming/index.html": hashlib.sha256(b"new page").hexdigest()},
    )
    monkeypatch.setattr(naming_run, "ROOT", tmp_path)
    monkeypatch.setattr(
        naming_run, "urlopen", lambda *a, **k: io.BytesIO(b"stale page")
    )
    monkeypatch.setattr(
        naming_run,
        "request_json",
        lambda *a, **k: {"families": [{"id": "life", "words": ["proto"], "pool": []}]},
    )
    with pytest.raises(ValueError, match="Published bytes differ"):
        naming_run.verify_publication(tmp_path)
    monkeypatch.setattr(naming_run, "urlopen", lambda *a, **k: io.BytesIO(b"new page"))
    assert naming_run.verify_publication(tmp_path) == {
        "origin": "https://example.test",
        "verified_files": 1,
        "verified_families": 1,
    }
