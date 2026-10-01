"""Checkpointed naming generation, research and editorial scoring."""

import math
import re
from collections.abc import Callable
from datetime import UTC, datetime

DEFAULT_WEIGHTS = [50, 12, 10, 8, 7, 5, 5, 3]
QWEN_MODEL = "qwen3.5:27b"
SCORE_LABELS = [
    "Personal preference",
    "Sayability",
    "Memorability",
    "Water play",
    "Ocean moon",
    "Light & morphing",
    "Root clarity",
    "Distinctive sound",
]


def validate_judgments(rows: list, names: list[str]) -> dict:
    if not isinstance(rows, list) or len(rows) != len(names):
        raise ValueError("Supply exactly one judgment per requested name")
    result = {}
    for row in rows:
        name = row.get("name")
        scores = row.get("scores")
        if name not in names or name in result:
            raise ValueError("Judgment has a foreign or duplicate name")
        if (
            not isinstance(scores, list)
            or len(scores) != 8
            or any(
                type(s) not in (int, float) or not math.isfinite(s) or not 0 <= s <= 10
                for s in scores
            )
        ):
            raise ValueError("Each name needs eight finite scores from zero to ten")
        if (
            not isinstance(row.get("explanation"), str)
            or not row["explanation"].strip()
        ):
            raise ValueError("Explain each judgment")
        result[name] = row
    return result


def validate_ideas(rows: list, count: int, excluded: set[str]) -> list:
    if not isinstance(rows, list) or len(rows) != count:
        raise ValueError(f"Expected {count} invented names")
    seen = set(excluded)
    for row in rows:
        name = row.get("name", "")
        if not re.fullmatch(r"[a-z]{2,24}", name) or name in seen:
            raise ValueError(f"Invalid or duplicate invented name: {name!r}")
        if (
            not isinstance(row.get("morphemes"), list)
            or not row["morphemes"]
            or any(
                not isinstance(w, str) or not re.fullmatch(r"[a-z]{2,24}", w)
                for w in row["morphemes"]
            )
            or not isinstance(row.get("explanation"), str)
            or not row["explanation"].strip()
        ):
            raise ValueError("Invented names need roots and an explanation")
        seen.add(name)
    return rows


def candidates(state: dict) -> list:
    return state["authored"] + [c for g in state["groups"] for c in g["candidates"]]


