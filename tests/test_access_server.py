"""Admission never confers permission to manage the address list."""

import json
from datetime import UTC, datetime

import pytest

from scripts.access_server import Access, PeerCache, Store, public_ip, verified_peers


def peer(address="8.8.8.8:41641", **changes):
    return dict(
        Online=True,
        Active=True,
        InNetworkMap=True,
        Expired=False,
        CurAddr=address,
        HostName="laptop",
        LastHandshake="2026-10-01T01:00:00Z",
        **changes,
    )


def test_only_fresh_direct_authenticated_public_peers_are_admitted():
    now = datetime(2026, 10, 1, 1, 1, tzinfo=UTC)
    good = peer()
    peers = {"good": good}
    for key, value in [
        ("Online", False),
        ("InNetworkMap", False),
        ("Expired", True),
        ("CurAddr", ""),
        ("CurAddr", "192.168.1.2:41641"),
        ("LastHandshake", "2026-10-01T00:00:00Z"),
        ("LastHandshake", "2026-10-01T02:00:00Z"),
    ]:
        peers[str(len(peers))] = {**good, key: value}
    assert verified_peers({"BackendState": "Running", "Peer": peers}, now) == [
        {"ip": "8.8.8.8", "device": "laptop"}
    ]
    assert verified_peers({"BackendState": "Stopped", "Peer": peers}, now) == []


@pytest.mark.parametrize(
    "value",
    [
        "0.0.0.0/0",
        "8.8.8.0/24",
        "127.0.0.1",
        "100.64.0.2",
        "224.0.0.1",
        "bad",
        "fe80::1%eth0",
    ],
)
def test_manual_addresses_are_exact_public_ips(value):
    with pytest.raises(ValueError):
        public_ip(value)


def test_cache_expires_and_failures_or_peer_removal_revoke_access():
    clock = [0.0]
    cache = PeerCache(clock=lambda: clock[0])
    cache.replace([{"ip": "8.8.8.8", "device": "laptop"}])
    assert cache.addresses() == [{"ip": "8.8.8.8", "device": "laptop"}]
    clock[0] = 46
    assert cache.addresses() == []
    cache.replace([{"ip": "8.8.8.8", "device": "laptop"}])
    cache.replace([])
    assert cache.addresses() == []


def make_access(tmp_path, username=None):
    def auth(headers, uri):
        if username is None:
            return (
                302,
                [
                    ("Location", "https://auth.example/login"),
                    ("Set-Cookie", "flow=test"),
                ],
                b"login",
            )
        return 200, [("X-authentik-username", username)], b""

    return Access(Store(tmp_path / "ips.sqlite"), PeerCache(), auth)


def request(app, method="GET", path="/access/api/ips", payload=None, **headers):
    status, _response_headers, body = app.handle(
        method,
        path,
        {
            "host": app.host,
            "origin": "https://" + app.host,
            "content-type": "application/json",
            **headers,
        },
        json.dumps(payload).encode() if payload is not None else b"",
    )
    return status, json.loads(body) if body else None


@pytest.mark.parametrize("username", [None, "jill", "daniel", "AWB", "awb,akadmin"])
def test_nonadmins_cannot_read_or_change_list_even_with_identity_headers(
    tmp_path, username
):
    app = make_access(tmp_path, username)
    app.store.add("8.8.8.8", "Home", "awb")
    for method in ["GET", "POST", "DELETE"]:
        status, _ = request(
            app,
            method,
            payload={"ip": "1.1.1.1", "label": "test"},
            **{"x-authentik-username": "awb"},
        )
        assert status == 403
    assert request(app, path="/access/api/session")[1] == {"data": {"canManage": False}}
    assert len(app.store.entries()) == 1


@pytest.mark.parametrize("username", ["awb", "akadmin"])
def test_admin_crud_persists_and_removal_revokes_manual_admission(tmp_path, username):
    app = make_access(tmp_path, username)
    assert request(app, "POST", payload={"ip": "1.1.1.1", "label": "Home"})[0] == 201
    assert Store(tmp_path / "ips.sqlite").entries()[0]["created_by"] == username
    assert app.admitted("1.1.1.1")
    assert request(app)[1]["data"]["manual"][0]["label"] == "Home"
    assert request(app, "DELETE", payload={"ip": "1.1.1.1"})[0] == 200
    assert not app.admitted("1.1.1.1")


