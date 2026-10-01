"""Availability refresh preserves evidence and never converts gaps to clearance."""

import json

from scripts.naming_research import combine, main, missing


def test_inventory_uses_completed_receipts_on_resume(tmp_path, monkeypatch, capsys):
    site = tmp_path / "site/naming"
    site.mkdir(parents=True)
    output = tmp_path / "run"
    output.mkdir()
    (site / "research-rolls.json").write_text(
        json.dumps({"authored": [{"name": "moonlet"}], "groups": []})
    )
    (site / "report.json").write_text('{"groups": []}')
    (site / "verification.json").write_text("[]")
    receipt = {
        "evidence": [
            {
                "layer": layer,
                "status": "negative",
                "checked_at": "2026-09-30T00:00:00Z",
                "expires_at": "2100-01-01T00:00:00Z",
            }
            for layer in ["search:brave", "github", "pkg:npm", "rdap:com"]
        ]
    }
    (output / "receipt-moonlet.json").write_text(json.dumps([receipt]))
    monkeypatch.setattr(
        "sys.argv",
        [
            "research",
            "--project",
            str(tmp_path),
            "--engine",
            str(tmp_path),
            "--output",
            str(output),
        ],
    )
    main()
    assert json.loads(capsys.readouterr().out)["pending"] == 0


def test_merge_preserves_fresh_evidence_and_any_known_collision():
    def evidence(layer, status, checked="2026-09-30T20:00:00Z"):
        return {
            "layer": layer,
            "status": status,
            "checked_at": checked,
            "expires_at": "2026-10-01T20:00:00Z",
        }

    old = {
        "evidence": [
            evidence("github", "negative"),
            evidence("domain:com", "negative"),
            evidence("pkg:npm", "negative"),
        ]
    }
    fresh = {
        "evidence": [
            evidence("github", "unavailable", "2026-09-30T22:00:00Z"),
            evidence("search:brave", "negative"),
        ]
    }
    merged = combine("moonlet", [old, fresh], "2026-09-30T23:00:00Z")
    assert merged["verdict"] == "clean"
    assert merged["evidence"][1]["checked_at"] == "2026-09-30T20:00:00Z"
    assert missing(merged, "2026-10-02T00:00:00Z") == [
        "search:brave",
        "github",
        "pkg:npm",
        "rdap:com",
    ]
    assert combine("moonlet", [old], "2026-09-30T23:00:00Z")["verdict"] == "unverified"
    assert (
        combine("moonlet", [{"verdict": "taken"}, merged], "2026-09-30T23:00:00Z")[
            "verdict"
        ]
        == "taken"
    )
    hit = {"evidence": [evidence("social:codeberg", "positive")]}
    assert (
        combine("moonlet", [merged, hit], "2026-09-30T23:00:00Z")["verdict"] == "taken"
    )
