"""Export project catalog records for a reviewed Pacinman import; never writes remotely."""

from __future__ import annotations

import csv
import json
from pathlib import Path


def write_inventory(parts: list[dict], tasks: list[dict], output: Path) -> None:
    """Export inventory without requiring the PDF rendering toolchain."""
    output.mkdir(parents=True, exist_ok=True)
    ids = [row["id"] for row in parts + tasks]
    assert len(ids) == len(set(ids))
    seen = set()
    for task in tasks:
        assert set(task["depends"]) <= seen, task["id"]
        seen.add(task["id"])
    with (output / "Zencelades-Parts.csv").open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(parts[0]))
        writer.writeheader()
        writer.writerows(
            {**p, "configurations": ", ".join(p["configurations"])} for p in parts
        )
    payloads = []
    for p in parts:
        quoted = p["incremental_purchase_usd"] is not None
        owned = p["ownership"] == "Andrew-confirmed owned"
        cost = p["incremental_purchase_usd"]
        cost_note = (
            "COST UNKNOWN: estimated_price=0 is an unset placeholder, not a free item. "
        )
        if quoted:
            cost_note = (
                "Owned acquisition cost $0; operation/inspection not priced. "
                if owned and cost == 0
                else f"Recorded acquisition line amount ${cost:g} for {p['quantity']} units; "
                "estimated_price is the per-unit amount, not a fresh supplier quote. "
            )
        notes = (
            f"Love Burn 2027. Stable key {p['id']}. Configurations: {', '.join(p['configurations'])}. "
            f"Quantity: {p['quantity']} {p['unit']}; {p['quantity_status']}. "
            f"Ownership: {p['ownership']}. {p['notes']} "
            + cost_note
            + f"Alternative group: {p['alternative_group'] or 'none'}. "
            "Choose one support/size and one visual module; never sum all alternatives. "
            "Plans: https://zenceladus.com/attachments/build/README.md"
        )
        payloads.append(
            {
                "key": p["id"],
                "depends": [],
                "arguments": {
                    "item": f"Zencelades [{p['id']}] {p['item']}",
                    "category": "Zencelades / Love Burn 2027",
                    "quantity": p["quantity"],
                    "status": p["status"],
                    "scope": "group",
                    "group_id": "burning-man-2026",
                    "owner": "Andrew" if owned else "Unassigned",
                    "place_to_get": "Already owned" if owned else "Unspecified",
                    "pack_zone": "Zencelades - " + p["module"],
                    "estimated_price": cost / p["quantity"] if quoted else 0,
                    "essential": False,
                    "notes": notes,
                    "task_tags": [
                        "zencelades",
                        "love-burn-2027",
                        p["module"].lower(),
                        "cost-recorded" if quoted else "cost-unquoted",
                        *(["owned-confirmed"] if owned else []),
                    ],
                },
            }
        )
    for t in tasks:
        payloads.append(
            {
                "key": t["id"],
                "depends": t["depends"],
                "arguments": {
                    "item": f"Zencelades [{t['id']}] {t['title']}",
                    "category": "Zencelades / Love Burn 2027",
                    "quantity": 1,
                    "status": "blocked" if t["depends"] else "maybe",
                    "scope": "group",
                    "group_id": "burning-man-2026",
                    "owner": "Unassigned",
                    "place_to_get": "Not a purchase",
                    "pack_zone": "Zencelades - WORK PLAN",
                    "estimated_price": 0,
                    "notes": "Planning task, not a physical part or purchase. Love Burn 2027. "
                    "Some branches apply only to the chosen option; see full build plan.",
                    "task_enabled": True,
                    "task_status": "backlog",
                    "task_priority": "high",
                    "task_tags": ["zencelades", "love-burn-2027", "build-plan"],
                    "task_notes": f"Suggested role (not a commitment): {t['role']}. Exit criterion: {t['done']}",
                },
            }
        )
    (output / "pacinman-import.json").write_text(
        json.dumps(
            {
                "workspace_id": "burning-man-2026",
                "category": "Zencelades / Love Burn 2027",
                "parts": len(parts),
                "tasks": len(tasks),
                "records": payloads,
            },
            indent=2,
        )
        + "\n"
    )


def main() -> None:
    """Build the inventory-only packet from the project catalog."""
    root = Path(__file__).resolve().parents[1]
    parts = json.loads((root / "assets/build-parts.json").read_text())["parts"]
    tasks = json.loads((root / "assets/build-tasks.json").read_text())["tasks"]
    write_inventory(parts, tasks, root / "output/build-plans")
    print(f"Exported {len(parts)} parts and {len(tasks)} tasks; no remote changes")


if __name__ == "__main__":
    main()
