"""Compose dimensioned grant sheets from the P053 Blender models and cameras."""

from __future__ import annotations

import json
import math
from io import BytesIO
from pathlib import Path
from textwrap import wrap

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/grant-3d"
MODELS = json.loads((OUT / "geometry.json").read_text())["models"]
W, H = 1680, 1188
INK, TEAL, GREY = "#173345", "#067d88", "#53707c"


def text(c, x, y, value, size=22, color=INK, bold=False):
    c.setFillColor(HexColor(color))
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.drawString(x, y, value)


def paragraph(c, x, y, value, columns=44, size=22, leading=30):
    for row in wrap(value, columns):
        text(c, x, y, row, size, GREY)
        y -= leading
    return y


def line(c, a, b, color=TEAL, width=1.4):
    c.setStrokeColor(HexColor(color))
    c.setLineWidth(width)
    c.line(*a, *b)


def arrow(c, tip, toward):
    dx, dy = toward[0] - tip[0], toward[1] - tip[1]
    norm = math.hypot(dx, dy)
    if not norm:
        return
    ux, uy = dx / norm, dy / norm
    for side in [-1, 1]:
        line(
            c, tip, (tip[0] + 10 * ux + side * 4 * uy, tip[1] + 10 * uy - side * 4 * ux)
        )


def dimension(c, a, b, value, offset=34, vertical=False):
    if vertical:
        x = max(a[0], b[0]) + offset
        da, db = (x, a[1]), (x, b[1])
    else:
        y = min(a[1], b[1]) - offset
        da, db = (a[0], y), (b[0], y)
    line(c, a, da, "#86a3ac", 0.8)
    line(c, b, db, "#86a3ac", 0.8)
    line(c, da, db)
    arrow(c, da, db)
    arrow(c, db, da)
    if vertical:
        text(c, da[0] + 9, (da[1] + db[1]) / 2, value, 18, TEAL, True)
    else:
        c.setFont("Helvetica-Bold", 18)
        c.setFillColor(HexColor(TEAL))
        c.drawCentredString((da[0] + db[0]) / 2, da[1] - 25, value)


def header(c, number, title, subtitle):
    c.setFillColor(HexColor("#ffffff"))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    text(c, 52, H - 52, "ZENCELADES  /  LOVE BURN 2027", 20, TEAL, True)
    text(c, 52, H - 108, title, 38, INK, True)
    text(c, 52, H - 147, subtitle, 21, GREY)
    line(c, (52, 66), (W - 52, 66), "#c8d7db", 1)
    text(
        c,
        52,
        37,
        "NOMINAL 3D STUDY  |  Metres  |  Cutaway panels are drawing conventions  |  No fabrication or capacity approval",
        16,
        GREY,
    )
    text(c, W - 170, 37, f"DRAWING {number:02d}", 16, TEAL, True)


def view(c, model, angle, area, frame=False):
    record = next(
        v for v in model["frame_views" if frame else "views"] if v["view"] == angle
    )
    x, y, w, h = area
    pixels = record["pixels"]
    rw, rh = w, w * pixels[1] / pixels[0]
    if rh > h:
        rh, rw = h, h * pixels[0] / pixels[1]
    x += (w - rw) / 2
    y += (h - rh) / 2
    encoded = BytesIO()
    with Image.open(OUT / record["file"]) as rendered:
        rendered.convert("RGB").save(encoded, format="JPEG", quality=90, optimize=True)
    encoded.seek(0)
    c.drawImage(ImageReader(encoded), x, y, width=rw, height=rh)
    return {
        key: (x + coords[0] * rw, y + coords[1] * rh)
        for key, coords in record["projected_anchors"].items()
    }


def leader(c, anchor, label_at, title, body="", columns=33):
    x, y = label_at
    line(c, anchor, (x - 10, y + 5), "#638895", 1)
    c.setFillColor(HexColor(TEAL))
    c.circle(*anchor, 3, stroke=0, fill=1)
    text(c, x, y, title, 22, TEAL, True)
    if body:
        paragraph(c, x, y - 31, body, columns, 19, 26)


