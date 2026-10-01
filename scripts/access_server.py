"""Loopback-only shared-IP admission and Authentik-authorized IP management."""

from __future__ import annotations

import argparse
import http.client
import ipaddress
import json
import logging
import re
import sqlite3
import subprocess
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from datetime import UTC, datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

SITE_HOST = "thatsnozorb.muchadoaboutoneside.com"
ADMINS = frozenset({"awb", "akadmin"})
MAX_BODY = 2048
LOGGER = logging.getLogger(__name__)


def public_ip(value: str) -> str:
    """Accept exact globally routable unicast addresses, never networks or zones."""
    if not isinstance(value, str) or "%" in value:
        raise ValueError("Enter one public IPv4 or IPv6 address")
    address = ipaddress.ip_address(value)
    if not address.is_global or address.is_multicast:
        raise ValueError("Enter one public IPv4 or IPv6 address")
    return str(address)


def verified_peers(status: dict, now: datetime) -> list[dict[str, str]]:
    """Use a direct authenticated endpoint, never advertised Addrs or relay IPs."""
    if status.get("BackendState") != "Running":
        return []
    result = []
    for peer in status.get("Peer", {}).values():
        if not all(peer.get(k) for k in ("Online", "InNetworkMap")) or peer.get(
            "Expired"
        ):
            continue
        try:
            handshake = datetime.fromisoformat(peer["LastHandshake"])
            age = (now - handshake).total_seconds()
            endpoint = urlsplit("//" + peer["CurAddr"])
            address = public_ip(endpoint.hostname or "")
            if endpoint.port is None or not 0 <= age <= 180:
                continue
        except (KeyError, TypeError, ValueError):
            continue
        result.append(
            {"ip": address, "device": str(peer.get("HostName", "Tailnet device"))[:100]}
        )
    return sorted(result, key=lambda item: (item["ip"], item["device"]))


class PeerCache:
    def __init__(self, clock=time.monotonic):
        self.clock = clock
        self.lock = threading.Lock()
        self.expires = 0.0
        self.records = []

    def replace(self, records: list[dict[str, str]]) -> None:
        with self.lock:
            self.records = records
            self.expires = self.clock() + 45

    def addresses(self) -> list[dict[str, str]]:
        with self.lock:
            return list(self.records) if self.clock() < self.expires else []


def tailnet_status() -> dict:
    result = subprocess.run(
        ["tailscale", "status", "--json"], capture_output=True, timeout=5, check=True
    )
    return json.loads(result.stdout)


def ping_peer(address: str) -> tuple[str, str | None]:
    # An authenticated direct reply refreshes tailscaled's endpoint/handshake state.
    ipaddress.ip_address(address)
    result = subprocess.run(
        ["tailscale", "ping", "--c", "1", "--timeout", "2s", address],
        capture_output=True,
        text=True,
        timeout=4,
        check=False,
    )
    match = re.search(r"^pong from .+ via (\S+) in ", result.stdout, re.MULTILINE)
    endpoint = match.group(1) if result.returncode == 0 and match else None
    return address, endpoint


def refresh_peers(cache: PeerCache, stop: threading.Event) -> None:
    while not stop.is_set():
        try:
            status = tailnet_status()
            addresses = [
                peer["TailscaleIPs"][0]
                for peer in status.get("Peer", {}).values()
                if peer.get("Online")
                and peer.get("InNetworkMap")
                and not peer.get("Expired")
                and peer.get("TailscaleIPs")
            ]
            if len(addresses) > 32:
                raise ValueError("Peer count exceeds refresh bound")
            with ThreadPoolExecutor(max_workers=4) as pool:
                replies = dict(pool.map(ping_peer, addresses))
            fresh = tailnet_status()
            fresh["Peer"] = {
                key: peer
                for key, peer in fresh.get("Peer", {}).items()
                if peer.get("TailscaleIPs")
                and peer.get("CurAddr")
                and replies.get(peer["TailscaleIPs"][0]) == peer["CurAddr"]
            }
            cache.replace(verified_peers(fresh, datetime.now(UTC)))
        except (OSError, ValueError, KeyError, TypeError, subprocess.SubprocessError):
            cache.replace([])
            LOGGER.warning("Tailnet refresh failed; automatic IP admission revoked")
        stop.wait(20)


