"""Build an Erebe-compatible static module from verified supplied assets."""

from __future__ import annotations

import html
import json
import math
import shutil
import subprocess
from pathlib import Path
from urllib.parse import quote

from scripts.assets import ROOT, inventory, sha256, verify_release
from scripts.catalog_v4 import collect


def proposal_budget_html(ledger: dict) -> str:
    """Render the application ledger's line totals without adding rental costs."""
    rows = []
    totals = [0, 0]
    for line in ledger["tier1"]["lines"]:
        amounts = [line[bound] for bound in ("low", "high")]
        totals = [total + amount for total, amount in zip(totals, amounts)]
        rows.append(
            f'<tr><th scope="row">{html.escape(line["item"])}</th>'
            f"<td>{line['qty']}</td>"
            + "".join(f"<td>${math.floor(value + 0.5):,}</td>" for value in amounts)
            + "</tr>"
        )
    reserve = [value * ledger["contingency_percent"] / 100 for value in totals]
    for label, amounts in (
        ("Subtotal", totals),
        (f"Contingency · {ledger['contingency_percent']}%", reserve),
        ("Total · USD", [value + extra for value, extra in zip(totals, reserve)]),
    ):
        rows.append(
            f'<tr><th scope="row" colspan="2">{html.escape(label)}</th>'
            + "".join(f"<td>${math.floor(value + 0.5):,}</td>" for value in amounts)
            + "</tr>"
        )
    return "\n".join(rows)


def publish_public_surfaces(output: Path, source: Path, studio: Path) -> None:
    """Publish the SPA entry and retain standalone artwork pages and original files."""
    shutil.copytree(studio, output, dirs_exist_ok=True)
    (output / "studio").mkdir(exist_ok=True)
    shutil.copyfile(studio / "index.html", output / "studio/index.html")
    for page in ("about", "open-source"):
        shutil.copytree(source / page, output / page, dirs_exist_ok=True)


def publish_cockpit_pages(output: Path, shell: Path) -> None:
    """Retain authored pages and serve their public URLs through the cockpit."""
    content = output / "page-content"
    content.mkdir(exist_ok=True)
    for name in (
        "application",
        "mounts",
        "grants",
        "pricing",
        "catalog",
        "naming",
        "name-concepts",
        "open-source",
        "about",
        "models",
        "showtime",
    ):
        page = output / name / "index.html"
        if page.exists():
            shutil.copyfile(page, content / f"{name}.html")
            shutil.copyfile(shell, page)


