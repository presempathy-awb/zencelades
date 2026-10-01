"""Grant resource ledger: cash, in-kind and requested support per build option.

Reads the sourced bill of materials in assets/grant-build-bom.json and the eight
pricing options in site/pricing/options.json, reproduces the pricing page's cash
arithmetic at its published defaults, and writes assets/grant-resource-ledger.json.
Standard library only. ``--check`` verifies the written ledger instead of writing.
"""

from __future__ import annotations

import csv
import html
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOM = ROOT / "assets/grant-build-bom.json"
OPTIONS = ROOT / "site/pricing/options.json"
LEDGER = ROOT / "assets/grant-resource-ledger.json"
# Published totals from docs/pricing-alternatives.md; the arithmetic must reproduce them.
PUBLISHED = {
    "ground-light": (4500, 13750),
    "ground-sphere": (19300, 39675),
    "fixed-cantilever": (42975, 79850),
}


def option_total(option: dict, settings: dict) -> tuple[float, float]:
    """Same arithmetic as site/pricing/calculation.mjs with capture off."""
    rent = (
        option["projectors"]
        * settings["days"]
        * settings["dayRate"]
        * (1 - settings["discount"] / 100)
    )
    low = rent + sum(item["low"] for item in option["items"])
    high = rent + sum(item["high"] for item in option["items"])
    totals = []
    for value in (low, high):
        subtotal = max(0, value - settings["credit"])
        totals.append(
            subtotal * (1 + settings["contingency"] / 100) + settings["taxAllowance"]
        )
    return totals[0], totals[1]


def tier_totals(bom: dict, tier: str) -> dict:
    lines = [line for line in bom["cash"] if line["tier"] == tier]
    low = sum(line["qty"] * line["unit_low"] for line in lines)
    high = sum(line["qty"] * line["unit_high"] for line in lines)
    rate = bom["contingency_percent"] / 100
    return {
        "lines": [
            {
                **line,
                "low": line["qty"] * line["unit_low"],
                "high": line["qty"] * line["unit_high"],
            }
            for line in lines
        ],
        "subtotal": [low, high],
        "contingency": [low * rate, high * rate],
        "total": [low * (1 + rate), high * (1 + rate)],
    }


def build() -> dict:
    bom = json.loads(BOM.read_text())
    pricing = json.loads(OPTIONS.read_text())
    settings = pricing["defaults"]
    options = []
    missing = set(PUBLISHED) - {option["id"] for option in pricing["options"]}
    if missing:
        raise ValueError(f"published options missing from options.json: {missing}")
    for option in pricing["options"]:
        low, high = option_total(option, settings)
        if (
            option["id"] in PUBLISHED
            and (whole(low), whole(high)) != PUBLISHED[option["id"]]
        ):
            raise ValueError(f"{option['id']} differs from the published pricing table")
        options.append(
            {
                "id": option["id"],
                "name": option["name"],
                "projectors": option["projectors"],
                "basis": "rental",
                "cash_low": whole(low),
                "cash_high": whole(high),
            }
        )
    tier1 = tier_totals(bom, "tier1")
    tier2 = tier_totals(bom, "tier2")
    averages = [
        {
            **year,
            "average_per_project": round(
                year["art_grants_usd"] / year["projects_granted"]
            ),
        }
        for year in bom["love_burn_averages"]["years"]
    ]
    latest = averages[0]["average_per_project"]
    # Target: the Tier 1 cash range rounded to hundreds, shown against the published average.
    target = {
        "tier1_cash_low": round(tier1["total"][0], -2),
        "tier1_cash_high": round(tier1["total"][1], -2),
        "latest_average_per_project": latest,
        "ratio_high_to_average": round(tier1["total"][1] / latest, 2),
        "recommended_ask_usd": 3000,
        "grant_tier": "Seed Grant ($600 to $3,000)",
        "crew_tickets": 3,
        "note": (
            "Ask $3,000 cash as a Seed Grant plus 3 crew tickets, itemised against the "
            "Tier 1 list; the artist covers the rest and all in-kind lines. Tier 2 is an "
            "add-on, not folded into the ask. Tier confirmed by Andrew, 2026-09-30."
        ),
    }
    return {
        "schema_version": 1,
        "prepared_on": bom["prepared_on"],
        "currency": bom["currency"],
        "status": bom["status"],
        "sphere_diameter_m": bom["sphere_diameter_m"],
        "contingency_percent": bom["contingency_percent"],
        "tiers": bom["tiers"],
        "tier1": tier1,
        "third": tier_totals(bom, "third"),
        "tier2": tier2,
        "support": tier_totals(bom, "support"),
        "in_kind": bom["in_kind"],
        "requests": bom["requests"],
        "love_burn_averages": {
            "note": bom["love_burn_averages"]["note"],
            "years": averages,
        },
        "target": target,
        "options": [
            {
                "id": "tier1-hung",
                "name": "Tier 1: hung 2.5 m sphere, purchased projectors",
                "projectors": 2,
                "basis": "purchase",
                "cash_low": whole(tier1["total"][0]),
                "cash_high": whole(tier1["total"][1]),
            },
            *options,
        ],
    }


