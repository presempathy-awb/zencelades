"""Exercise real Caddy host/path isolation on an ephemeral loopback fixture."""

import argparse
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

from scripts.private_studio import retired_config


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fragment", type=Path, required=True)
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix="zenc-private-proof-") as temporary:
        root = Path(temporary)
        public, private = root / "public", root / "private"
        for path, content in {
            public / "index.html": "PUBLIC ARTWORK",
            public / "documents/audio/test.md": "PRIVATE PUBLIC-ROOT DECOY",
            public / "private-assets/app.js": "PRIVATE PUBLIC-ROOT ASSET DECOY",
            public / "studio-assets/index-old.js": "RETIRED PRIVATE BUNDLE",
            private / "index.html": "PRIVATE STUDIO",
            private / "private-assets/app.js": "PRIVATE ASSET",
            private / "documents/audio/test.md": "PRIVATE DOWNLOAD",
        }.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        fragment = args.fragment.read_text().replace(
            "/srv/thatsnozorb/current/site/private-studio", str(private)
        )
        (root / "private-studio.caddy").write_text(fragment)
        (root / "private-studio-retired.caddy").write_text(
            retired_config(["site/dist/studio-assets/index-old.js"])
        )
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            port = listener.getsockname()[1]
        config = root / "Caddyfile"
        config.write_text(
            f"{{\n admin off\n auto_https off\n}}\n:{port} {{\n"
            f" bind 127.0.0.1\n import private-studio.caddy\n root * {public}\n file_server\n}}\n"
        )
        subprocess.run(
            ["caddy", "validate", "--config", str(config), "--adapter", "caddyfile"],
            check=True,
        )
        with (root / "server.log").open("w+") as log:
            process = subprocess.Popen(
                ["caddy", "run", "--config", str(config), "--adapter", "caddyfile"],
                stdout=log,
                stderr=log,
            )
            try:
                deadline = time.monotonic() + 10
                while True:
                    try:
                        with socket.create_connection(("127.0.0.1", port), timeout=0.2):
                            break
                    except OSError:
                        if process.poll() is not None or time.monotonic() >= deadline:
                            log.seek(0)
                            raise RuntimeError(log.read())
                        # Readiness polling only; no fixed timing assumption.
                        time.sleep(0.05)

                class NoRedirect(urllib.request.HTTPRedirectHandler):
                    def redirect_request(self, req, fp, code, msg, headers, newurl):
                        return None

                opener = urllib.request.build_opener(NoRedirect())
                cases = [
                    ("zenceladus.com", "/", 200, "PUBLIC ARTWORK"),
                    ("zenceladus.com", "/studio/", 302, ""),
                    ("zenceladus.com", "/audio/", 302, ""),
                    ("zenceladus.com", "/documents/audio/test.md", 404, ""),
                    ("zenceladus.com", "/documents/%61udio/test.md", 404, ""),
                    ("zenceladus.com", "/private-assets/app.js", 404, ""),
                    ("zenceladus.com", "/studio-assets/index-old.js", 404, ""),
                    ("127.0.0.1", "/documents/audio/test.md", 404, ""),
                    ("studio.zenceladus.com", "/", 200, "PRIVATE STUDIO"),
                    ("studio.zenceladus.com", "/studio-assets/index-old.js", 404, ""),
                    (
                        "studio.zenceladus.com",
                        "/private-assets/app.js",
                        200,
                        "PRIVATE ASSET",
                    ),
                    (
                        "studio.zenceladus.com",
                        "/documents/audio/test.md",
                        200,
                        "PRIVATE DOWNLOAD",
                    ),
                ]
                for host, path, expected, body in cases:
                    request = urllib.request.Request(
                        f"http://127.0.0.1:{port}{path}",
                        headers={
                            "Host": host,
                            "X-Forwarded-Host": "studio.zenceladus.com",
                            "X-authentik-username": "forged-user",
                        },
                    )
                    try:
                        response = opener.open(request, timeout=3)
                    except urllib.error.HTTPError as error:
                        response = error
                    with response:
                        data = response.read().decode()
                        assert response.status == expected, (
                            host,
                            path,
                            response.status,
                        )
                        if body:
                            assert data == body, (host, path, data)
                        else:
                            assert "PRIVATE" not in data, (host, path)
                        if expected == 302:
                            assert (
                                response.headers["Location"]
                                == "https://studio.zenceladus.com/"
                            )
                        if host == "studio.zenceladus.com":
                            assert (
                                response.headers["Cache-Control"] == "private, no-store"
                            )
                print(
                    f"PASS: {len(cases)} real-Caddy host/path cases with generated deny rules and distinct root bodies. Edge authentication is not exercised."
                )
            finally:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=5)


if __name__ == "__main__":
    main()
