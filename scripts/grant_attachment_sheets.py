"""Render the P047 grant schematics from explicit nominal geometry."""

from __future__ import annotations

import json
import math
from collections.abc import Callable
from io import BytesIO
from pathlib import Path
from textwrap import wrap

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/grant-attachments"
SHEETS = ROOT / "tmp/pdfs/components"
W, H = 1440, 960
NAVY, INK, MUTED = "#0c2032", "#18354b", "#516d7e"
TEAL, GOLD, PAPER = "#087e8b", "#b2782b", "#f6f8f7"
CY = 1.7
RING = 0.9144
RY = CY - math.sqrt(1.5**2 - RING**2)
TY = RY - 0.09
CORNERS = [
    (1.8 * math.cos(a), TY, 1.8 * math.sin(a))
    for a in [math.pi / 6 + i * 2 * math.pi / 3 for i in range(3)]
]
ARM = 2.0
ELEVATION = math.radians(30)
DEFAULT_YAW = math.radians(25)
DEFAULT_PITCH = math.radians(13)
Point = tuple[float, float, float]
Flat = tuple[float, float]
Project = Callable[[Point], Flat]
HEADS = [
    (
        x + ARM * math.cos(ELEVATION) * x / 1.8,
        y + ARM * math.sin(ELEVATION),
        z + ARM * math.cos(ELEVATION) * z / 1.8,
    )
    for x, y, z in CORNERS
]


def text(
    c: canvas.Canvas,
    x: float,
    y: float,
    value: str,
    size: float = 20,
    color: str = INK,
    bold: bool = False,
) -> None:
    c.setFillColor(HexColor(color))
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.drawString(x, y, value)


def paragraph(
    c: canvas.Canvas,
    x: float,
    y: float,
    value: str,
    width: int = 45,
    size: float = 20,
    color: str = MUTED,
    leading: float = 29,
) -> float:
    for line in wrap(value, width=width):
        text(c, x, y, line, size, color)
        y -= leading
    return y


def line(
    c: canvas.Canvas,
    a: Flat,
    b: Flat,
    color: str = INK,
    width: float = 2,
    dash: list[int] | None = None,
) -> None:
    c.setStrokeColor(HexColor(color))
    c.setLineWidth(width)
    c.setDash(dash or [])
    c.line(*a, *b)
    c.setDash([])


def path(
    c: canvas.Canvas,
    points: list[Flat],
    color: str = INK,
    width: float = 2,
    close: bool = False,
    fill: str | None = None,
) -> None:
    p = c.beginPath()
    p.moveTo(*points[0])
    for point in points[1:]:
        p.lineTo(*point)
    if close:
        p.close()
    c.setStrokeColor(HexColor(color))
    c.setLineWidth(width)
    if fill:
        c.setFillColor(HexColor(fill))
    c.drawPath(p, stroke=1, fill=bool(fill))


def badge(c: canvas.Canvas, x: float, y: float, number: int) -> None:
    c.setFillColor(HexColor(TEAL))
    c.circle(x, y, 14, stroke=0, fill=1)
    text(c, x - 5, y - 5, str(number), 15, "#ffffff", True)


def header(c: canvas.Canvas, number: int, title: str, subtitle: str) -> None:
    c.setFillColor(HexColor(PAPER))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(HexColor(NAVY))
    c.rect(0, H - 150, W, 150, stroke=0, fill=1)
    text(c, 55, H - 47, "ZENCELADES / LOVE BURN 2027", 18, "#91cbd3", True)
    text(c, 55, H - 101, title, 37, "#ffffff", True)
    text(c, 55, H - 131, subtitle, 18, "#d6e7eb")
    line(c, (55, 61), (1385, 61), "#beced3", 1)
    text(
        c,
        55,
        36,
        "CONCEPT SCHEMATIC  /  Nominal geometry  /  Not fabrication or capacity approval",
        15,
        MUTED,
    )
    text(c, 1285, 36, f"SHEET {number:02d}", 15, MUTED, True)


