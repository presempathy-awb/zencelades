"""Resume missing four-source naming research, retaining all original receipts."""

import argparse
import json
import shutil
import subprocess
import time
from datetime import UTC, datetime, timedelta
from pathlib import Path

from scripts.naming_runtime import build_engine, save_json, workbench

LAYERS = ["search:brave", "github", "pkg:npm", "rdap:com"]


def moment(value: str) -> datetime:
    return datetime.fromisoformat(value)


def missing(report: dict, now: str) -> list[str]:
    good = {
        e["layer"]
        for e in report.get("evidence", [])
        if e.get("status") in {"negative", "positive"}
        and e.get("expires_at")
        and moment(e["expires_at"]) > moment(now)
    }
    return [layer for layer in LAYERS if layer not in good]


def combine(name: str, reports: list[dict], now: str) -> dict:
    """Keep fresh conclusive receipts through failed retries and retain known hits."""
    chosen = {}
    taken = any(r.get("verdict") == "taken" for r in reports)
    positives = []
    for report in reports:
        for original in report.get("evidence", []):
            item = dict(original)
            layer = item["layer"] = {"domain:com": "rdap:com"}.get(
                item["layer"], item["layer"]
            )
            if item.get("status") == "positive":
                taken = True
                positives.append(item)
            if layer not in LAYERS:
                continue
            previous = chosen.get(layer)

            def priority(e):
                fresh = e.get("expires_at") and moment(e["expires_at"]) > moment(now)
                return (
                    e.get("status") == "positive",
                    bool(fresh and e.get("status") == "negative"),
                    e.get("checked_at", ""),
                )

            if previous is None or priority(item) > priority(previous):
                chosen[layer] = item
    result = {
        "name": name,
        "normalized_name": name,
        "checked_at": now,
        "method": "Four-source research; earlier conclusive receipts retained with their dates",
        "evidence": [chosen[layer] for layer in LAYERS if layer in chosen],
        "earlier_collisions": positives,
    }
    gaps = missing(result, now)
    result.update(
        verdict="taken" if taken else "unverified" if gaps else "clean",
        complete=not gaps,
        clean=not taken and not gaps,
        missing_layers=gaps,
    )
    return result


def github(name: str) -> dict:
    """Query public repositories through the existing authenticated GitHub CLI."""
    now = datetime.now(UTC)
    row = {
        "normalized_name": name,
        "layer": "github",
        "status": "unavailable",
        "checked_at": now.isoformat(),
        "expires_at": (now + timedelta(days=1)).isoformat(),
        "detail": "GitHub CLI public repository search unavailable",
    }
    result = subprocess.run(
        [
            "gh",
            "api",
            "--method",
            "GET",
            "search/repositories",
            "-f",
            f"q={name} in:name is:public",
            "-f",
            "per_page=100",
        ],
        capture_output=True,
        text=True,
        timeout=40,
        check=False,
    )
    if result.returncode:
        return {"evidence": [row]}
    data = json.loads(result.stdout)
    matches = [r["full_name"] for r in data["items"] if r["name"].lower() == name]
    complete = not data["incomplete_results"] and data["total_count"] <= len(
        data["items"]
    )
    row.update(
        status="positive" if matches else "negative" if complete else "unavailable",
        exact_matches=matches,
        detail="Exact public repository names via gh api; complete result set"
        if complete
        else "GitHub search incomplete",
    )
    return {"evidence": [row]}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, default=Path.cwd())
    parser.add_argument("--engine", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Run missing checks; otherwise inventory only",
    )
    args = parser.parse_args()
    root, output = args.project.resolve(), args.output.resolve()
    site = root / "site/naming"
    research = json.loads((site / "research-rolls.json").read_text())
    history = json.loads((site / "report.json").read_text())
    reports = {}
    for row in json.loads((site / "verification.json").read_text()):
        reports.setdefault(row["name"], []).append(row)
    rows = (
        research["authored"]
        + [c for g in research["groups"] for c in g["candidates"]]
        + research.get("archive", [])
    )
    rows += [c for g in history["groups"] for c in g["candidates"]]
    for row in rows:
        reports.setdefault(row["name"], []).append(
            row.get("report", {"verdict": row.get("verdict")})
        )
    for name, values in reports.items():
        receipt = output / f"receipt-{name}.json"
        if receipt.exists():
            values.extend(json.loads(receipt.read_text()))
    now = datetime.now(UTC).isoformat()
    initial = {name: combine(name, values, now) for name, values in reports.items()}
    pending = [
        name
        for name, report in initial.items()
        if report["verdict"] != "taken" and missing(report, now)
    ]
    print(
        json.dumps(
            {
                "names": len(initial),
                "pending": len(pending),
                "missing_by_source": {
                    layer: sum(layer in missing(initial[n], now) for n in pending)
                    for layer in LAYERS
                },
            }
        ),
        flush=True,
    )
    if not args.apply:
        return
    output.mkdir(parents=True, exist_ok=True)
    for filename in ["research-rolls.json", "report.json", "verification.json"]:
        target = output / filename
        if target.exists() and target.read_bytes() != (site / filename).read_bytes():
            raise ValueError("Source changed; use a new output directory")
        shutil.copy2(site / filename, target)
    (output / "data/families").mkdir(parents=True, exist_ok=True)
    shutil.copy2(site / "palette.toml", output / "data/families/thatsnozorb.toml")
    (output / "site").mkdir(exist_ok=True)
    if not (output / "naming-workbench").exists():
        build_engine(args.engine.resolve(), output)
    with workbench(output, "thatsnozorb") as api:
        for index, name in enumerate(pending):
            receipt = output / f"receipt-{name}.json"
            if receipt.exists():
                fresh = json.loads(receipt.read_text())
            else:
                started = time.monotonic()
                fresh = []
                if set(missing(initial[name], now)) != {"github"}:
                    fresh.append(
                        api(
                            {
                                "action": "verify",
                                "project": "thatsnozorb",
                                "words": [name],
                            }
                        )["report"]
                    )
                merged = combine(
                    name, reports[name] + fresh, datetime.now(UTC).isoformat()
                )
                if "github" in missing(merged, datetime.now(UTC).isoformat()):
                    fresh.append(github(name))
                save_json(receipt, fresh)
                # GitHub's authenticated search quota is 30/minute; pace actual requests.
                time.sleep(max(0, 2.2 - (time.monotonic() - started)))
            initial[name] = combine(
                name, reports[name] + fresh, datetime.now(UTC).isoformat()
            )
            save_json(
                output / "availability.json",
                {"generated_at": datetime.now(UTC).isoformat(), "reports": initial},
            )
            if (index + 1) % 10 == 0 or index + 1 == len(pending):
                print(
                    f"Researched {index + 1}/{len(pending)}; {name}: {initial[name]['verdict']}",
                    flush=True,
                )
    save_json(
        output / "availability.json",
        {"generated_at": datetime.now(UTC).isoformat(), "reports": initial},
    )


if __name__ == "__main__":
    main()
