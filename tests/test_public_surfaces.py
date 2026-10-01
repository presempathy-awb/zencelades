from html.parser import HTMLParser

from scripts.build_site import proposal_budget_html, publish_public_surfaces


def test_proposal_budget_displays_purchases_once_and_contingency_separately():
    class Cells(HTMLParser):
        def __init__(self):
            super().__init__()
            self.text = []

        def handle_data(self, data):
            if data.strip():
                self.text.append(data.strip())

    rendered = proposal_budget_html(
        {
            "contingency_percent": 20,
            "tier1": {
                "lines": [
                    {
                        "item": "Two purchased heads & mounts",
                        "qty": 2,
                        "low": 998,
                        "high": 1198,
                    },
                    {"item": "Holder", "qty": 1, "low": 60, "high": 180},
                ]
            },
        }
    )
    cells = Cells()
    cells.feed(rendered)
    assert cells.text == [
        "Two purchased heads & mounts",
        "2",
        "$998",
        "$1,198",
        "Holder",
        "1",
        "$60",
        "$180",
        "Subtotal",
        "$1,058",
        "$1,378",
        "Contingency · 20%",
        "$212",
        "$276",
        "Total · USD",
        "$1,270",
        "$1,654",
    ]
    assert "heads &amp; mounts" in rendered


def test_spa_home_keeps_studio_artwork_and_existing_files(tmp_path):
    source, studio, output = [tmp_path / name for name in ("site", "cockpit", "dist")]
    for directory in (
        source / "about",
        source / "open-source",
        studio / "studio-assets",
        output / "attachments",
    ):
        directory.mkdir(parents=True)
    (source / "about/index.html").write_text("artwork homepage")
    (source / "about/pages.css").write_text("page styling")
    (source / "open-source/index.html").write_text("license disclosure")
    (studio / "index.html").write_text("interactive studio")
    (studio / "studio-assets/app.js").write_text("studio code")
    (output / "attachments/keep.png").write_bytes(b"existing image")

    publish_public_surfaces(output, source, studio)

    assert (output / "index.html").read_text() == (studio / "index.html").read_text()
    assert (output / "studio/index.html").read_text() == "interactive studio"
    assert (output / "about/index.html").read_text() == "artwork homepage"
    assert (output / "open-source/index.html").read_text() == "license disclosure"
    assert (output / "studio-assets/app.js").read_text() == "studio code"
    assert (output / "attachments/keep.png").read_bytes() == b"existing image"
