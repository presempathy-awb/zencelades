"""Serve the built local preview and keep all archival downloads as attachments."""

from __future__ import annotations

import argparse
import socket
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit

from scripts.assets import ROOT


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        if unquote(urlsplit(self.path).path).startswith("/downloads/"):
            self.send_header("Content-Disposition", "attachment")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
        )
        super().end_headers()


class PreviewServer(ThreadingHTTPServer):
    # The stdlib's five-connection backlog drops concurrent shader downloads.
    request_queue_size = socket.SOMAXCONN


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=0)
    args = parser.parse_args()
    server = PreviewServer(
        ("127.0.0.1", args.port),
        partial(PreviewHandler, directory=str(ROOT / "site/dist")),
    )
    print(f"Preview: http://127.0.0.1:{server.server_port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