def landed(c, model):
    header(
        c,
        1,
        "Lander assembly / 3.0 m sphere",
        "Actual model render: same low holder, detachable legs, three optical arms and a seated participant.",
    )
    p = view(c, model, "iso", (25, 175, 1110, 835))
    leader(
        c,
        p["entry"],
        (1160, 835),
        "OPEN ENTRY",
        "Nominal 680 mm opening shown. Exact product, exit size and ventilation remain unselected.",
    )
    leader(
        c,
        p["corner0"],
        (1160, 603),
        "SHARED HOLDER",
        "Low triangle and padded 1.829 m loop. Corner plates show attachment locations; they are not joint specifications.",
    )
    leader(
        c,
        p["head0"],
        (1160, 357),
        "THREE OPTICAL HEADS",
        "2.0 m arms at 30 degrees, with open-sided rain canopies. Hardware weight, balance and optical coverage remain open.",
    )
    text(
        c,
        62,
        140,
        "Sphere OD 3.000 m  |  Centre 1.700 m  |  Sphere top 3.200 m  |  Person is a seated scale witness",
        22,
        INK,
        True,
    )
    text(
        c,
        62,
        99,
        "Front shell panels are removed only to reveal the soft inner floor, occupant space and double-wall construction.",
        20,
        GREY,
    )


def orthographic(c, model):
    header(
        c,
        2,
        "Orthographic dimensions / 3.0 m study",
        "Orthographic cameras share the same model. Dimensions are derived from the geometry, not image estimates.",
    )
    text(c, 62, 981, "FRONT", 20, TEAL, True)
    front = view(c, model, "front", (40, 610, 720, 365))
    below_ground = front["sphere_left"][1] - front["ground"][1] + 25
    dimension(
        c, front["sphere_left"], front["sphere_right"], "3.000 m OD", below_ground
    )
    dimension(c, front["ground"], front["sphere_top"], "3.200 m", 215, True)
    text(c, 62, 480, "SIDE", 20, TEAL, True)
    side = view(c, model, "side", (40, 135, 720, 340))
    dimension(c, side["ground"], side["centre"], "1.700 m centre", 220, True)
    text(c, 870, 981, "TOP / THREE HEADS AT 120 DEGREES", 20, TEAL, True)
    top = view(c, model, "top", (850, 280, 740, 640))
    a, b = top["corner0"], top["corner1"]
    dimension(c, a, b, "3.118 m triangle side", -105)
    width = model["overall_bounds_m"]["max"][0] - model["overall_bounds_m"]["min"][0]
    depth = model["overall_bounds_m"]["max"][1] - model["overall_bounds_m"]["min"][1]
    width_offset = top["width_left"][1] - 940
    dimension(
        c,
        top["width_left"],
        top["width_right"],
        f"{width:.3f} m overall width",
        width_offset,
    )
    paragraph(
        c,
        905,
        217,
        f"Modeled envelope: {width:.3f} m wide by {depth:.3f} m deep. Add circulation, access and any ballast. Projector-centre radius: 3.532 m; arms rise 1 m.",
        47,
        21,
        28,
    )
    text(
        c,
        62,
        95,
        "The whole installation exceeds 10 ft across even with a smaller sphere. Placement must include arms and access.",
        20,
        GREY,
    )


def suspended(c, model):
    header(
        c,
        3,
        "Suspended alternative / 3.0 m sphere",
        "Same holder and optical arms. Lower legs detach; three over-sphere webbing paths reach the collector.",
    )
    p = view(c, model, "iso", (20, 135, 1100, 860))
    leader(
        c,
        p["collector"],
        (1160, 850),
        "COLLECTOR + SWIVEL",
        "Proposed common upper hardware and halyard. Host rig is a generic 4.8 m study, not an owned or selected product.",
    )
    leader(
        c,
        p["corner2"],
        (1160, 599),
        "FRAME ATTACHMENT",
        "Loop to triangle to three webbing paths. Ropes/straps attach to the metal holder; visible wall ties are separate.",
    )
    leader(
        c,
        p["head0"],
        (1160, 358),
        "ARM STAYS",
        "Thin lines represent proposed stays to the upper ring. Loaded balance, skin pressure, recovery and host reactions need review.",
    )
    text(
        c,
        62,
        105,
        "Illustrative host: 4.8 m high, 4.8 m crossbar centre span. Host pads, ballast and operating envelope are unresolved.",
        20,
        GREY,
    )