def test_csrf_and_malformed_input_are_refused_without_changes(tmp_path):
    app = make_access(tmp_path, "awb")
    for headers in [
        {"origin": "https://evil.example"},
        {"origin": ""},
        {"content-type": "text/plain"},
    ]:
        assert (
            request(app, "POST", payload={"ip": "1.1.1.1", "label": "Home"}, **headers)[
                0
            ]
            == 403
        )
    for payload in [
        {"ip": "0.0.0.0/0"},
        {"ip": "1.1.1.1", "label": "x" * 81},
        [],
        {"ip": "1.1.1.1", "role": "admin"},
    ]:
        assert request(app, "POST", payload=payload)[0] == 400
    assert app.store.entries() == []


def test_auth_fallback_preserves_redirect_and_does_not_accept_spoofed_chain(tmp_path):
    app = make_access(tmp_path)
    app.peers.replace([{"ip": "8.8.8.8", "device": "laptop"}])
    headers = {
        "x-forwarded-host": app.host,
        "x-forwarded-proto": "https",
        "x-forwarded-uri": "/naming/index.html",
    }
    status, _, _ = app.handle(
        "GET", "/auth", {**headers, "x-forwarded-for": "8.8.8.8"}, b""
    )
    assert status == 204
    for ip in ["1.1.1.1", "8.8.8.8, 1.1.1.1", "", "8.8.8.8:42"]:
        status, response_headers, body = app.handle(
            "GET", "/auth", {**headers, "x-forwarded-for": ip}, b""
        )
        assert status == 302
        assert ("Set-Cookie", "flow=test") in response_headers
        assert body == b"login"
    # Forced login remains reachable even from an admitted address.
    assert (
        app.handle(
            "GET",
            "/auth",
            {
                **headers,
                "x-forwarded-for": "8.8.8.8",
                "x-forwarded-uri": "/access/login",
            },
            b"",
        )[0]
        == 302
    )


def test_live_http_boundary_revalidates_cookie_and_refuses_duplicate_headers(tmp_path):
    import http.client
    import threading
    from http.server import ThreadingHTTPServer

    from scripts.access_server import Handler

    app = make_access(tmp_path)
    seen = []

    def auth(headers, uri):
        seen.append(headers.get("cookie"))
        username = "awb" if headers.get("cookie") == "session=valid" else "jill"
        return 200, [("X-authentik-username", username)], b""

    app.auth = auth
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    server.access = app
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    conn = http.client.HTTPConnection(*server.server_address, timeout=2)
    try:
        for cookie, expected in [("session=valid", 201), ("session=revoked", 403)]:
            conn.request(
                "POST",
                "/access/api/ips",
                json.dumps({"ip": "1.1.1.1", "label": "Home"}),
                {
                    "Host": app.host,
                    "Origin": "https://" + app.host,
                    "Content-Type": "application/json",
                    "Cookie": cookie,
                    "X-authentik-username": "awb",
                },
            )
            response = conn.getresponse()
            assert response.status == expected
            response.read()
        conn.putrequest("GET", "/access/api/ips", skip_host=True)
        conn.putheader("Host", app.host)
        conn.putheader("Cookie", "session=valid")
        conn.putheader("Cookie", "session=revoked")
        conn.endheaders()
        response = conn.getresponse()
        assert response.status == 400
        response.read()
        assert seen == ["session=valid", "session=revoked"]
    finally:
        conn.close()
        server.shutdown()
        worker.join(timeout=2)
        server.server_close()


def test_outpost_only_receives_cookie_and_fixed_site_context(monkeypatch):
    from scripts.access_server import SITE_HOST, outpost

    sent = {}

    class Connection:
        def __init__(self, *args, **kwargs):
            pass

        def request(self, method, path, headers):
            sent.update(headers)

        def getresponse(self):
            return self

        status = 200

        def read(self, limit):
            return b""

        def getheaders(self):
            return [("X-authentik-username", "awb"), ("Connection", "keep-alive")]

        def close(self):
            pass

    monkeypatch.setattr("scripts.access_server.http.client.HTTPConnection", Connection)
    result = outpost(
        {
            "cookie": "session=test",
            "x-authentik-username": "akadmin",
            "host": "evil.example",
            "authorization": "Bearer forged",
        },
        "/",
    )
    assert sent == {
        "Host": SITE_HOST,
        "X-Forwarded-Host": SITE_HOST,
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Uri": "/",
        "X-Forwarded-Method": "GET",
        "Cookie": "session=test",
    }
    assert result == (200, [("X-authentik-username", "awb")], b"")
