import pytest

from scripts.homepage_loop import insert_loop


def test_homepage_refresh_preserves_content_and_replaces_only_its_own_block():
    original = '<html><body class="home"><main>Existing work</main></body></html>'
    first = insert_loop(original, '<video src="one.mp4"></video>')
    second = insert_loop(first, '<video src="two.mp4"></video>')
    assert "<main>Existing work</main>" in second
    assert "one.mp4" not in second
    assert second.count("two.mp4") == 1
    assert second.count('class="home"') == 1


@pytest.mark.parametrize(
    "page", ["no document", "<body><body>", "<body><!-- showtime-home:start -->"]
)
def test_ambiguous_homepage_is_refused(page):
    with pytest.raises(ValueError):
        insert_loop(page, "new film")
