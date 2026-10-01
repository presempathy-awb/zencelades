import json
from pathlib import Path

from scripts.pacinman_packet import write_inventory


def test_import_preserves_explicit_sourcing_ownership_and_task_dependencies(tmp_path):
    root = Path(__file__).resolve().parents[1]
    parts = json.loads((root / "assets/build-parts.json").read_text())["parts"]
    tasks = json.loads((root / "assets/build-tasks.json").read_text())["tasks"]
    write_inventory(parts, tasks, tmp_path)
    packet = json.loads((tmp_path / "pacinman-import.json").read_text())
    rows = {row["key"]: row for row in packet["records"]}

    assert len(rows) == len(parts) + len(tasks)
    assert rows["ZC-H01"]["arguments"]["place_to_get"] == "Already owned"
    assert rows["ZC-T01"]["arguments"]["owner"] == "Andrew"
    assert rows["ZC-P01"]["arguments"]["place_to_get"] == "Unspecified"
    assert "COST UNKNOWN" in rows["ZC-P01"]["arguments"]["notes"]
    assert rows["ZC-P01"]["arguments"]["estimated_price"] == 0
    for task in tasks:
        row = rows[task["id"]]
        assert row["depends"] == task["depends"]
        assert row["arguments"]["place_to_get"] == "Not a purchase"
        assert row["arguments"]["task_enabled"] is True
    for row in rows.values():
        assert row["arguments"]["group_id"] == "burning-man-2026"
        assert row["arguments"].get("url", "") == ""


def test_recorded_line_cost_maps_to_unit_price_without_claiming_ownership(tmp_path):
    part = {
        "id": "ZC-QUOTE",
        "item": "Synthetic quoted component",
        "module": "TEST",
        "quantity": 2,
        "unit": "pieces",
        "quantity_status": "synthetic fixture",
        "configurations": ["G30"],
        "alternative_group": None,
        "ownership": "unconfirmed",
        "status": "maybe",
        "incremental_purchase_usd": 125,
        "notes": "Synthetic line amount, not a real supplier quote.",
    }
    write_inventory([part], [], tmp_path)
    row = json.loads((tmp_path / "pacinman-import.json").read_text())["records"][0]
    args = row["arguments"]
    assert args["estimated_price"] == 62.5
    assert args["owner"] == "Unassigned"
    assert args["place_to_get"] == "Unspecified"
    assert "owned-confirmed" not in args["task_tags"]
    assert "cost-recorded" in args["task_tags"]
    assert "$125" in args["notes"]