def whole(value: float) -> int:
    """Round half up, as the pricing page's Math.round does for the non-negative
    dollar amounts used here; not a general Math.round for negative values."""
    return math.floor(value + 0.5)


def dollars(value: float) -> str:
    return f"${whole(value):,}"


UPGRADES = (
    ("third", "Third projector (continuous wrap), with contingency"),
    ("tier2", "Tier 2 add-on (four projectors), with contingency"),
    ("support", "Option B truss goalpost, artist-funded, with contingency"),
)


def tables(ledger: dict) -> str:
    out = [
        "| Tier 1 cash line | Qty | Low | High | Kind |",
        "| --- | ---: | ---: | ---: | --- |",
    ]
    for line in ledger["tier1"]["lines"]:
        out.append(
            f"| {line['item']} | {line['qty']} | {dollars(line['low'])} | "
            f"{dollars(line['high'])} | {line['kind'].replace('_', ' ')} |"
        )
    for label, key in (
        ("Subtotal", "subtotal"),
        (f"Contingency {ledger['contingency_percent']}%", "contingency"),
        ("**Tier 1 cash total**", "total"),
    ):
        low, high = ledger["tier1"][key]
        out.append(f"| {label} | | {dollars(low)} | {dollars(high)} | |")
    for key, label in UPGRADES:
        low, high = ledger[key]["total"]
        out.append(f"| {label} | | {dollars(low)} | {dollars(high)} | |")
    out += [
        "",
        "| Love Burn year | Cash art grants | Projects | Average per project |",
        "| --- | ---: | ---: | ---: |",
    ]
    for year in ledger["love_burn_averages"]["years"]:
        out.append(
            f"| {year['event']} | {dollars(year['art_grants_usd'])} | {year['projects_granted']} | "
            f"{dollars(year['average_per_project'])} |"
        )
    out += [
        "",
        "| Option | Projectors | Basis | Cash low | Cash high |",
        "| --- | ---: | --- | ---: | ---: |",
    ]
    for option in ledger["options"]:
        out.append(
            f"| {option['name']} | {option['projectors']} | {option['basis']} | "
            f"{dollars(option['cash_low'])} | {dollars(option['cash_high'])} |"
        )
    return "\n".join(out)


BUDGET_DIR = ROOT / "docs/design/application"


def budget_rows(ledger: dict) -> list[list]:
    """The budget the form asks for: one row per line, then totals, in-kind and requests."""
    rows = []

    def lines(section: str, key: str) -> None:
        for line in ledger[key]["lines"]:
            rows.append(
                [
                    section,
                    line["item"],
                    line["qty"],
                    line["unit_low"],
                    line["unit_high"],
                    line["low"],
                    line["high"],
                    line["kind"].replace("_", " "),
                    line["basis"],
                ]
            )

    def total(section: str, label: str, pair: list) -> None:
        rows.append(
            [section, label, "", "", "", whole(pair[0]), whole(pair[1]), "", ""]
        )

    rate = ledger["contingency_percent"]
    lines("Tier 1 cash", "tier1")
    total("Tier 1 cash", "Subtotal", ledger["tier1"]["subtotal"])
    total("Tier 1 cash", f"Contingency {rate}%", ledger["tier1"]["contingency"])
    total("Tier 1 cash", "TOTAL CASH BUILD", ledger["tier1"]["total"])
    for key, label in UPGRADES:
        lines(label, key)
        total(label, f"Total with {rate}% contingency", ledger[key]["total"])
    for item in ledger["in_kind"]:
        rows.append(
            [
                "Artist in-kind",
                item["item"],
                "",
                "",
                "",
                "",
                "",
                item["status"],
                item["note"],
            ]
        )
    for item in ledger["requests"]:
        rows.append(
            [
                "Requested from Love Burn",
                item["item"],
                "",
                "",
                "",
                "",
                "",
                item["status"],
                item["note"],
            ]
        )
    ask = ledger["target"]
    rows.append(
        [
            "Requested from Love Burn",
            f"Cash grant requested ({ask['grant_tier']})",
            "",
            "",
            "",
            ask["recommended_ask_usd"],
            ask["recommended_ask_usd"],
            "requested",
            "Covers the low build in full; the artist covers any remainder",
        ]
    )
    rows.append(
        [
            "Requested from Love Burn",
            "Crew tickets requested",
            ask["crew_tickets"],
            "",
            "",
            "",
            "",
            "requested",
            "The form values crew tickets at $500 each",
        ]
    )
    return rows


