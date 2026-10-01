"""Final review calculations expose every input and reject ineligible selections."""

import json

import pytest

from scripts.naming_final import import_final, prepare, ranking_rows, validate_picks
from scripts.naming_reviews import SCORE_KEYS, WEIGHT_KEYS


def test_final_rankings_use_separate_preferences_and_mean_shared_scores():
    data = {
        "candidates": {
            "moonlet": {
                "morphemes": ["moon", "let"],
                "explanation": "A small moon.",
                "chatgpt": {"scores": dict.fromkeys(SCORE_KEYS, 8)},
                "grok": {"scores": dict.fromkeys(SCORE_KEYS, 4)},
            }
        },
        "weights": {"chatgpt": [50, 0, 50] + [0] * 9, "grok": [0, 100] + [0] * 10},
    }
    rows = ranking_rows(data, {"reports": {"moonlet": {"verdict": "clean"}}})
    assert rows[0]["effective_scores"] == [8, 4] + [6] * 10
    assert rows[0]["totals"] == {"chatgpt": 70, "grok": 40, "average": 55}
    assert rows[0]["explanation"] == "A small moon."
    data["candidates"]["moonlet"]["chatgpt"]["scores"] = {
        **dict.fromkeys(SCORE_KEYS, 8.5),
        "preference": 9,
    }
    data["candidates"]["moonlet"]["grok"]["scores"] = dict.fromkeys(SCORE_KEYS, 8.5)
    data["weights"]["chatgpt"] = [49, 0, 51] + [0] * 9
    # Literal browser result at the 87.45 floating-point rounding boundary.
    assert (
        ranking_rows(data, {"reports": {"moonlet": {"verdict": "clean"}}})[0]["totals"][
            "chatgpt"
        ]
        == 87.4
    )
    proposal = {
        "favorites": [{"name": "moonlet", "reason": "Clear."}],
        "weights": dict(zip(WEIGHT_KEYS, [100] + [0] * 11)),
        "weight_rationale": "Taste.",
    }
    validate_picks(proposal, rows)
    with pytest.raises(ValueError):
        validate_picks(proposal, [{**rows[0], "availability": {"verdict": "taken"}}])


def test_final_import_requires_completed_attempt_and_preserves_scores(tmp_path):
    def save(path, value):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value))

    weights = [100] + [0] * 11
    review = {
        "revision": 1,
        "candidates": {
            "moonlet": {
                "morphemes": ["moon"],
                "explanation": "A little moon.",
                "chatgpt": {"scores": dict.fromkeys(SCORE_KEYS, 8)},
                "grok": {"scores": dict.fromkeys(SCORE_KEYS, 6)},
            }
        },
        "weights": {"chatgpt": weights, "grok": weights},
        "weight_rationale": {"chatgpt": "Taste.", "grok": "Taste."},
        "favorites": {"chatgpt": [], "grok": []},
    }
    source = tmp_path / "site/naming/reviews.json"
    save(source, review)
    save(
        tmp_path / "assets/naming-review/grok-batch-1.json",
        {"brief": "Moon artwork.", "score_definitions": {}},
    )
    (tmp_path / "docs").mkdir()
    (tmp_path / "docs/grant-draft.md").write_text(
        "## The artwork\nA luminous sphere.\n## Budget evidence\n"
    )
    research = tmp_path / "research.json"
    save(
        research,
        {
            "generated_at": "2026-09-30T23:00:00Z",
            "reports": {"moonlet": {"verdict": "clean"}},
        },
    )
    packets, responses = tmp_path / "packets", tmp_path / "responses"
    prepare(tmp_path, research, packets)
    manifest = json.loads((packets / "manifest.json").read_text())
    proposal = {
        "favorites": [{"name": "moonlet", "reason": "Clear."}],
        "weights": dict(zip(WEIGHT_KEYS, weights)),
        "weight_rationale": "Taste.",
    }
    own = tmp_path / "own.json"
    save(own, proposal)
    save(responses / "grok-final/response.txt", proposal)
    save(
        responses / "report.json",
        {
            "status": "completed",
            "model": "grok-4.7",
            "route": "test fixture",
            "version": "fixture",
        },
    )
    attempt = {
        "ok": True,
        "cleanup_confirmed": False,
        "reaped": True,
        "exit_code": 0,
        "prompt_sha256": manifest["packet_sha256"],
    }
    save(responses / "grok-final/attempt.json", attempt)
    with pytest.raises(ValueError, match="Successful owned"):
        import_final(tmp_path, packets, responses, own, False)
    attempt["cleanup_confirmed"] = True
    save(responses / "grok-final/attempt.json", attempt)
    import_final(tmp_path, packets, responses, own, False)
    assert json.loads(source.read_text()) == review
    import_final(tmp_path, packets, responses, own, True)
    result = json.loads(source.read_text())
    assert result["candidates"] == review["candidates"]
    assert result["favorites"]["grok"] == proposal["favorites"]
    assert result["previous_favorites"] == review["favorites"]
    assert result["availability"]["reports"]["moonlet"]["verdict"] == "clean"
