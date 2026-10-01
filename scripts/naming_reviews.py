"""Validate and import independent naming reviews; plan by default."""

import argparse
import hashlib
import json
import math
from pathlib import Path

SCORE_KEYS = [
    "preference",
    "sayability",
    "memory",
    "cleverness",
    "moon",
    "wordplay",
    "roots",
    "character",
    "inventiveness",
    "explanation",
    "holistic",
]
WEIGHT_KEYS = ["preference", "grok_preference", *SCORE_KEYS[1:]]


def unique_object(pairs: list) -> dict:
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(), object_pairs_hook=unique_object)


def valid_number(value: object, upper: float) -> bool:
    return type(value) in (int, float) and math.isfinite(value) and 0 <= value <= upper


def validate_response(response: dict, packet: dict) -> dict:
    """Require complete, independent ratings and bounded eligible nominations."""
    expected = {c["name"] for c in packet["candidates"]}
    result = {}
    rows = response.get("reviews")
    if not isinstance(rows, list):
        raise TypeError("Response needs a reviews list")
    for row in rows:
        name = row.get("name")
        scores = row.get("scores")
        if name not in expected or name in result:
            raise ValueError("Foreign or duplicate reviewed name")
        if (
            not isinstance(scores, dict)
            or set(scores) != set(SCORE_KEYS)
            or any(not valid_number(v, 10) for v in scores.values())
        ):
            raise ValueError("Eleven finite category scores required")
        if not isinstance(row.get("rationale"), str) or not row["rationale"].strip():
            raise ValueError("Each review needs a rationale")
        result[name] = {"scores": scores, "rationale": row["rationale"]}
    if set(result) != expected:
        raise ValueError("Every requested name needs a review")
    if "revival_pool" in packet:
        weights = response.get("weights")
        if (
            not isinstance(weights, dict)
            or set(weights) != set(WEIGHT_KEYS)
            or any(not valid_number(v, 100) for v in weights.values())
            or not math.isclose(sum(weights.values()), 100)
        ):
            raise ValueError("Twelve nonnegative weights totaling 100 required")
        if (
            not isinstance(response.get("weight_rationale"), str)
            or not response["weight_rationale"].strip()
        ):
            raise ValueError("Explain the weight proposal")
        pool = {c["name"] for c in packet["revival_pool"]}
        favorites = response.get("favorites")
        if not isinstance(favorites, list) or len(favorites) > 15:
            raise ValueError("At most fifteen favorites allowed")
        seen = set()
        for item in favorites:
            name = item.get("name")
            if (
                name not in pool
                or name in seen
                or not isinstance(item.get("reason"), str)
                or not item["reason"].strip()
            ):
                raise ValueError(
                    "Favorites must be distinct eligible historical names with reasons"
                )
            seen.add(name)
    return result


def compile_reviews(project: Path, packet_dir: Path, responses: Path) -> dict:
    """Bind actual adapter results to the prepared candidate set and source data."""
    manifest = read_json(packet_dir / "manifest.json")
    for name, digest in manifest["source_sha256"].items():
        if hashlib.sha256((project / name).read_bytes()).hexdigest() != digest:
            raise ValueError("Source changed after review preparation")
    editorial = {}
    for line in (packet_dir / "chatgpt-scores.txt").read_text().splitlines():
        if not line or line.startswith("#"):
            continue
        name, compact = line.split()
        if (
            name in editorial
            or len(compact) != 11
            or not compact.isascii()
            or not compact.isdigit()
        ):
            raise ValueError("Invalid ChatGPT editorial score row")
        editorial[name] = dict(zip(SCORE_KEYS, map(int, compact), strict=True))
    own_proposal = read_json(packet_dir / "chatgpt-proposal.json")
    preserved = manifest.get("preserved_chatgpt_preferences", {})
    if not isinstance(preserved, dict) or any(
        name not in editorial or not valid_number(value, 10)
        for name, value in preserved.items()
    ):
        raise ValueError("Invalid preserved ChatGPT preferences")
    candidates = {}
    receipts = []
    proposal = None
    for item in manifest["packets"]:
        packet_path = packet_dir / Path(item["path"]).name
        if hashlib.sha256(packet_path.read_bytes()).hexdigest() != item["sha256"]:
            raise ValueError("Prepared packet changed")
        packet = read_json(packet_path)
        folder = responses / packet_path.stem
        attempt = read_json(folder / "attempt.json")
        if (
            attempt.get("ok") is not True
            or attempt.get("cleanup_confirmed") is not True
            or attempt.get("reaped") is not True
            or attempt.get("exit_code") != 0
            or attempt.get("prompt_sha256") != item["sha256"]
        ):
            raise ValueError(
                "An actual successful matching adapter receipt is required"
            )
        response_path = folder / "response.txt"
        response = read_json(response_path)
        reviews = validate_response(response, packet)
        receipts.append(
            {
                "batch": packet["batch"],
                "prompt_sha256": item["sha256"],
                "response_sha256": hashlib.sha256(
                    response_path.read_bytes()
                ).hexdigest(),
            }
        )
        for candidate in packet["candidates"]:
            name = candidate["name"]
            if name in candidates or name not in editorial:
                raise ValueError("Missing or duplicate editorial assessment")
            own = editorial[name]
            own["preference"] = preserved.get(name, own["preference"])
            candidates[name] = {
                "morphemes": candidate["morphemes"],
                "explanation": candidate["explanation"],
                "chatgpt": {"scores": own},
                "grok": reviews[name],
            }
        if "revival_pool" in packet:
            proposal = response
            validate_response({**own_proposal, "reviews": response["reviews"]}, packet)
    if (
        set(candidates) != set(editorial)
        or len(candidates) != manifest["candidate_count"]
        or not proposal
    ):
        raise ValueError("Incomplete candidate or proposal coverage")
    adapter_report = read_json(responses / "report.json")
    if (
        adapter_report.get("status") != "completed"
        or adapter_report.get("model") != "grok-4.7"
    ):
        raise ValueError("Completed Grok adapter report required")
    return {
        "revision": 1,
        "dimensions": WEIGHT_KEYS,
        "candidates": candidates,
        "weights": {
            "chatgpt": [own_proposal["weights"][key] for key in WEIGHT_KEYS],
            "grok": [proposal["weights"][key] for key in WEIGHT_KEYS],
        },
        "weight_rationale": {
            "chatgpt": own_proposal["weight_rationale"],
            "grok": proposal["weight_rationale"],
        },
        "favorites": {
            "chatgpt": own_proposal["favorites"],
            "grok": proposal["favorites"],
        },
        "provenance": {
            "route": adapter_report["route"],
            "deployed_queue": False,
            "grok_model": adapter_report["model"],
            "grok_cli": adapter_report["version"],
            "receipts": receipts,
            "chatgpt": "ChatGPT editorial assessment of ten shared categories for every eligible name; existing current personal-preference values retained as requested. Historical preferences newly assessed.",
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--project", type=Path, default=Path(__file__).resolve().parents[1]
    )
    parser.add_argument("--packets", type=Path)
    parser.add_argument("--responses", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    result = compile_reviews(
        args.project,
        args.packets or args.project / "assets/naming-review",
        args.responses,
    )
    destination = args.output or args.project / "site/naming/reviews.json"
    if args.apply:
        temporary = destination.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
        temporary.replace(destination)
    print(
        json.dumps(
            {
                "candidates": len(result["candidates"]),
                "output": str(destination),
                "applied": args.apply,
                "favorites": {
                    key: len(rows) for key, rows in result["favorites"].items()
                },
            }
        )
    )


if __name__ == "__main__":
    main()