def interfaces(c, model):
    header(
        c,
        4,
        "Shared frame / interface study",
        "Shell and participant hidden to expose the 3D holder, detachable ground support and optical-arm arrangement.",
    )
    p = view(c, model, "iso", (25, 370, 1040, 590), True)
    top = view(c, model, "top", (1045, 330, 575, 565), True)
    dimension(c, top["ring_left"], top["ring_right"], "1.829 m seating loop", 25)
    leader(
        c,
        p["corner2"],
        (62, 287),
        "DETACHABLE LOWER LEGS",
        "One holder, two installation modes. Ground joints are represented by envelopes; pin sizes and bearing details are not specified.",
        53,
    )
    leader(
        c,
        p["head0"],
        (800, 287),
        "ARMS + CANOPIES RIDE WITH THE FRAME",
        "No separate projector stands. Lens direction, shell focus, shadows and electrical weather protection need equipment-specific trials.",
        60,
    )
    paragraph(
        c,
        62,
        125,
        "Fit detail: ring centreline radius 0.9144 m; triangle inradius 0.9000 m. Interface tabs must resolve the 14.4 mm centreline overhang. Tube sizes, welds and donor suitability remain unengineered.",
        132,
        19,
        25,
    )


def comparison(c, small, large):
    header(
        c,
        5,
        "Two sphere sizes / one clear choice",
        "Both are acceptable studies. Select one set of dimensions for the application; do not mix them.",
    )
    text(c, 75, 983, "2.5 m ALTERNATIVE", 24, TEAL, True)
    text(c, 910, 983, "3.0 m STUDY", 24, TEAL, True)
    view(c, small, "iso", (25, 415, 800, 540))
    view(c, large, "iso", (850, 415, 800, 540))
    rows = [
        ("Sphere outside diameter", "2.500 m", "3.000 m"),
        ("Sphere top at 1.7 m centre", "2.950 m / 9 ft 8 in", "3.200 m / 10 ft 6 in"),
        (
            "Loop centre elevation",
            f"{small['ring_elevation_m']:.3f} m",
            f"{large['ring_elevation_m']:.3f} m",
        ),
        (
            "Inner diameter - provisional",
            f"{small['inner_diameter_m']:.3f} m",
            f"{large['inner_diameter_m']:.3f} m",
        ),
    ]
    for i, (label, a, b) in enumerate(rows):
        y = 360 - 53 * i
        text(c, 75, y, label, 22, INK, True)
        text(c, 635, y, a, 22)
        text(c, 1110, y, b, 22)
        line(c, (75, y - 17), (1600, y - 17), "#d2dfe2", 1)
    text(
        c,
        75,
        101,
        "Both keep the 1.8 m triangle corner radius and 2 m arms. Overall footprint exceeds 10 ft; 2.5 m is not a permit exemption.",
        20,
        GREY,
    )


def hazer_placement(c, model):
    header(
        c,
        6,
        "Owned hazer / below the sphere",
        "Large external effect unit on the ground; the occupied sphere and its inflation system stay separate.",
    )
    p = view(c, model, "iso", (25, 190, 1110, 810))
    leader(
        c,
        p["hazer"],
        (1160, 810),
        "ALREADY OWNED / $0",
        "Andrew's large hazer. Body shown as a provisional 0.8 x 0.6 x 0.34 m envelope, not measured hardware.",
    )
    leader(
        c,
        p["sphere_bottom"],
        (1160, 555),
        "OFFSET BELOW EDGE",
        "Only 0.20 m beneath the 3 m sphere's centre. Unit is offset under the lower edge; final clearances need its manual.",
    )
    leader(
        c,
        p["entry"],
        (1160, 300),
        "EXTERNAL EFFECT",
        "Entry remains visible. No hose enters the sphere. Power, fluid, outlet direction and weather protection remain unconfirmed.",
    )
    text(
        c,
        62,
        125,
        "Equipment purchase: $0 incremental  |  Fluid, power and protection: unpriced  |  No plume or airflow prediction",
        21,
        INK,
        True,
    )


def main():
    landed3 = next(m for m in MODELS if m["diameter_m"] == 3 and m["mode"] == "lander")
    hung3 = next(m for m in MODELS if m["diameter_m"] == 3 and m["mode"] == "suspended")
    landed25 = next(
        m for m in MODELS if m["diameter_m"] == 2.5 and m["mode"] == "lander"
    )
    c = canvas.Canvas(str(OUT / "Zencelades-3D-Schematics.pdf"), pagesize=(W, H))
    c.setTitle("Zencelades - dimensioned 3D submission schematics")
    c.setAuthor("Zencelades / Andrew")
    for draw, model in [
        (landed, landed3),
        (orthographic, landed3),
        (suspended, hung3),
        (interfaces, landed3),
    ]:
        draw(c, model)
        c.showPage()
    comparison(c, landed25, landed3)
    c.showPage()
    hazer_placement(c, landed3)
    c.showPage()
    c.save()
    print(
        "Wrote six geometry-derived 3D schematic pages including owned external hazer"
    )


if __name__ == "__main__":
    main()