def projector(
    c: canvas.Canvas, point: Flat, angle: float = 0, plan: bool = False
) -> None:
    c.saveState()
    c.translate(*point)
    c.rotate(angle)
    c.setFillColor(HexColor(NAVY))
    c.roundRect(-20, -12, 40, 24, 4, stroke=0, fill=1)
    c.setFillColor(HexColor(TEAL))
    c.circle(0, 12, 6, stroke=0, fill=1)
    c.restoreState()
    c.saveState()
    c.translate(*point)
    if plan:
        c.rotate(angle)
    # Open-sided canopy, separate from the projector cooling envelope.
    path(c, [(-27, -17), (-27, 19), (27, 19), (27, -17)], GOLD, 3)
    c.restoreState()


def projection(
    cx: float,
    cy: float,
    scale: float,
    yaw: float = DEFAULT_YAW,
    pitch: float = DEFAULT_PITCH,
) -> Project:
    def point(v: Point) -> Flat:
        x, y, z = v
        return (
            cx + scale * (x * math.cos(yaw) - z * math.sin(yaw)),
            cy
            + scale
            * (
                y * math.cos(pitch)
                - (x * math.sin(yaw) + z * math.cos(yaw)) * math.sin(pitch)
            ),
        )

    return point


def circle3(
    c: canvas.Canvas,
    project: Project,
    radius: float,
    y: float,
    color: str,
    width: float = 3,
) -> None:
    points = [
        project((radius * math.cos(a), y, radius * math.sin(a)))
        for a in [i * math.tau / 96 for i in range(97)]
    ]
    path(c, points, color, width)


def person(c: canvas.Canvas, project: Project) -> None:
    # Seated scale witness; no implied seat or harness design.
    head = project((0, 1.8, 0))
    c.setFillColor(HexColor(GOLD))
    c.circle(*head, 12, stroke=0, fill=1)
    for a, b, width in [
        ((0, 1.63, 0), (0, 1.12, 0), 24),
        ((0, 1.15, 0), (0.32, 0.94, -0.20), 12),
        ((0.32, 0.94, -0.20), (0.38, 0.65, -0.27), 10),
        ((0, 1.15, 0), (-0.28, 0.94, -0.16), 12),
        ((-0.28, 0.94, -0.16), (-0.34, 0.65, -0.24), 10),
    ]:
        line(c, project(a), project(b), GOLD, width)


