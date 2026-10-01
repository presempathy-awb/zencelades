"""Reject incomplete or fabricated reviewer imports."""

import copy

import pytest

from scripts.naming_reviews import SCORE_KEYS, WEIGHT_KEYS, validate_response


def test_review_requires_exact_coverage_and_finite_scores():
    packet = {"candidates": [{"name": "moonlet"}, {"name": "splish"}]}
    response = {
        "reviews": [
            {
                "name": name,
                "scores": dict.fromkeys(SCORE_KEYS, 7),
                "rationale": "Clear but familiar.",
            }
            for name in ["moonlet", "splish"]
        ]
    }
    assert set(validate_response(response, packet)) == {"moonlet", "splish"}
    for invalid in [[], response["reviews"][:1], [response["reviews"][0]] * 2]:
        with pytest.raises(ValueError):
            validate_response({"reviews": invalid}, packet)
    for value in [float("nan"), True, -1, 11, "7"]:
        broken = copy.deepcopy(response)
        broken["reviews"][0]["scores"]["preference"] = value
        with pytest.raises(ValueError):
            validate_response(broken, packet)


def test_weight_and_favorite_proposals_cannot_add_names_or_omit_dimensions():
    packet = {"candidates": [{"name": "moonlet"}], "revival_pool": [{"name": "splish"}]}
    response = {
        "reviews": [
            {
                "name": "moonlet",
                "scores": dict.fromkeys(SCORE_KEYS, 8),
                "rationale": "Gentle but familiar.",
            }
        ],
        "weights": {key: (100 if key == "preference" else 0) for key in WEIGHT_KEYS},
        "weight_rationale": "Personal taste drives selection.",
        "favorites": [{"name": "splish", "reason": "Compact and playful."}],
    }
    validate_response(response, packet)
    packet["revival_pool"] = [{"name": f"choice{i}"} for i in range(16)]
    response["favorites"] = [
        {"name": f"choice{i}", "reason": "Final choice."} for i in range(15)
    ]
    validate_response(response, packet)
    with pytest.raises(ValueError):
        validate_response(
            {
                **response,
                "favorites": response["favorites"]
                + [{"name": "choice15", "reason": "Excess."}],
            },
            packet,
        )
    for field, value in [
        ("favorites", [{"name": "eliminated", "reason": "No."}]),
        ("favorites", response["favorites"] * 11),
        ("weights", {"preference": 100}),
    ]:
        broken = {**response, field: value}
        with pytest.raises(ValueError):
            validate_response(broken, packet)
