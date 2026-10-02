"""Export the authored build plans and parts into a reviewable Pacinman packet."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

from scripts.pacinman_packet import write_inventory

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/pdf"
DOCS = [
    "README",
    "g25-lander",
    "g30-lander",
    "s25-suspended",
    "s30-suspended",
    "o30-open-surround",
    "optics-camera-hazer",
    "materials-and-hosts",
    "field-operations",
    "budget-and-inventory",
    "pacinman",
]


def inline(value: str) -> str:
    """Render the plans' inline Markdown while escaping authored text."""
    for character in ("–", "—", "−", "‑"):
        value = value.replace(character, "-")
    value = value.replace("→", "->")
    tokens = re.split(r"(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)", value)
    rendered = []
    for token in tokens:
        link = re.fullmatch(r"\[([^\]]+)\]\(([^)]+)\)", token)
        if link:
            label, target = link.groups()
            label = html.escape(label)
            rendered.append(
                f'<a href="{html.escape(target, quote=True)}" color="#166874">{label}</a>'
                if target.startswith(("https://", "http://"))
                else label
            )
        elif token.startswith("**") and token.endswith("**"):
            rendered.append(f"<b>{html.escape(token[2:-2])}</b>")
        elif token.startswith("`") and token.endswith("`"):
            rendered.append(html.escape(token[1:-1]))
        else:
            rendered.append(html.escape(token))
    return "".join(rendered)


def main() -> None:
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        LongTable,
        PageBreak,
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        TableStyle,
    )

    parts = json.loads((ROOT / "assets/build-parts.json").read_text())["parts"]
    tasks = json.loads((ROOT / "assets/build-tasks.json").read_text())["tasks"]
    write_inventory(parts, tasks, OUT)
    styles = getSampleStyleSheet()
    styles["BodyText"].fontSize = 9
    styles["BodyText"].leading = 12
    styles["Heading1"].keepWithNext = True
    styles["Heading2"].keepWithNext = True
    story = []
    for name in DOCS:
        if story:
            story.append(PageBreak())
        lines = (ROOT / "docs/build" / f"{name}.md").read_text().splitlines()
        table = []
        paragraph = []

        def flush(paragraph: list[str], table: list[list[str]]) -> None:
            if paragraph:
                text = " ".join(paragraph)
                story.append(Paragraph(inline(text), styles["BodyText"]))
                story.append(Spacer(1, 5))
                paragraph.clear()
            if table:
                width = 7.2 * inch / len(table[0])
                formatted = [
                    [Paragraph(inline(cell), styles["BodyText"]) for cell in row]
                    for row in table
                ]
                widths = [width] * len(table[0])
                if len(table[0]) == 3:
                    if table[0][0] == "Step":
                        widths = [0.45 * inch, 4 * inch, 2.75 * inch]
                    elif table[0][0] == "Choice":
                        widths = [2 * inch, 1.4 * inch, 3.8 * inch]
                    elif table[0][0] == "Proposal layer":
                        widths = [5 * inch, 1.1 * inch, 1.1 * inch]
                widget = LongTable(
                    formatted,
                    colWidths=widths,
                    repeatRows=1,
                    hAlign="LEFT",
                )
                widget.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#d8ecee")),
                            ("VALIGN", (0, 0), (-1, -1), "TOP"),
                            ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
                        ]
                    )
                )
                story.extend([widget, Spacer(1, 8)])
                table.clear()

        for line in lines:
            line = line.removeprefix("> ").strip()
            if line.startswith("|"):
                if (
                    set(line.replace("|", "").replace("-", "").replace(":", "").strip())
                    == set()
                ):
                    continue
                table.append([cell.strip() for cell in line.strip("|").split("|")])
            elif line.startswith("#"):
                flush(paragraph, table)
                level = len(line) - len(line.lstrip("#"))
                story.append(
                    Paragraph(
                        inline(line.lstrip("# ")),
                        styles["Heading1" if level == 1 else "Heading2"],
                    )
                )
            elif re.match(r"^(?:\d+\. |[-*] )", line):
                flush(paragraph, table)
                paragraph.append(line)
            elif not line.strip():
                flush(paragraph, table)
            else:
                if table:
                    flush(paragraph, table)
                paragraph.append(line)
        flush(paragraph, table)

    def footer(canvas, document) -> None:
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#526771"))
        canvas.drawString(
            0.65 * inch,
            0.32 * inch,
            "Zencelades | Build planning, not fabrication approval",
        )
        canvas.drawRightString(7.85 * inch, 0.32 * inch, f"Page {document.page}")
        canvas.restoreState()

    SimpleDocTemplate(
        str(OUT / "Zencelades-Build-Plans.pdf"),
        pagesize=(8.5 * inch, 11 * inch),
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title="Zencelades build plans and parts control",
        author="Zencelades",
        subject="Primary Love Burn proposal and alternate build-planning workflows",
    ).build(story, onFirstPage=footer, onLaterPages=footer)
    print(
        f"Exported {len(parts)} parts, {len(tasks)} sequenced tasks and {len(DOCS)} plan documents"
    )


if __name__ == "__main__":
    main()
