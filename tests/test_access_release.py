"""Selective publication preserves unrelated live site and route changes."""

import pytest

from scripts.deploy_access import patch_caddy, patch_home


def test_overlay_adds_only_its_controls_and_keeps_other_site_content():
    original = '<html><head><script src="/studio-assets/current.js"></script></head><body>Existing studio</body></html>'
    updated = patch_home(original)
    assert updated.replace('<script src="/access.js" defer></script>\n', "") == original
    assert patch_home(updated) == updated
    caddy = ":18131 {\n    reverse_proxy /naming/api/workbench 127.0.0.1:18132\n    file_server\n}\n"
    patched = patch_caddy(caddy)
    assert "reverse_proxy /naming/api/workbench 127.0.0.1:18132" in patched
    assert patched.count("reverse_proxy /access/api/* 127.0.0.1:18133") == 1
    assert patch_caddy(patched) == patched


def test_overlay_refuses_unknown_site_and_conflicting_access_route():
    with pytest.raises(ValueError):
        patch_home("Unexpected document")
    with pytest.raises(ValueError):
        patch_caddy(
            ":18131 {\n reverse_proxy /access/api/* 127.0.0.1:19999\n file_server\n}"
        )