BUDGET_HEADER = [
    "Section",
    "Item",
    "Qty",
    "Unit low (USD)",
    "Unit high (USD)",
    "Line low (USD)",
    "Line high (USD)",
    "Kind / status",
    "Basis / note",
]


def write_budget(ledger: dict) -> None:
    """Write budget.csv and budget.html; the PDF is printed from the HTML."""
    rows = budget_rows(ledger)
    BUDGET_DIR.mkdir(parents=True, exist_ok=True)
    with (BUDGET_DIR / "budget.csv").open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(BUDGET_HEADER)
        writer.writerows(rows)
    low, high = (whole(value) for value in ledger["tier1"]["total"])
    ask = ledger["target"]

    def cells(row: list) -> str:
        return "".join(f"<td>{html.escape(str(cell))}</td>" for cell in row)

    body = "".join(f"<tr>{cells(row)}</tr>" for row in rows)
    head = "".join(f"<th>{name}</th>" for name in BUDGET_HEADER)
    averages = "; ".join(
        f"{year['event']} ${year['art_grants_usd']:,.0f} across {year['projects_granted']} "
        f"projects (about ${year['average_per_project']:,} each)"
        for year in ledger["love_burn_averages"]["years"]
    )
    page = (
        "<!doctype html><html><head><meta charset='utf-8'><title>Enceladus Within budget</title>"
        "<style>body{font:11px/1.35 Helvetica,Arial,sans-serif;margin:24px;color:#111}"
        "h1{font-size:18px;margin:0 0 4px}p{margin:0 0 10px;max-width:900px}"
        "table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:3px 5px;"
        "vertical-align:top;text-align:left}th{background:#eee}td:nth-child(n+3):nth-child(-n+7)"
        "{text-align:right;white-space:nowrap}tr:nth-child(even) td{background:#f7f7f7}"
        "@page{size:letter landscape;margin:12mm}</style></head><body>"
        "<h1>Enceladus Within · Love Burn 2027 budget</h1>"
        f"<p>Prepared {ledger['prepared_on']}. {html.escape(ledger['status'])} Tax and shipping "
        f"excluded. Cash build ${low:,} to ${high:,} at {ledger['contingency_percent']}% "
        f"contingency. Grant requested: ${ask['recommended_ask_usd']:,} cash "
        f"({html.escape(ask['grant_tier'])}) plus {ask['crew_tickets']} crew tickets; the grant "
        "covers the low build in full and the artist self-funds or fundraises any remainder and "
        "the upgrades. Allowances are marked in the Kind column and become receipts; observed "
        "prices are retail prices on the preparation date, not reserved stock. Sources for every "
        "price: project document grant-resource-ledger.md.</p>"
        f"<table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>"
        f"<p style='margin-top:10px'>Love Burn published averages (finance PDFs): {averages}.</p>"
        "</body></html>"
    )
    (BUDGET_DIR / "budget.html").write_text(page + "\n")


def main(argv: list[str]) -> int:
    ledger = build()
    if "--check" in argv:
        if not LEDGER.exists():
            print(f"{LEDGER.name} is missing; run without --check", file=sys.stderr)
            return 1
        if json.loads(LEDGER.read_text()) != ledger:
            print(
                "grant-resource-ledger.json is stale; run without --check",
                file=sys.stderr,
            )
            return 1
        print(
            "grant-resource-ledger.json matches the bill of materials and pricing options"
        )
        return 0
    LEDGER.write_text(json.dumps(ledger, indent=2) + "\n")
    write_budget(ledger)
    print(tables(ledger))
    target = ledger["target"]
    print(
        f"\nTarget: {dollars(target['tier1_cash_low'])}-{dollars(target['tier1_cash_high'])} cash; "
        f"latest published average {dollars(target['latest_average_per_project'])} per project "
        f"({target['ratio_high_to_average']}x at the high end)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