def assembly(
    c: canvas.Canvas,
    project: Project,
    scale: float,
    suspended: bool = False,
    internal: bool = False,
) -> None:
    if suspended:
        # Generic host envelope; never labelled as owned or rated equipment.
        for x in [-2.4, 2.4]:
            for z in [-1.9, 1.9]:
                line(c, project((x * 1.2, 0, z)), project((x, 4.8, 0)), "#afbec4", 6)
        line(c, project((-2.4, 4.8, 0)), project((2.4, 4.8, 0)), "#afbec4", 8)
        line(c, project((0, 3.73, 0)), project((0, 4.8, 0)), GOLD, 3)
    else:
        for x, y, z in CORNERS:
            foot = (x * 1.2, 0.07, z * 1.2)
            line(c, project((x, y, z)), project(foot), INK, 7)
            fx, fy = project(foot)
            c.setFillColor(HexColor("#dce5e6"))
            c.setStrokeColor(HexColor(INK))
            c.ellipse(fx - 28, fy - 9, fx + 28, fy + 9, stroke=1, fill=1)
    path(c, [project(v) for v in CORNERS], INK, 8, close=True)
    circle3(c, project, RING, RY, TEAL, 11)
    for index, (corner, head) in enumerate(zip(CORNERS, HEADS, strict=True)):
        line(c, project(corner), project(head), INK, 5)
        hp = project(head)
        target = project((0, CY, 0))
        angle = math.degrees(math.atan2(hp[0] - target[0], target[1] - hp[1]))
        projector(c, hp, angle)
        cp = project(corner)
        c.setStrokeColor(HexColor(GOLD))
        c.setLineWidth(3)
        c.ellipse(cp[0] - 7, cp[1] - 3, cp[0] + 7, cp[1] + 14, stroke=1, fill=0)
        if suspended:
            line(c, project(head), project((0, 3.50, 0)), GOLD, 1.4, [6, 4])
    center = project((0, CY, 0))
    c.saveState()
    c.setFillAlpha(0.36)
    c.setFillColor(HexColor("#edf6f7"))
    c.circle(*center, scale * 1.5, stroke=0, fill=1)
    c.restoreState()
    c.setStrokeColor(HexColor(TEAL))
    c.setLineWidth(2.5)
    c.circle(*center, scale * 1.5, stroke=1, fill=0)
    c.setDash([5, 5])
    c.setStrokeColor(HexColor("#76a1b1"))
    c.circle(*center, scale, stroke=1, fill=0)
    c.setDash([])
    # Wall ties and compliant inner floor are visual explanations, not specifications.
    circle3(c, project, RING, RY, TEAL, 7)
    for n in range(15):
        angle = math.tau * n / 15
        line(
            c,
            (center[0] + scale * math.cos(angle), center[1] + scale * math.sin(angle)),
            (
                center[0] + 1.5 * scale * math.cos(angle),
                center[1] + 1.5 * scale * math.sin(angle),
            ),
            "#9ebac3",
            1,
        )
    floor = [
        project((x, 0.74 + 0.4 * (abs(x) / 0.8) ** 2, -0.05))
        for x in [-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8]
    ]
    path(c, floor, TEAL, 3)
    # Illustrative tunnel between the 270- and 30-degree webbing meridians.
    # Project it at the near shell edge so the opening stays visually clear.
    entry = project((1.25, 1.35, -0.75))
    c.setFillColor(HexColor(PAPER))
    c.setStrokeColor(HexColor(TEAL))
    c.setLineWidth(2)
    c.ellipse(
        entry[0] - 24, entry[1] - 39, entry[0] + 24, entry[1] + 39, fill=1, stroke=1
    )
    c.ellipse(
        entry[0] - 18, entry[1] - 32, entry[0] + 18, entry[1] + 32, fill=0, stroke=1
    )
    person(c, project)
    if suspended:
        display_radius = 1.512
        start = math.atan2(TY - CY, 1.8) + math.acos(
            display_radius / math.hypot(1.8, TY - CY)
        )
        end = math.asin(display_radius / 1.72)
        for x, y, z in CORNERS:
            angle = math.atan2(z, x)
            points = [(x, y, z)]
            points += [
                (
                    display_radius * math.cos(t) * math.cos(angle),
                    CY + display_radius * math.sin(t),
                    display_radius * math.cos(t) * math.sin(angle),
                )
                for t in [start + (end - start) * i / 32 for i in range(33)]
            ]
            points.append((0, 3.42, 0))
            path(c, [project(v) for v in points], GOLD, 7)
        rx, ry = project((0, 3.50, 0))
        c.setStrokeColor(HexColor(GOLD))
        c.setLineWidth(3)
        c.circle(rx, ry, 9, stroke=1, fill=0)
        line(c, project((0, 3.58, 0)), project((0, 3.73, 0)), GOLD, 6)
    if internal:
        p = project((-0.6, 2.03, 0.3))
        c.setFillColor(HexColor(NAVY))
        c.roundRect(p[0] - 13, p[1] - 9, 26, 18, 3, stroke=0, fill=1)
        c.setStrokeColor(HexColor(TEAL))
        c.circle(p[0], p[1], 23, stroke=1, fill=0)
    # Keep the near-side optical arm visible over the translucent shell.
    for corner, head in zip(CORNERS, HEADS, strict=True):
        if head[2] < -1.8:
            line(c, project(corner), project(head), INK, 5)
            hp = project(head)
            target = project((0, CY, 0))
            angle = math.degrees(math.atan2(hp[0] - target[0], target[1] - hp[1]))
            projector(c, hp, angle)


def callout(
    c: canvas.Canvas,
    x: float,
    y: float,
    number: int,
    title: str,
    body: str,
    width: int = 34,
) -> float:
    badge(c, x, y + 5, number)
    text(c, x + 27, y, title, 22, INK, True)
    return paragraph(c, x + 27, y - 32, body, width, 18, leading=25)


