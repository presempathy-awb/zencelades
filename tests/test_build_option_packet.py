import json
from pathlib import Path

from scripts.pacinman_packet import write_inventory


def test_pdf_packet_preserves_plan_text_and_inventory(tmp_path, monkeypatch):
    from pypdf import PdfReader

    from scripts import build_option_packet

    source = Path(__file__).resolve().parents[1]
    (tmp_path / "assets").mkdir()
    for name in ("build-parts.json", "build-tasks.json"):
        (tmp_path / "assets" / name).write_bytes(
            (source / "assets" / name).read_bytes()
        )
    plans = tmp_path / "docs/build"
    plans.mkdir(parents=True)
    (plans / "README.md").write_text(
        "# Current plan\n\n"
        "1. **Keep the entrance clear.** Inspect the [holder](g25-lander.md).\n"
        "2. Preserve <unquoted> costs & the $3,000 cap.\n\n"
        "| Budget | USD |\n|---|---:|\n| Low estimate | $2,378.40 |\n\n"
        "## Reference\n\n[Source](https://example.org/manual)\n"
    )
    (plans / "alternate.md").write_text(
        "# Alternate study\n\nNot the primary budget.\n"
    )
    monkeypatch.setattr(build_option_packet, "ROOT", tmp_path)
    monkeypatch.setattr(build_option_packet, "OUT", tmp_path / "output")
    monkeypatch.setattr(build_option_packet, "DOCS", ["README", "alternate"])
    build_option_packet.main()
    pdf = PdfReader(tmp_path / "output/Zencelades-Build-Plans.pdf")
    text = "\n".join(page.extract_text() for page in pdf.pages)
    assert "Keep the entrance clear." in text
    assert "<unquoted> costs & the $3,000 cap" in text
    assert "$2,378.40" in text and "Not the primary budget." in text
    assert "**" not in text and "](g25-lander.md)" not in text
    assert "Page 1" in text and "Page 2" in text
    assert any(
        annotation.get_object().get("/A", {}).get("/URI")
        == "https://example.org/manual"
        for page in pdf.pages
        for annotation in page.get("/Annots", [])
    )
    records = json.loads((tmp_path / "output/pacinman-import.json").read_text())[
        "records"
    ]
    hazer = next(row for row in records if row["key"] == "ZC-H01")
    assert hazer["arguments"]["place_to_get"] == "Already owned"
    assert (tmp_path / "output/Zencelades-Parts.csv").is_file()


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