class Store:
    def __init__(self, path: Path):
        self.path = path
        with self.connect() as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS addresses (
                    ip TEXT PRIMARY KEY, label TEXT NOT NULL,
                    created_by TEXT NOT NULL, created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS audit (
                    id INTEGER PRIMARY KEY, action TEXT NOT NULL, ip TEXT NOT NULL,
                    actor TEXT NOT NULL, created_at TEXT NOT NULL
                );
            """)
        self.path.chmod(0o600)

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=2)
        db.row_factory = sqlite3.Row
        try:
            with db:
                yield db
        finally:
            db.close()

    def entries(self) -> list[dict]:
        with self.connect() as db:
            return [
                dict(row)
                for row in db.execute("SELECT * FROM addresses ORDER BY created_at, ip")
            ]

    def contains(self, ip: str) -> bool:
        with self.connect() as db:
            return (
                db.execute("SELECT 1 FROM addresses WHERE ip = ?", (ip,)).fetchone()
                is not None
            )

    def add(self, ip: str, label: str, actor: str) -> None:
        ip = public_ip(ip)
        now = datetime.now(UTC).isoformat()
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            if db.execute("SELECT count(*) FROM addresses").fetchone()[0] >= 100:
                raise ValueError("Remove an address before adding another (limit 100)")
            db.execute(
                "INSERT INTO addresses VALUES (?, ?, ?, ?)", (ip, label, actor, now)
            )
            db.execute(
                "INSERT INTO audit(action, ip, actor, created_at) VALUES ('add', ?, ?, ?)",
                (ip, actor, now),
            )

    def remove(self, ip: str, actor: str) -> None:
        with self.connect() as db:
            if db.execute("DELETE FROM addresses WHERE ip = ?", (ip,)).rowcount:
                db.execute(
                    "INSERT INTO audit(action, ip, actor, created_at) VALUES ('remove', ?, ?, ?)",
                    (ip, actor, datetime.now(UTC).isoformat()),
                )


def outpost(
    headers: dict[str, str], uri: str
) -> tuple[int, list[tuple[str, str]], bytes]:
    """Validate the browser cookie with the existing outpost; never forward identity input."""
    forwarded = {
        "Host": SITE_HOST,
        "X-Forwarded-Host": SITE_HOST,
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Uri": uri,
        "X-Forwarded-Method": "GET",
        "Cookie": headers.get("cookie", ""),
    }
    connection = http.client.HTTPConnection("127.0.0.1", 19001, timeout=5)
    try:
        connection.request(
            "GET", "/outpost.goauthentik.io/auth/traefik", headers=forwarded
        )
        response = connection.getresponse()
        body = response.read(262145)
        if len(body) > 262144:
            raise ValueError("Oversized outpost response")
        # Preserve auth redirects/cookies and verified identity, not hop-by-hop framing.
        safe = [
            (key, value)
            for key, value in response.getheaders()
            if key.lower()
            in {"location", "set-cookie", "content-type", "www-authenticate"}
            or key.lower().startswith("x-authentik-")
        ]
        return response.status, safe, body
    finally:
        connection.close()


def json_response(status: int, value: dict) -> tuple[int, list[tuple[str, str]], bytes]:
    return (
        status,
        [("Content-Type", "application/json"), ("Cache-Control", "no-store")],
        json.dumps(value).encode(),
    )


class Access:
    host = SITE_HOST

    def __init__(self, store: Store, peers: PeerCache, auth=outpost):
        self.store, self.peers, self.auth = store, peers, auth

    def admitted(self, value: str) -> bool:
        try:
            address = public_ip(value)
        except ValueError:
            return False
        return any(
            item["ip"] == address for item in self.peers.addresses()
        ) or self.store.contains(address)

    def handle(
        self, method: str, path: str, headers: dict[str, str], body: bytes
    ) -> tuple[int, list[tuple[str, str]], bytes]:
        if method == "GET" and path == "/health":
            return json_response(200, {"data": {"ready": True}})
        if path == "/auth" and method == "GET":
            if (
                headers.get("x-forwarded-host") != self.host
                or headers.get("x-forwarded-proto") != "https"
            ):
                return json_response(
                    400, {"error": {"message": "Invalid forwarded request"}}
                )
            uri = headers.get("x-forwarded-uri", "/")
            if not uri.startswith("/") or uri.startswith("//"):
                return json_response(
                    400, {"error": {"message": "Invalid request path"}}
                )
            if urlsplit(uri).path != "/access/login" and self.admitted(
                headers.get("x-forwarded-for", "")
            ):
                return 204, [], b""
            return self.auth(headers, uri)
        if headers.get("host") != self.host:
            return json_response(400, {"error": {"message": "Invalid host"}})
        if path == "/access/login" and method == "GET":
            status, auth_headers, payload = self.auth(headers, "/access/login")
            if 200 <= status < 300:
                return 303, [("Location", "/"), ("Cache-Control", "no-store")], b""
            return status, auth_headers, payload
        if path not in {"/access/api/session", "/access/api/ips"}:
            return json_response(404, {"error": {"message": "Not found"}})
        status, auth_headers, _ = self.auth(headers, "/")
        identities = [
            value
            for key, value in auth_headers
            if key.lower() == "x-authentik-username"
        ]
        actor = identities[0] if len(identities) == 1 else None
        allowed = 200 <= status < 300 and actor in ADMINS
        if path == "/access/api/session" and method == "GET":
            return json_response(200, {"data": {"canManage": allowed}})
        if not allowed:
            return json_response(
                403,
                {"error": {"message": "IP management requires awb or akadmin sign-in"}},
            )
        if path == "/access/api/ips" and method == "GET":
            return json_response(
                200,
                {
                    "data": {
                        "manual": self.store.entries(),
                        "automatic": self.peers.addresses(),
                    }
                },
            )
        if path != "/access/api/ips" or method not in {"POST", "DELETE"}:
            return json_response(405, {"error": {"message": "Method not allowed"}})
        if (
            headers.get("origin") != "https://" + self.host
            or headers.get("content-type", "").split(";")[0] != "application/json"
        ):
            return json_response(
                403, {"error": {"message": "Same-origin JSON request required"}}
            )
        try:
            if len(body) > MAX_BODY:
                raise ValueError("Request too large")
            data = json.loads(body)
            keys = {"ip", "label"} if method == "POST" else {"ip"}
            if not isinstance(data, dict) or set(data) - keys:
                raise ValueError("Invalid address fields")
            ip = public_ip(data.get("ip"))
            if method == "POST":
                label = data.get("label", "")
                if (
                    not isinstance(label, str)
                    or not 1 <= len(label.strip()) <= 80
                    or any(ord(c) < 32 for c in label)
                ):
                    raise ValueError("Enter a label of 1 to 80 characters")
                self.store.add(ip, label.strip(), actor)
            else:
                self.store.remove(ip, actor)
        except sqlite3.IntegrityError:
            return json_response(
                409, {"error": {"message": "That address is already listed"}}
            )
        except (ValueError, TypeError):
            return json_response(
                400,
                {
                    "error": {
                        "message": "Enter one public IP and a label of 1 to 80 characters"
                    }
                },
            )
        return json_response(201 if method == "POST" else 200, {"data": {"ip": ip}})


class Handler(BaseHTTPRequestHandler):
    server_version = "NozorbAccess"

    def setup(self) -> None:
        super().setup()
        self.connection.settimeout(10)

    def log_message(self, *_args) -> None:
        # Request paths/cookies may contain authorization codes; never log them.
        pass

    def do_GET(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 <= length <= MAX_BODY or self.headers.get("Transfer-Encoding"):
                response = json_response(
                    413, {"error": {"message": "Invalid request size"}}
                )
            elif any(len(self.headers.get_all(key, [])) != 1 for key in self.headers):
                response = json_response(
                    400, {"error": {"message": "Duplicate headers refused"}}
                )
            else:
                headers = {key.lower(): value for key, value in self.headers.items()}
                response = self.server.access.handle(
                    self.command, self.path, headers, self.rfile.read(length)
                )
        except (OSError, ValueError, http.client.HTTPException, sqlite3.Error):
            LOGGER.error("Access dependency unavailable; request refused")
            response = json_response(
                503, {"error": {"message": "Access service temporarily unavailable"}}
            )
        status, headers, body = response
        self.send_response(status)
        for key, value in headers:
            self.send_header(key, value)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    do_POST = do_GET
    do_DELETE = do_GET


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--port", type=int, default=18133)
    args = parser.parse_args()
    peers = PeerCache()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    server.access = Access(Store(args.db), peers)
    stop = threading.Event()
    threading.Thread(target=refresh_peers, args=(peers, stop), daemon=True).start()
    try:
        server.serve_forever()
    finally:
        stop.set()
        server.server_close()


if __name__ == "__main__":
    main()