def landed(c: canvas.Canvas) -> None:
    header(
        c,
        1,
        "The moon, landed.",
        "One occupied sphere. One reusable triangle holder. Three arm-mounted projector heads.",
    )
    project = projection(480, 300, 118)
    assembly(c, project, 118)
    line(c, (75, 240), (945, 240), "#bacacd", 1)
    text(c, 72, 736, "LANDED CONFIGURATION", 20, TEAL, True)
    text(c, 72, 706, "Axonometric study / dry-land placement", 17, MUTED)
    callout(
        c,
        995,
        718,
        1,
        "Shared holder",
        "Padded seating loop on a low metal triangle. The same holder is used when suspended.",
    )
    callout(
        c,
        995,
        554,
        2,
        "Detachable legs",
        "Three splayed lander legs and broad pads. Ground stability, joint design and ballast are to be resolved.",
    )
    callout(
        c,
        995,
        365,
        3,
        "All optics ride along",
        "Three outward arms carry projector heads and ventilated rain covers. No separate projector stands.",
    )
    text(c, 72, 182, "NOMINAL LAYOUT", 16, TEAL, True)
    text(
        c,
        72,
        151,
        "Sphere: 3.0 m diameter   |   Centre: 1.7 m   |   Top: 3.2 m / 10 ft 6 in   |   Ring: 1.83 m",
        21,
        INK,
    )
    paragraph(
        c,
        72,
        111,
        "Visible access tunnel, wall ties and soft inner floor are schematic. Opening location, occupant support and ventilation require the actual sphere and reviewed design; the dotted 2 m inner envelope is provisional.",
        138,
        16,
        leading=22,
    )


def suspended(c: canvas.Canvas) -> None:
    header(
        c,
        2,
        "The same holder, suspended.",
        "Lander legs detach. Webbing, upper hardware and a suitable aerial host are added.",
    )
    project = projection(475, 216, 100, math.radians(18), math.radians(9))
    assembly(c, project, 100, suspended=True)
    text(c, 65, 742, "SUSPENDED ALTERNATIVE", 20, TEAL, True)
    text(c, 65, 711, "Generic host envelope / rig and rigging unselected", 17, MUTED)
    callout(
        c,
        1000,
        720,
        1,
        "Primary suspension",
        "Loop and triangle transfer load through three webbing paths over the sphere to a top ring, swivel and halyard.",
    )
    callout(
        c,
        1000,
        525,
        2,
        "Arm stays proposed",
        "Dashed lines indicate a proposed stay from each loaded projector arm to the top ring. Stay tensions and balance are not solved.",
    )
    callout(
        c,
        1000,
        325,
        3,
        "Complete loaded review",
        "Review sphere, person, frame, all optics, covers, cables and dynamic loads as one assembly. No component rating approves the whole system.",
    )
    paragraph(
        c,
        65,
        112,
        "The 4.8 m host height is a study envelope, not a selected rig. Webbing presses on the skin; seam contact, deflation support, wind limits, rotation control and lowerable recovery remain unresolved.",
        134,
        16,
        leading=22,
    )