def build() -> None:
    v4 = json.loads((ROOT / "assets/v4-inventory.json").read_text())
    actual_v4 = collect()
    if [(e["path"], e["content_sha256"]) for e in actual_v4] != [
        (e["path"], e["content_sha256"]) for e in v4
    ]:
        raise ValueError("v4 inventory differs from preserved assets")
    subprocess.run(["bun", "run", "build"], cwd=ROOT / "cockpit", check=True)
    verify_release(ROOT / "deliveries/enceladus_v3")
    entries = json.loads((ROOT / "assets/inventory.json").read_text())
    actual = inventory()
    if [(e["path"], e["content_sha256"]) for e in actual] != [
        (e["path"], e["content_sha256"]) for e in entries
    ]:
        raise ValueError("Inventory differs from local assets")
    output = ROOT / "site/dist"
    output.mkdir(parents=True, exist_ok=True)
    packet = ROOT / "deliveries/grant-3d-p059"
    manifest = json.loads((packet / "catalog.json").read_text())
    for entry in manifest["files"]:
        relative = Path(entry["path"]).relative_to("output/grant-3d")
        asset = packet / relative
        if (
            asset.stat().st_size != entry["bytes"]
            or sha256(asset) != entry["content_sha256"]
        ):
            raise ValueError(f"Grant attachment integrity mismatch: {relative}")
        target = output / "attachments" / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(asset, target)
    for entry in [*entries, *v4]:
        source = ROOT / entry["path"]
        destination = output / "downloads" / entry["path"]
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        if sha256(destination) != entry["content_sha256"]:
            raise ValueError(f"Build copy hash mismatch: {destination}")
    previews = {
        "concept-board.png": "source/uploads/ChatGPT Image Sep 30, 2026, 11_59_59 AM.png",
        "concept-landed.png": "docs/design/application/submission/01-concept-landed.png",
        "concept-suspended.png": "docs/design/application/submission/05-concept-suspended.png",
        "concept-suspended-hoop-v3.png": "docs/design/application/submission/05-concept-suspended-hoop-v3.png",
        "film-poster.png": "deliveries/enceladus_v3/previews/six_views_same_atlas.png",
        "variant-a.png": "deliveries/enceladus_v3/drawings/v3_A_literal_dual_hitch_isometric.png",
        "variant-b.png": "deliveries/enceladus_v3/drawings/v3_B_chassis_saddle_isometric.png",
        "previs.mp4": "source/uploads/enceladus_within_cinematic_previs_h264.mp4",
        "above-the-ice.mp4": "source/research/enceladus-videos/derived/above-the-ice.mp4",
    }
    (output / "media").mkdir(exist_ok=True)
    for name, source in previews.items():
        shutil.copyfile(ROOT / source, output / "media" / name)
    (output / "documents").mkdir(exist_ok=True)
    for name in (
        "love-burn-research.md",
        "grant-draft.md",
        "asset-understanding.md",
        "pricing-alternatives.md",
        "grant-research-library.md",
        "strong-art-grant-guide.md",
        "engineering-research.md",
        "mount-options-research.md",
        "v4-fixed15-understanding.md",
        "grant-application-packet.md",
        "grant-resource-ledger.md",
        "grant-prior-art-and-mounts.md",
        "love-burn-camp-and-vehicle-rules.md",
    ):
        shutil.copyfile(ROOT / "docs" / name, output / "documents" / name)
    for name in ("style.css", "catalog.js", "access.js", "access.css"):
        shutil.copyfile(ROOT / "site" / name, output / name)
    shutil.copytree(ROOT / "site/naming", output / "naming", dirs_exist_ok=True)
    shutil.copytree(
        ROOT / "site/name-concepts", output / "name-concepts", dirs_exist_ok=True
    )
    shutil.copytree(ROOT / "site/pricing", output / "pricing", dirs_exist_ok=True)
    shutil.copytree(ROOT / "site/grants", output / "grants", dirs_exist_ok=True)
    shutil.copytree(ROOT / "site/mounts", output / "mounts", dirs_exist_ok=True)
    shutil.copytree(ROOT / "site/models", output / "models", dirs_exist_ok=True)
    shutil.copytree(ROOT / "site/showtime", output / "showtime", dirs_exist_ok=True)
    pitch = ROOT / "source/uploads/zencelades-pitch.mp4"
    if pitch.exists():
        shutil.copyfile(pitch, output / "media/pitch.mp4")
        pitch_html = (
            '<figure class="film"><video controls preload="metadata" poster="/media/concept-landed.png"'
            ' aria-label="The artist introduces Zencelades in ninety seconds">'
            '<source src="/media/pitch.mp4" type="video/mp4"></video>'
            "<figcaption><strong>Who, what, why, how.</strong> Shot on a phone, as asked.</figcaption></figure>"
        )
    else:
        pitch_html = (
            '<p class="note">The pitch video is being recorded; drop it at'
            " <code>source/uploads/zencelades-pitch.mp4</code> and it appears here. The films below carry the idea.</p>"
        )
    showtime = output / "showtime/index.html"
    showtime.write_text(showtime.read_text().replace("@@PITCH@@", pitch_html))
    shutil.copytree(
        ROOT / "site/application", output / "application", dirs_exist_ok=True
    )
    shutil.copyfile(
        ROOT / "assets/grant-resource-ledger.json", output / "application/ledger.json"
    )
    shutil.copyfile(ROOT / "assets/mount-sources.json", output / "mounts/sources.json")
    shutil.copyfile(ROOT / "assets/grant-sources.json", output / "grants/sources.json")
    pricing = json.loads((ROOT / "site/pricing/options.json").read_text())
    settings = pricing["defaults"]
    pricing_rows = []
    for option in pricing["options"]:
        rent = (
            option["projectors"]
            * settings["days"]
            * settings["dayRate"]
            * (1 - settings["discount"] / 100)
        )
        low, high = [
            max(
                0,
                sum(item[bound] for item in option["items"])
                + rent
                + (
                    pricing["capture"][bound]
                    if settings["capture"] and option["projectors"]
                    else 0
                )
                - settings["credit"],
            )
            * (1 + settings["contingency"] / 100)
            + settings["taxAllowance"]
            for bound in ("low", "high")
        ]
        pricing_rows.append(
            f'<tr><th scope="row">{html.escape(option["name"])}</th>'
            f"<td>{option['projectors']}</td><td>${math.floor(low + 0.5):,}–${math.floor(high + 0.5):,}</td>"
            f"<td>{html.escape(option['position'])}</td></tr>"
        )
    pricing_html = (
        (ROOT / "site/pricing/index.html")
        .read_text()
        .replace("@@PRICING_ROWS@@", "\n".join(pricing_rows))
        .replace(
            "@@GRANT_BUDGET@@",
            proposal_budget_html(
                json.loads((ROOT / "assets/grant-resource-ledger.json").read_text())
            ),
        )
    )
    (output / "pricing/index.html").write_text(pricing_html)
    template = (ROOT / "site/index.html").read_text()
    for token, prefix in (("UPLOADS", "source/uploads/"), ("RELEASE", "deliveries/")):
        rows = []
        for entry in entries:
            path = str(entry["path"])
            if path.startswith(prefix):
                rows.append(
                    f'<li><a href="/downloads/{quote(path)}" download>{html.escape(path.removeprefix(prefix))}</a><span>{entry["bytes"]:,} bytes</span></li>'
                )
        template = template.replace(f"@@{token}@@", "\n".join(rows))
    for variant in ("A", "B"):
        name = "literal_dual_hitch" if variant == "A" else "chassis_saddle"
        for kind, extension in (("MODEL", "glb"), ("STEP", "step")):
            template = template.replace(
                f"@@{kind}_{variant}@@",
                f"/downloads/deliveries/enceladus_v3/models/v3_{variant}_{name}.{extension}",
            )
    catalog = json.loads((ROOT / "assets/catalog.json").read_text())
    storage_status = (
        "Storage status: local preservation verified; immutable lakeFS upload pending."
    )
    remote_files = catalog["files"]
    if remote_files and all(row["lakefs_commit"] for row in remote_files):
        commits = {row["lakefs_commit"] for row in remote_files}
        repositories = {row["lakefs_repo"] for row in remote_files}
        if len(commits) != 1 or len(repositories) != 1:
            raise ValueError("Catalog spans unexpected storage commits")
        storage_status = (
            f"Storage status: all {len(remote_files)} individual files preserved in "
            f"hesellsheshells lakeFS repository {next(iter(repositories))}, "
            f"immutable commit {next(iter(commits))}. Every remote byte was read back and verified."
        )
    archives = [row for row in remote_files if row["path"].lower().endswith(".zip")]
    if archives and all(row.get("b2_file_id") for row in archives):
        storage_status += (
            f" ZIP archive storage: {len(archives)} original archive(s) also preserved in private B2, "
            "with version identifiers and full SHA-256 readback. Existing lakeFS history is retained."
        )
        shutil.copyfile(
            ROOT / "assets/b2-archive-receipt.json", output / "b2-archive-receipt.json"
        )
    template = template.replace("@@STORAGE_STATUS@@", html.escape(storage_status))
    if "@@" in template:
        raise ValueError("Unresolved site template marker")
    (output / "catalog").mkdir(exist_ok=True)
    (output / "catalog/index.html").write_text(template)
    publish_public_surfaces(output, ROOT / "site", ROOT / "cockpit/dist")
    teaser = (ROOT / "site/models/teaser.html").read_text()
    for page in (output / "mounts/index.html",):
        content = page.read_text()
        if 'id="current-models"' not in content:
            content = content.replace(
                "</head>",
                '<link rel="stylesheet" href="/models/gallery.css"></head>',
                1,
            )
            content = content.replace("<body>", "<body>" + teaser, 1)
            page.write_text(content)
    shutil.copyfile(ROOT / "assets/inventory.json", output / "asset-inventory.json")
    shutil.copyfile(ROOT / "assets/catalog.json", output / "asset-catalog.json")
    shutil.copyfile(ROOT / "assets/v4-catalog.json", output / "v4-asset-catalog.json")
    # Match Much Ado's content-versioned downloads to the verified packet bytes.
    for page in (
        output / "index.html",
        output / "mounts/index.html",
        output / "models/index.html",
        output / "about/index.html",
    ):
        content = page.read_text()
        versioned = content
        for entry in manifest["files"]:
            relative = Path(entry["path"]).relative_to("output/grant-3d")
            url = "/attachments/" + quote(relative.as_posix())
            versioned = versioned.replace(
                f'"{url}"', f'"{url}?v={entry["content_sha256"]}"'
            )
        if versioned != content:
            page.write_text(versioned)
    publish_cockpit_pages(output, output / "index.html")
    shutil.copyfile(ROOT / "site/page-shell.css", output / "page-content/shell.css")
    print(
        f"Built {output}: {len(entries)} original + {len(v4)} v4 byte-verified downloads and {len(previews)} media previews"
    )


if __name__ == "__main__":
    build()
