from copy import deepcopy

import pytest

from scripts.naming_studio import DEFAULT_WEIGHTS, run_pipeline, validate_judgments


def config():
    return {
        "project": "demo",
        "mode": "full-auto",
        "count": 3,
        "invent_count": 2,
        "multi_count": 2,
        "word_counts": [3, 4],
        "levels": [0, 1],
        "seed": 42,
        "weights": DEFAULT_WEIGHTS,
        "research": "light",
        "reroll_rounds": 2,
        "brief": "Water, life, stars",
    }


def initial():
    return {
        "families": [
            {"id": f"family_{i}", "words": [w], "selected": [w], "enabled": True}
            for i, w in enumerate(["proto", "luna", "wave", "astral"])
        ],
        "authored": [],
        "groups": [],
        "archive": [],
        "phase": "prepared",
    }


def providers():
    serial = 0

    def ai(task, payload):
        if task == "invent":
            return [
                {
                    "name": "usedidea" if not payload["excluded"] else "freshidea",
                    "morphemes": ["proto", "luna"],
                    "explanation": "Soft life, moonlight",
                },
                {
                    "name": "astralooze",
                    "morphemes": ["astral", "ooze"],
                    "explanation": "A wandering living form",
                },
            ][: payload["count"]]
        return [
            {
                "name": c["name"],
                "scores": [8] * 8,
                "explanation": "Reviewed naming proposal",
            }
            for c in payload["candidates"]
        ]

    def api(payload):
        nonlocal serial
        if payload["action"] == "verify":
            return {
                "report": {
                    "name": payload["words"][0],
                    "verdict": "taken"
                    if payload["words"][0] == "usedidea"
                    else "unverified",
                    "evidence": [{"layer": "github", "status": "unavailable"}],
                }
            }
        serial += 1
        roots = ["proto", "luna", "wave", "astral"][: payload["word_count"]]
        if payload.get("seed_words"):
            assert not set(payload["seed_words"]) & set(payload["excluded"])
            roots[0] = payload["seed_words"][0]
        return {
            "candidates": [
                {
                    "name": "blend" + chr(97 + serial) + chr(97 + i),
                    "morphemes": roots,
                    "mix": " + ".join(roots),
                    "join_levels": [1] * (len(roots) - 1),
                    "verdict": "unverified",
                }
                for i in range(10)
            ]
        }

    return api, ai


def test_full_auto_replaces_collisions_preserves_unknowns_and_scores_every_name():
    state = initial()
    api, ai = providers()
    saved = []
    run_pipeline(config(), state, api, ai, lambda: saved.append(deepcopy(state)))
    assert state["phase"] == "complete"
    assert len(state["authored"]) == 2
    assert [len(g["candidates"]) for g in state["groups"]] == [3, 3, 2]
    candidates = state["authored"] + [
        c for g in state["groups"] for c in g["candidates"]
    ]
    assert len({c["name"] for c in candidates}) == 10
    assert all(c["report"]["verdict"] == "unverified" for c in candidates)
    assert all(c["scores"] == [8] * 8 and c["overall"] == 80 for c in candidates)
    assert any(
        c["name"] == "usedidea" and c["report"]["verdict"] == "taken"
        for c in state["archive"]
    )
    assert any(snapshot["phase"] != "complete" for snapshot in saved)
    for c in state["groups"][-1]["candidates"]:
        assert c["morphemes"][0] in {c["name"] for c in state["authored"]}


def test_assisted_run_pauses_for_scores_and_resumes_without_rerolling():
    settings = {**config(), "mode": "assisted", "research": "skip"}
    state = initial()
    api, ai = providers()
    state["authored"] = ai("invent", {"count": 2, "excluded": ["usedidea"]})
    run_pipeline(settings, state, api, None, lambda: None)
    assert state["phase"] == "needs-review"
    before = deepcopy(state["groups"])
    rows = ai(
        "judge",
        {
            "candidates": state["authored"]
            + [c for g in state["groups"] for c in g["candidates"]]
        },
    )

    def no_network(_):
        raise AssertionError("Resume must reuse generation and research checkpoints")

    run_pipeline(settings, state, no_network, None, lambda: None, rows)
    assert state["phase"] == "complete"
    assert [[c["name"] for c in g["candidates"]] for g in before] == [
        [c["name"] for c in g["candidates"]] for g in state["groups"]
    ]