def optics(c: canvas.Canvas) -> None:
    header(
        c,
        3,
        "Three heads. One triangle.",
        "Plan view of the proposed projection geometry and optional participant-overlay signal path.",
    )
    cx, cy, scale = 432, 475, 70

    def top(v: Point) -> Flat:
        return (cx + v[0] * scale, cy + v[2] * scale)

    c.setStrokeColor(HexColor(TEAL))
    c.setLineWidth(2.5)
    c.setFillColor(HexColor("#e1eff0"))
    c.circle(cx, cy, 1.5 * scale, fill=1, stroke=1)
    c.setDash([5, 4])
    c.circle(cx, cy, RING * scale, fill=0, stroke=1)
    c.setDash([])
    path(c, [top(v) for v in CORNERS], INK, 6, close=True)
    for index, (corner, head) in enumerate(zip(CORNERS, HEADS, strict=True)):
        hp, cp = top(head), top(corner)
        line(c, cp, hp, INK, 5)
        line(c, hp, (cx, cy), TEAL, 1.5, [5, 5])
        angle = math.degrees(math.atan2(head[2], head[0])) + 90
        projector(c, hp, angle, plan=True)
        badge(c, hp[0] + 36, hp[1], index + 1)
    text(c, cx - 48, cy + 8, "MOON", 20, TEAL, True)
    text(c, cx - 71, cy - 20, "3 m nominal", 18, MUTED)
    text(c, 65, 745, "TOP VIEW / 120-DEGREE SPACING", 19, TEAL, True)
    paragraph(c, 900, 741, "Three short-throw heads", 35, 27, INK, 34)
    paragraph(
        c,
        900,
        693,
        "Each corner carries an upward/outward arm, projector and rain cover. Aim rays are schematic; the drawing does not claim full 360-degree coverage.",
        43,
        20,
    )
    text(c, 900, 535, "Optional live-image layer", 26, INK, True)
    flow = [
        ("Internal camera", "Position and mount unresolved"),
        ("Capture + moon compositing", "Computer and software unselected"),
        ("Warp / blend to 3 heads", "Lens and shell tests required"),
    ]
    for index, (title, note) in enumerate(flow):
        y = 478 - index * 101
        c.setFillColor(HexColor("#e1ecef"))
        c.roundRect(900, y - 35, 445, 74, 7, fill=1, stroke=0)
        text(c, 918, y + 11, title, 22, INK, True)
        text(c, 918, y - 15, note, 17, MUTED)
        if index < 2:
            line(c, (1120, y - 39), (1120, y - 58), TEAL, 2)
            path(c, [(1114, y - 52), (1120, y - 60), (1126, y - 52)], TEAL, 2)
    text(c, 65, 180, "OPTICAL REALITY CHECK", 16, TEAL, True)
    paragraph(
        c,
        65,
        146,
        "At 2.75 m lens-to-flat-screen distance, the HD146X's 1.47-1.62 throw ratio gives 1.70-1.87 m image width. That is not a spherical coverage result: three versus four heads, lens offset, focus, overlap and shadows still need a shell test.",
        133,
        18,
        leading=25,
    )
    text(
        c,
        65,
        85,
        "Source: Optoma USA HD146X specifications - optomausa.com/product/HD146X (checked 2026-10-01 UTC)",
        14,
        MUTED,
    )


def detail(c: canvas.Canvas) -> None:
    header(
        c,
        4,
        "A buildable brief starts with the interfaces.",
        "Dimensions are explicit study inputs. Connections, member sizes and equipment remain to be designed.",
    )
    p = projection(436, 274, 110, 0, 0)
    # True side profile of one radial arm; depict its actual 2 m length at 30 degrees.
    circle3(c, p, RING, RY, TEAL, 7)
    c.setStrokeColor(HexColor(TEAL))
    c.circle(*p((0, CY, 0)), 165, fill=0, stroke=1)
    a = (1.8, TY, 0)
    b = (1.8 + 2 * math.cos(ELEVATION), TY + 1, 0)
    line(c, p((-0.9, TY, 0)), p(a), INK, 8)
    line(c, p(a), p(b), INK, 6)
    projector(c, p(b), 75)
    line(c, p(b), p((0, CY, 0)), TEAL, 1.5, [5, 4])
    line(c, p(b), p((0, 3.50, 0)), GOLD, 1.5, [6, 4])
    text(c, 73, 744, "ONE RADIAL ARM / SIDE STUDY", 19, TEAL, True)
    text(c, 620, 382, "2.0 m arm", 20, INK, True)
    text(c, 660, 301, "30 deg study angle", 17, MUTED)
    text(c, 245, 670, "3.0 m sphere", 20, TEAL, True)
    text(c, 79, 249, "1.8 m centre-to-corner", 19, INK)
    paragraph(
        c,
        80,
        189,
        "Shown here: 1.8 m corner radius, 2 m arm, 30-degree rise. A proposed 2.2 m corner or 2.5 m arm is a different envelope and needs the same fit/load checks.",
        73,
        18,
        leading=26,
    )
    callout(
        c,
        950,
        721,
        1,
        "Ring / triangle fit",
        "Six-foot ring radius: 0.9144 m. Triangle inradius: 0.9000 m. The ring centreline overhangs each side by 14.4 mm; the seat interface needs detailing.",
        37,
    )
    callout(
        c,
        950,
        510,
        2,
        "Weather / service",
        "Rain covers travel with the arms. Preserve cooling airflow, cable strain relief, drip loops and access. Covers are not proof of an outdoor equipment rating.",
        37,
    )
    callout(
        c,
        950,
        300,
        3,
        "Entry / participant",
        "Exact sphere, exit opening, ventilation, occupancy, internal-camera retention and emergency recovery are unresolved. No occupied haze is included.",
        37,
    )


