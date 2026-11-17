"""Loopback integration checks; run with unittest while pytest is paused."""

import hashlib
import io
import json
import tempfile
import threading
import unittest
from argparse import Namespace
from contextlib import redirect_stdout
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

from scripts import research_upload


class ResearchUploadIntegration(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        (self.root / "assets").mkdir()
        (self.root / "source/research").mkdir(parents=True)
        self.payload = b"%PDF-1.7 synthetic preservation fixture\n"
        (self.root / "source/research/sample.pdf").write_bytes(self.payload)
        self.key = "imports/research/fixture/sample.pdf"
        self.entry = {
            "path": "source/research/sample.pdf",
            "lakefs_path": self.key,
            "bytes": len(self.payload),
            "content_sha256": hashlib.sha256(self.payload).hexdigest(),
            "source_id": "fixture",
        }
        self.plan = {
            "repository": "thatsnozorb-assets",
            "prefix": "imports/research/",
            "files": [self.entry],
            "file_count": 1,
            "total_bytes": len(self.payload),
        }
        self.write_plan()
        self.mode = "ok"
        self.calls = []
        self.objects = {}
        case = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_):
                pass

            def answer(self, status, value):
                data = value if isinstance(value, bytes) else json.dumps(value).encode()
                self.send_response(status)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            def do_GET(self):
                case.calls.append(("GET", self.path))
                parsed = urlsplit(self.path)
                query = parse_qs(parsed.query)
                if case.mode == "revoked":
                    self.answer(403, {})
                elif parsed.path == "/redirect-destination":
                    self.answer(200, b"unexpected redirect")
                elif parsed.path == "/api/v1/repositories/thatsnozorb-assets":
                    # The deployed prefix-restricted publisher denies repository metadata.
                    self.answer(200 if case.mode == "metadata-readable" else 403, {})
                elif parsed.path.endswith("/objects/ls"):
                    rows = [{"path": case.key, "size_bytes": len(case.payload)}]
                    if case.mode == "size":
                        rows[0]["size_bytes"] += 1
                    if case.mode == "extra":
                        rows.append(
                            {"path": "imports/research/unexpected", "size_bytes": 0}
                        )
                    self.answer(
                        200,
                        {
                            "results": rows,
                            "pagination": {"has_more": case.mode == "pagination"},
                        },
                    )
                elif "/refs/" + "1" * 64 + "/objects" in parsed.path:
                    content = case.objects[query["path"][0]]
                    self.answer(
                        200, b"x" * len(content) if case.mode == "corrupt" else content
                    )
                else:
                    self.answer(200 if case.mode == "missing-refusal" else 403, {})

            def do_POST(self):
                case.calls.append(("POST", self.path))
                data = self.rfile.read(int(self.headers.get("Content-Length", 0)))
                parsed = urlsplit(self.path)
                if case.mode == "revoked":
                    self.answer(403, {})
                elif parsed.path.endswith("/branches"):
                    if case.mode == "redirect":
                        self.send_response(302)
                        self.send_header("Location", "/redirect-destination")
                        self.end_headers()
                    else:
                        self.answer(201, {})
                elif parsed.path.endswith("/objects"):
                    case.objects[parse_qs(parsed.query)["path"][0]] = data
                    self.answer(201, {})
                elif parsed.path.endswith("/commits"):
                    self.answer(201, {"id": "1" * 64})
                else:
                    self.answer(404, {})

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.stop_server)
        self.args = Namespace(
            endpoint=f"http://127.0.0.1:{self.server.server_port}",
            branch="ingest-fixture",
            apply=True,
        )
        self.root_patch = patch.object(research_upload, "ROOT", self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)
        self.env_patch = patch.dict(
            research_upload.os.environ,
            {research_upload.TOKEN_ENV: "synthetic-fixture-token"},
        )
        self.env_patch.start()
        self.addCleanup(self.env_patch.stop)

    def stop_server(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()

    def write_plan(self):
        (self.root / "assets/research-upload-plan.json").write_text(
            json.dumps(self.plan)
        )

    def execute(self):
        with redirect_stdout(io.StringIO()):
            research_upload.run(self.args)

    def test_exact_preservation_and_retry_refusal(self):
        self.execute()
        self.assertEqual(self.objects, {self.key: self.payload})
        receipt_path = self.root / "assets/research-upload-receipt.json"
        receipt = json.loads(receipt_path.read_text())
        self.assertTrue(receipt["readback_complete"])
        self.assertEqual(receipt["bytes_verified"], len(self.payload))
        self.assertFalse(receipt["merge"])
        calls = list(self.calls)
        with self.assertRaisesRegex(ValueError, "already exists"):
            self.execute()
        self.assertEqual(calls, self.calls)

    def test_bad_readback_and_authority_never_issue_success_receipt(self):
        for mode in (
            "corrupt",
            "size",
            "extra",
            "pagination",
            "redirect",
            "missing-refusal",
            "metadata-readable",
        ):
            with self.subTest(mode=mode):
                self.mode = mode
                self.calls.clear()
                # Only synthetic records created by this fixture are cleared.
                staging = self.root / "assets/research-upload-staging.json"
                staging.unlink(missing_ok=True)
                with self.assertRaises((RuntimeError, ValueError)):
                    self.execute()
                self.assertFalse(
                    (self.root / "assets/research-upload-receipt.json").exists()
                )
                self.assertNotIn(("GET", "/redirect-destination"), self.calls)
                if mode in {"missing-refusal", "metadata-readable"}:
                    self.assertFalse(any(method == "POST" for method, _ in self.calls))

    def test_revoked_token_leaves_no_record_and_allows_corrected_retry(self):
        self.mode = "revoked"
        with self.assertRaisesRegex(RuntimeError, "HTTP 403"):
            self.execute()
        self.assertFalse((self.root / "assets/research-upload-staging.json").exists())
        self.assertFalse((self.root / "assets/research-upload-receipt.json").exists())
        self.assertFalse(any(method == "POST" for method, _ in self.calls))
        self.mode = "ok"
        self.execute()
        self.assertEqual(self.objects, {self.key: self.payload})

    def test_local_tampering_and_wrong_destination_refuse_before_network(self):
        for kind in ("hash", "destination", "duplicate", "symlink", "root-link"):
            with self.subTest(kind=kind):
                plan = json.loads(json.dumps(self.plan))
                if kind == "hash":
                    plan["files"][0]["content_sha256"] = "0" * 64
                elif kind == "destination":
                    plan["files"][0]["lakefs_path"] = "public/sample.pdf"
                elif kind == "duplicate":
                    plan["files"] *= 2
                    plan["file_count"] = 2
                    plan["total_bytes"] *= 2
                elif kind == "symlink":
                    (self.root / "source/research/link.pdf").symlink_to(
                        self.root / "source/research/sample.pdf"
                    )
                    plan["files"][0]["path"] = "source/research/link.pdf"
                else:
                    research = self.root / "source/research"
                    research.rename(self.root / "outside-research")
                    research.symlink_to(self.root / "outside-research")
                (self.root / "assets/research-upload-plan.json").write_text(
                    json.dumps(plan)
                )
                with self.assertRaises(ValueError):
                    self.execute()
                self.assertEqual([], self.calls)

    def test_plan_needs_no_token_and_does_not_connect(self):
        self.args.apply = False
        with patch.dict(research_upload.os.environ, {}, clear=True):
            self.execute()
        self.assertEqual([], self.calls)
        self.assertFalse((self.root / "assets/research-upload-staging.json").exists())

    def test_generated_models_and_v4_have_separate_exact_receipts(self):
        for batch, folder, prefix, filename in (
            (
                "model",
                "cockpit/public/studio-models",
                "imports/models/p041/",
                "fixture.glb",
            ),
            (
                "v4",
                "deliveries/enceladus_v4_fixed15",
                "imports/v4-fixed15/",
                "fixture.txt",
            ),
        ):
            with self.subTest(batch=batch):
                source = self.root / folder / filename
                source.parent.mkdir(parents=True, exist_ok=True)
                source.write_bytes(self.payload)
                self.key = prefix + filename
                entry = dict(
                    self.entry,
                    path=str(source.relative_to(self.root)),
                    lakefs_path=self.key,
                )
                entry.pop("source_id")
                plan = dict(self.plan, prefix=prefix, files=[entry])
                (self.root / f"assets/{batch}-upload-plan.json").write_text(
                    json.dumps(plan)
                )
                with redirect_stdout(io.StringIO()):
                    research_upload.run(self.args, batch=batch)
                receipt = json.loads(
                    (self.root / f"assets/{batch}-upload-receipt.json").read_text()
                )
                self.assertTrue(receipt["readback_complete"])
                self.assertEqual(receipt["files"], [entry])
                self.assertFalse(
                    (self.root / "assets/research-upload-receipt.json").exists()
                )

    def test_batch_cannot_widen_local_or_remote_scope(self):
        for batch, path, prefix in (
            ("model", "source/research/sample.pdf", "imports/models/p041/"),
            ("model", "source/research/sample.pdf", "imports/research/"),
            (
                "model",
                "cockpit/public/studio-models/sample.pdf",
                "imports/models/p041/",
            ),
            (
                "v4",
                "deliveries/enceladus_v4_fixed15/archive.zip",
                "imports/v4-fixed15/",
            ),
            ("unknown", "source/research/sample.pdf", "imports/research/"),
        ):
            with self.subTest(batch=batch, prefix=prefix):
                source = self.root / path
                source.parent.mkdir(parents=True, exist_ok=True)
                source.write_bytes(self.payload)
                entry = dict(self.entry, path=path, lakefs_path=prefix + source.name)
                plan = dict(self.plan, prefix=prefix, files=[entry])
                (self.root / f"assets/{batch}-upload-plan.json").write_text(
                    json.dumps(plan)
                )
                with self.assertRaises(ValueError), redirect_stdout(io.StringIO()):
                    research_upload.run(self.args, batch=batch)
                self.assertEqual(self.calls, [])


if __name__ == "__main__":
    unittest.main()
