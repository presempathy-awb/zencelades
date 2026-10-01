from scripts.build_site import publish_public_surfaces


def test_home_and_studio_keep_distinct_entrypoints_and_existing_files(tmp_path):
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

    assert (output / "index.html").read_text() == "artwork homepage"
    assert (output / "studio/index.html").read_text() == "interactive studio"
    assert (output / "about/index.html").read_text() == "artwork homepage"
    assert (output / "open-source/index.html").read_text() == "license disclosure"
    assert (output / "studio-assets/app.js").read_text() == "studio code"
    assert (output / "attachments/keep.png").read_bytes() == b"existing image"