def budget(c: canvas.Canvas) -> None:
    header(
        c,
        5,
        "Build target and contribution plan.",
        "$3,000 total cash ceiling / planning allocations / quotes and final scope remain open.",
    )
    data = json.loads((ROOT / "assets/seed-options.json").read_text())
    option = next(item for item in data["options"] if item["id"] == "seed-zorb")
    text(c, 70, 746, "EXISTING GROUND / LED ALLOCATION", 19, TEAL, True)
    text(c, 70, 711, "These amounts are spending ceilings, not supplier prices.", 18)
    y = 650
    for item in option["items"]:
        paragraph(c, 75, y, item["label"], 48, 19, leading=22)
        text(c, 705, y, f"${item['high']:,}", 21, INK, True)
        line(c, (75, y - 41), (800, y - 41), "#d5e0e3", 1)
        y -= 68
    base = sum(item["high"] for item in option["items"])
    text(
        c,
        75,
        85,
        f"Allocation: ${base:,}   +   Reserve: $600   =   Target: $3,000",
        22,
        TEAL,
        True,
    )
    callout(
        c,
        905,
        716,
        1,
        "Projection scope is unpriced",
        "Three projector heads, outward arms, rain covers and mapping hardware/software must fit within the same cap or have confirmed in-kind support.",
        38,
    )
    callout(
        c,
        905,
        512,
        2,
        "Suspension is an alternative",
        "Host rig, lifting hardware and assembly review are unpriced. The concept image does not establish a booked rig or a complete $3,000 suspended build.",
        38,
    )
    callout(
        c,
        905,
        310,
        3,
        "DIY resources / optional layer",
        "Andrew has a pipe bender and denhac access; fabrication labor is planned in-kind. A named helper, donated optics and optional internal live capture are not yet committed.",
        38,
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    SHEETS.mkdir(parents=True, exist_ok=True)
    pages = [
        ("01-landed", landed),
        ("02-suspended", suspended),
        ("03-projection-and-overlay", optics),
        ("04-interface-study", detail),
        ("05-budget-and-scope", budget),
    ]
    writer = PdfWriter()
    for name in [
        "zencelades-concept-landed-v2.png",
        "zencelades-concept-suspended-v2.png",
    ]:
        hero = OUT / name
        if not hero.exists():
            continue
        cover = BytesIO()
        cover_canvas = canvas.Canvas(cover, pagesize=(W, H))
        cover_canvas.drawImage(str(hero), 0, 0, width=W, height=H)
        cover_canvas.showPage()
        cover_canvas.save()
        cover.seek(0)
        writer.append(PdfReader(cover))
    for stem, draw in pages:
        dest = SHEETS / f"zencelades-{stem}.pdf"
        c = canvas.Canvas(str(dest), pagesize=(W, H))
        c.setTitle(f"Zencelades - {stem} - concept schematic")
        c.setAuthor("Zencelades / Andrew")
        draw(c)
        c.showPage()
        c.save()
        writer.append(PdfReader(dest))
    writer.write(OUT / "zencelades-grant-schematics.pdf")
    spec = {
        "sphere_diameter_m": 3,
        "sphere_centre_y_m": CY,
        "ring_diameter_m": RING * 2,
        "triangle_corner_radius_m": 1.8,
        "triangle_side_m": 1.8 * math.sqrt(3),
        "ring_y_m": RY,
        "triangle_y_m": TY,
        "arm_length_m": ARM,
        "arm_elevation_degrees": 30,
        "heads": HEADS,
        "sphere_and_host_selected": False,
        "equipment_and_structure_approved": False,
        "hd146x_flat_width_at_2_75m": [2.75 / 1.62, 2.75 / 1.47],
    }
    (OUT / "schematic-inputs.json").write_text(json.dumps(spec, indent=2) + "\n")
    print(f"Rendered {len(pages)} schematic sheets and combined PDF to {OUT}")


if __name__ == "__main__":
    main()