def run_pipeline(
    config: dict,
    state: dict,
    api: Callable,
    ai: Callable | None,
    checkpoint: Callable,
    judgments: list | None = None,
) -> None:
    """Resume only unfinished work; every accepted result is checkpointed."""

    def excluded():
        return {c["name"] for c in candidates(state) + state["archive"]}

    def research(row):
        if "report" not in row:
            if config["research"] == "skip":
                row["report"] = {
                    "verdict": "unverified",
                    "complete": False,
                    "evidence": [],
                    "detail": "Research explicitly skipped",
                }
            else:
                row["report"] = api(
                    {
                        "action": "verify",
                        "project": config["project"],
                        "words": [row["name"]],
                    }
                )["report"]
            checkpoint()
        return row["report"].get("verdict") == "taken"

    if state["phase"] != "complete":
        state["phase"] = "inventing"
        for row in list(state["authored"]):
            if research(row):
                state["authored"].remove(row)
                state["archive"].append({**row, "forgotten": True})
                checkpoint()
        for _ in range(config["reroll_rounds"] + 1):
            needed = config["invent_count"] - len(state["authored"])
            if needed == 0:
                break
            if ai is None:
                state["phase"] = "needs-ideas"
                checkpoint()
                return
            rows = validate_ideas(
                ai(
                    "invent",
                    {
                        "count": needed,
                        "excluded": sorted(excluded()),
                        "brief": config["brief"],
                        "families": state["families"],
                    },
                ),
                needed,
                excluded(),
            )
            for row in rows:
                row.update(
                    collection="Invented",
                    source=QWEN_MODEL,
                    mix=" + ".join(row["morphemes"]),
                )
                if research(row):
                    state["archive"].append({**row, "forgotten": True})
                else:
                    state["authored"].append(row)
                checkpoint()
        if len(state["authored"]) != config["invent_count"]:
            raise ValueError(
                "Invented-name replacement budget exhausted; resume to retry"
            )
        for row in state["authored"]:
            row["collection"] = "Invented"

        state["phase"] = "rolling"
        specs = [(f"{n} words", config["count"], n) for n in config["word_counts"]]
        if config["multi_count"]:
            specs.append(("Multi mesh", config["multi_count"], None))
        for title, count, word_count in specs:
            group = next((g for g in state["groups"] if g["label"] == title), None)
            if group is None:
                group = {"label": title, "candidates": []}
                state["groups"].append(group)
            while len(group["candidates"]) < count:
                slot = len(group["candidates"])
                n = (
                    word_count
                    or config["word_counts"][slot % len(config["word_counts"])]
                )
                level = (
                    config["levels"][slot % len(config["levels"])] if word_count else 5
                )
                families = state["families"]
                seeds = [] if word_count else [r["name"] for r in state["authored"]]
                if seeds:
                    families = families + [
                        {
                            "id": "submitted",
                            "words": seeds,
                            "selected": seeds,
                            "enabled": True,
                        }
                    ]
                accepted = False
                for _ in range(config["reroll_rounds"] + 1):
                    attempt = state.get("roll_attempt", 0)
                    state["roll_attempt"] = attempt + 1
                    checkpoint()
                    request = {
                        "project": config["project"],
                        "action": "roll",
                        "families": families,
                        "excluded": sorted(
                            w for w in excluded() if len(w) <= 24 and w not in seeds
                        )[:1024],
                        "seed_words": seeds,
                        "word_count": n,
                        "mesh_level": level,
                        "count": 40,
                        "seed": config["seed"] + attempt,
                    }
                    rows = api(request)["candidates"]
                    for row in rows:
                        if row["name"] in excluded():
                            continue
                        row.update(
                            collection=title,
                            source="Shakesplurian native mesh",
                            requested_word_count=n,
                            mesh_level=level,
                            roll_seed=request["seed"],
                        )
                        if len(row.get("morphemes", [])) != n or (
                            seeds and row["morphemes"][0] not in seeds
                        ):
                            raise ValueError(
                                "Engine returned incorrect word-count or submitted-seed provenance"
                            )
                        if research(row):
                            state["archive"].append({**row, "forgotten": True})
                            checkpoint()
                            continue
                        group["candidates"].append(row)
                        checkpoint()
                        accepted = True
                        break
                    if accepted:
                        break
                if not accepted:
                    raise ValueError(
                        f"Replacement/pool budget exhausted in {title}, slot {slot + 1}"
                    )

    rows = candidates(state)
    if judgments is not None:
        mapped = validate_judgments(judgments, [r["name"] for r in rows])
        for row in rows:
            row.update(mapped[row["name"]], score_source="Supplied editorial judgment")
        checkpoint()
    missing = [row for row in rows if not row.get("score_source")]
    if missing and ai is None:
        state["phase"] = "needs-review"
        checkpoint()
        return
    state["phase"] = "judging"
    checkpoint()
    for offset in range(0, len(missing), 8):
        batch = missing[offset : offset + 8]
        judgments = validate_judgments(
            ai(
                "judge",
                {
                    "brief": config["brief"],
                    "candidates": batch,
                    "score_labels": SCORE_LABELS,
                },
            ),
            [r["name"] for r in batch],
        )
        for row in batch:
            row.update(
                judgments[row["name"]], score_source=f"{QWEN_MODEL} editorial judgment"
            )
            row["favorite"] = row["scores"][0] >= 9
        checkpoint()
    for row in rows:
        validate_judgments([row], [row["name"]])
        row["overall"] = round(
            10
            * sum(s * w for s, w in zip(row["scores"], config["weights"]))
            / sum(config["weights"]),
            2,
        )
    state["ranking"] = [
        r["name"] for r in sorted(rows, key=lambda r: (-r["overall"], r["name"]))
    ]
    state["weights"] = config["weights"]
    state["phase"] = "complete"
    state["completed_at"] = datetime.now(UTC).isoformat()
    checkpoint()