@pytest.mark.parametrize(
    "rows",
    [
        [],
        [{"name": "other", "scores": [8] * 8, "explanation": "x"}],
        [{"name": "proto", "scores": [float("nan")] * 8, "explanation": "x"}],
        [{"name": "proto", "scores": [11] * 8, "explanation": "x"}],
        [{"name": "proto", "scores": [8] * 7, "explanation": "x"}],
    ],
)
def test_rejects_missing_foreign_and_invalid_scores(rows):
    with pytest.raises(ValueError):
        validate_judgments(rows, ["proto"])


def test_custom_weights_change_ranking():
    state = initial()
    api, ai = providers()
    settings = {**config(), "weights": [100, 0, 0, 0, 0, 0, 0, 0]}
    run_pipeline(settings, state, api, ai, lambda: None)
    rows = state["authored"] + [c for g in state["groups"] for c in g["candidates"]]
    judgments = [
        {
            "name": row["name"],
            "scores": [index] + [10] * 7,
            "explanation": "Deliberately varied preference",
        }
        for index, row in enumerate(rows)
    ]
    run_pipeline(settings, state, api, None, lambda: None, judgments)
    assert state["ranking"][0] == rows[-1]["name"]
    assert rows[0]["overall"] == 0
    assert rows[-1]["overall"] == 90


def test_interruption_retains_accepted_names_for_resume():
    state = initial()
    api, ai = providers()
    calls = 0

    def interrupted(payload):
        nonlocal calls
        if payload["action"] == "roll":
            calls += 1
            if calls == 3:
                raise OSError("interrupted")
        return api(payload)

    with pytest.raises(OSError, match="interrupted"):
        run_pipeline(config(), state, interrupted, ai, lambda: None)
    names = [c["name"] for c in state["groups"][0]["candidates"]]
    assert len(names) == 2
    run_pipeline(config(), state, api, ai, lambda: None)
    assert state["phase"] == "complete"
    assert [c["name"] for c in state["groups"][0]["candidates"]][:2] == names


def test_default_full_roll_makes_20_40_40_40_with_independent_strengths():
    state = initial()
    settings = {
        **config(),
        "count": 40,
        "invent_count": 20,
        "multi_count": 40,
        "levels": [0, 1, 2, 3, 4],
        "research": "skip",
    }
    serial = 0

    def ai(task, payload):
        if task == "invent":
            return [
                {
                    "name": "idea" + chr(97 + i),
                    "morphemes": ["proto", "luna"],
                    "explanation": "A new life",
                }
                for i in range(payload["count"])
            ]
        return [
            {"name": c["name"], "scores": [8] * 8, "explanation": "Editorial judgment"}
            for c in payload["candidates"]
        ]

    requests = []

    def api(payload):
        nonlocal serial
        requests.append(payload)
        serial += 1
        roots = ["proto", "luna", "wave", "astral"][: payload["word_count"]]
        if payload["seed_words"]:
            roots[0] = payload["seed_words"][0]
        return {
            "candidates": [
                {
                    "name": "blend" + chr(97 + serial // 26) + chr(97 + serial % 26),
                    "morphemes": roots,
                }
            ]
        }

    run_pipeline(settings, state, api, ai, lambda: None)
    assert [len(state["authored"])] + [
        len(g["candidates"]) for g in state["groups"]
    ] == [20, 40, 40, 40]
    for n in (3, 4):
        ordinary = [r for r in requests if r["word_count"] == n and not r["seed_words"]]
        assert [
            sum(r["mesh_level"] == strength for r in ordinary) for strength in range(5)
        ] == [8] * 5
    multi = [r for r in requests if r["seed_words"]]
    assert all(r["mesh_level"] == 5 for r in multi)
    assert [sum(r["word_count"] == n for r in multi) for n in (3, 4)] == [20, 20]
