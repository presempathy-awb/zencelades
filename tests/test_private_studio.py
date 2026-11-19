"""Private-studio release boundary tests, without network or credentials."""

import importlib.util
import io
import json
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.private_studio import (
    guard_config,
    main,
    prompt_markers,
    public_payload,
    retired_config,
    source_check,
    write_private_artifacts,
)


class PrivateStudioBoundary(unittest.TestCase):
    def setUp(self):
        # These tests start main() past the source check, which StaleBuildRefusal covers.
        stub = patch("scripts.private_studio.source_check", return_value="checked")
        stub.start()
        self.addCleanup(stub.stop)

    def test_complete_publisher_refuses_replacing_an_existing_release(self):
        from scripts import deploy_site

        with (
            tempfile.TemporaryDirectory() as directory,
            patch.object(sys, "argv", ["deploy", "--host", "fixture", "--apply"]),
            patch.object(deploy_site, "ROOT", Path(directory)),
            patch.object(
                deploy_site,
                "build",
                side_effect=lambda: (Path(directory) / "build-started").touch(),
            ),
            patch.object(
                deploy_site.subprocess, "check_output", return_value=b"existing"
            ),
            patch.object(
                deploy_site.subprocess,
                "run",
                side_effect=lambda *args, **kwargs: (
                    Path(directory) / "upload-started"
                ).touch(),
            ),
        ):
            (Path(directory) / "assets").mkdir()
            with self.assertRaisesRegex(SystemExit, "Existing release"):
                deploy_site.main()
            self.assertFalse((Path(directory) / "build-started").exists())
            self.assertFalse((Path(directory) / "upload-started").exists())

    def test_marker_adapter_rejects_empty_or_malformed_output(self):
        for raw in (b"[]", b'[""]', b"[1]", b"{}"):
            with (
                self.subTest(raw=raw),
                patch(
                    "scripts.private_studio.subprocess.check_output", return_value=raw
                ),
                self.assertRaises(ValueError),
            ):
                prompt_markers()

    def test_build_rejects_linked_directories_and_unsafe_filenames(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            public, private = root / "public", root / "private"
            public.mkdir()
            private.mkdir()
            (public / "index.html").write_text("public")
            (private / "index.html").write_text("private")
            bad = public / "bad\nname.js"
            bad.write_text("bad")
            with self.assertRaises(ValueError):
                public_payload(public, [b"marker"])
            bad.unlink()
            (private / "linked").symlink_to(public, target_is_directory=True)
            with (
                patch(
                    "scripts.private_studio.prompt_markers", return_value=[b"marker"]
                ),
                self.assertRaises(ValueError),
            ):
                write_private_artifacts(public, private, root / "out", root / "deny")
            self.assertFalse((root / "out").exists())

    def test_complete_build_retires_text_suffixes_and_removes_stale_private_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            public, private, out = root / "public", root / "private", root / "out"
            for path in (public, private, out):
                path.mkdir()
            (private / "index.html").write_text("new private")
            (out / "removed.md").write_text("stale")
            (public / "old.txt").write_bytes(b"private prompt")
            with patch(
                "scripts.private_studio.prompt_markers",
                return_value=[b"private prompt"],
            ):
                write_private_artifacts(public, private, out, root / "deny")
            self.assertFalse((out / "removed.md").exists())
            self.assertIn("/old.txt", (root / "deny").read_text())

    def test_overlay_rejects_tampering_cleans_failed_copy_and_preserves_live(self):
        from scripts.private_studio import digest

        spec = importlib.util.spec_from_file_location(
            "overlay", Path(__file__).parents[1] / "deploy/private-studio-overlay.py"
        )
        overlay = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(overlay)

        def manifest(files):
            return json.dumps(
                [
                    {"path": name, "bytes": len(data), "sha256": digest(data)}
                    for name, data in files.items()
                ]
            ).encode()

        old = {
            "site/dist/index.html": b"old page",
            "site/dist/media.jpg": b"preserved art",
        }
        raw = manifest(old)
        base_id = digest(raw)
        new = {
            **old,
            "site/dist/index.html": b"new public page",
            "site/private-studio/index.html": b"private page",
        }
        new_raw = manifest(new)
        release_id = digest(new_raw)
        stream = io.BytesIO()
        with tarfile.open(fileobj=stream, mode="w:gz") as bundle:
            for name, data in {
                "release-files.json": new_raw,
                **{name: data for name, data in new.items() if old.get(name) != data},
            }.items():
                info = tarfile.TarInfo(name)
                info.size = len(data)
                bundle.addfile(info, io.BytesIO(data))
        payload = stream.getvalue()
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            base = root / "releases" / base_id
            for name, data in {**old, "release-files.json": raw}.items():
                path = base / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(data)
            (root / "current").symlink_to(base)
            (base / "unmanifested.txt").write_text("not part of this release")
            with self.assertRaisesRegex(SystemExit, "archive changed"):
                overlay.stage_release(
                    root, base_id, release_id, digest(payload), payload + b"tampered"
                )

            def partial_copy(source, destination, **kwargs):
                destination.write_text("incomplete")
                raise OSError("copy failed")

            with (
                patch.object(overlay.shutil, "copy2", side_effect=partial_copy),
                self.assertRaisesRegex(OSError, "copy failed"),
            ):
                overlay.stage_release(
                    root, base_id, release_id, digest(payload), payload
                )
            self.assertEqual(list((root / "releases").iterdir()), [base])
            target = overlay.stage_release(
                root, base_id, release_id, digest(payload), payload
            )
            self.assertEqual((root / "current").resolve(), base)
            self.assertEqual(
                (target / "site/dist/media.jpg").read_bytes(), b"preserved art"
            )
            self.assertEqual(
                (target / "site/dist/index.html").read_bytes(), b"new public page"
            )
            self.assertEqual((base / "site/dist/index.html").read_bytes(), b"old page")
            self.assertFalse((target / "unmanifested.txt").exists())
            with self.assertRaisesRegex(SystemExit, "Never overwrite"):
                overlay.stage_release(
                    root, base_id, release_id, digest(payload), payload
                )

    def test_plan_refuses_stale_public_prompt_bytes(self):
        from scripts.private_studio import public_payload

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "index.html").write_bytes(b"public artwork")
            self.assertEqual(
                public_payload(root, [b"private prompt"]),
                {"site/dist/index.html": b"public artwork"},
            )
            (root / "stale.js").write_bytes(b"const prompt = 'private prompt'")
            with self.assertRaisesRegex(ValueError, "Private prompt in public build"):
                public_payload(root, [b"private prompt"])
            (root / "stale.js").write_bytes(b"const prompt = '\\u0070rivate prompt'")
            with self.assertRaisesRegex(ValueError, "Private prompt in public build"):
                public_payload(root, [b"private prompt"])

    def test_plan_rejects_unsafe_manifest_before_reading_any_assets(self):
        from scripts.private_studio import digest

        for name in [
            "site/dist/../../secret.json",
            "/secret.json",
            "site/dist/a\\b.js",
            "site//dist/a.js",
            "site/dist/./a.js",
        ]:
            raw = json.dumps(
                [{"path": name, "bytes": 0, "sha256": digest(b"")}]
            ).encode()
            base = f"/srv/thatsnozorb/releases/{digest(raw)}".encode()
            with (
                self.subTest(name=name),
                patch.object(sys, "argv", ["release", "--host", "fixture"]),
                patch(
                    "scripts.private_studio.subprocess.check_output",
                    side_effect=[base, raw],
                ) as remote,
            ):
                with self.assertRaisesRegex(ValueError, "Unsafe manifest path"):
                    main()
                self.assertEqual(remote.call_count, 2)

    def test_plan_rejects_ssh_option_as_host(self):
        with (
            patch.object(sys, "argv", ["release", "--host=-oProxyCommand=bad"]),
            patch("scripts.private_studio.subprocess.check_output") as remote,
        ):
            with self.assertRaisesRegex(ValueError, "hostname or SSH alias"):
                main()
            remote.assert_not_called()

    def test_later_releases_keep_previously_retired_prompt_urls_blocked(self):
        previous = retired_config(["site/dist/studio-assets/index-first.js"])
        updated = retired_config(["site/dist/studio-assets/index-second.js"], previous)
        self.assertIn("/studio-assets/index-first.js*", updated)
        self.assertIn("/studio-assets/index-second.js*", updated)
        with self.assertRaises(ValueError):
            retired_config([], previous + "file_server\n")

    def test_complete_build_places_private_files_outside_public_root(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            public, private = root / "public", root / "private"
            public.mkdir()
            private.mkdir()
            (public / "old.js").write_bytes(b"private prompt")
            (private / "index.html").write_bytes(b"private prompt")
            with patch(
                "scripts.private_studio.prompt_markers",
                return_value=[b"private prompt"],
            ):
                write_private_artifacts(
                    public, private, root / "output-private", root / "deny.caddy"
                )
            self.assertEqual(
                (root / "output-private/index.html").read_bytes(), b"private prompt"
            )
            self.assertFalse((public / "index.html").exists())
            self.assertIn("/old.js*", (root / "deny.caddy").read_text())

    def test_preserves_live_config_and_installs_guard_once(self):
        original = ":18131 {\n    bind 127.0.0.1\n    root * /live/site/dist\n    file_server\n}\n"
        updated = guard_config(original)
        self.assertIn("root * /live/site/dist", updated)
        self.assertEqual(guard_config(updated), updated)
        self.assertIn("import private-studio.caddy", updated)
        with self.assertRaises(ValueError):
            guard_config(":443 { file_server }")

    def test_retired_paths_cannot_add_caddy_directives(self):
        rendered = retired_config(["site/dist/studio-assets/index-old.js"])
        self.assertIn("path /studio-assets/index-old.js*", rendered)
        self.assertIn("respond @retiredPrivatePrompts 404", rendered)
        for bad in [
            "site/dist/../escape",
            "site/dist/a\nfile_server",
            'site/dist/a"b.js',
        ]:
            with self.assertRaises(ValueError):
                retired_config([bad])
        self.assertEqual(retired_config([]), "# No retired private prompt bundles.\n")


class StaleBuildRefusal(unittest.TestCase):
    """A release builds from the folder it runs in, so that folder must contain the forge's main."""

    def git(self, root, *args):
        return subprocess.run(
            ["git", "-C", str(root), *args], check=True, capture_output=True, text=True
        ).stdout.strip()

    def commit(self, root, name):
        (root / name).write_text(name)
        self.git(root, "add", name)
        self.git(
            root, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", name
        )
        return self.git(root, "rev-parse", "HEAD")

    def checkout_and_forge(self, directory):
        forge, root = Path(directory) / "forge.git", Path(directory) / "work"
        subprocess.run(
            ["git", "init", "-q", "--bare", "-b", "main", str(forge)], check=True
        )
        subprocess.run(["git", "init", "-q", "-b", "main", str(root)], check=True)
        self.git(root, "remote", "add", "origin", str(forge))
        return forge, root

    def test_a_folder_holding_the_forge_main_passes_and_names_it(self):
        with tempfile.TemporaryDirectory() as directory:
            _, root = self.checkout_and_forge(directory)
            main_sha = self.commit(root, "a")
            self.git(root, "push", "-q", "origin", "main")
            self.commit(root, "local-ahead")
            self.assertEqual(source_check(root, unverified=False), main_sha)

    def test_a_folder_behind_the_forge_main_is_refused(self):
        with tempfile.TemporaryDirectory() as directory:
            forge, root = self.checkout_and_forge(directory)
            self.commit(root, "a")
            self.git(root, "push", "-q", "origin", "main")
            ahead = Path(directory) / "ahead"
            subprocess.run(["git", "clone", "-q", str(forge), str(ahead)], check=True)
            self.commit(ahead, "b")
            self.git(ahead, "push", "-q", "origin", "main")
            with self.assertRaisesRegex(ValueError, "does not contain origin/main"):
                source_check(root, unverified=False)

    def test_a_scratch_copy_without_history_is_refused_unless_marked_unverified(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaisesRegex(ValueError, "no git history"):
                source_check(Path(directory), unverified=False)
            self.assertEqual(
                source_check(Path(directory), unverified=True), "unverified"
            )

    @unittest.skipUnless(shutil.which("jj"), "needs jj")
    def test_a_jj_lane_is_checked_through_its_working_copy_commit(self):
        with tempfile.TemporaryDirectory() as directory:
            forge, root = self.checkout_and_forge(directory)
            main_sha = self.commit(root, "a")
            self.git(root, "push", "-q", "origin", "main")
            jj = ["jj", "--config", "user.name=t", "--config", "user.email=t@t"]
            subprocess.run(
                [*jj, "git", "init", "--colocate", str(root)],
                check=True,
                capture_output=True,
            )
            lane = Path(directory) / "lane"
            subprocess.run(
                [*jj, "-R", str(root), "workspace", "add", "-r", main_sha, str(lane)],
                check=True,
                capture_output=True,
            )
            self.assertFalse((lane / ".git").exists())
            self.assertEqual(source_check(lane, unverified=False), main_sha)
            ahead = Path(directory) / "ahead"
            subprocess.run(["git", "clone", "-q", str(forge), str(ahead)], check=True)
            self.commit(ahead, "b")
            self.git(ahead, "push", "-q", "origin", "main")
            with self.assertRaisesRegex(ValueError, "does not contain origin/main"):
                source_check(lane, unverified=False)

    def behind(self, directory):
        """A checkout one commit behind its forge's main, and a clone that is current."""
        forge, root = self.checkout_and_forge(directory)
        self.commit(root, "a")
        self.git(root, "push", "-q", "origin", "main")
        ahead = Path(directory) / "ahead"
        subprocess.run(["git", "clone", "-q", str(forge), str(ahead)], check=True)
        self.commit(ahead, "b")
        self.git(ahead, "push", "-q", "origin", "main")
        return root, ahead

    def test_unverified_does_not_skip_a_folder_that_has_history(self):
        with tempfile.TemporaryDirectory() as directory:
            root, _ = self.behind(directory)
            with self.assertRaisesRegex(ValueError, "does not contain origin/main"):
                source_check(root, unverified=True)

    def test_an_inherited_git_dir_cannot_stand_in_for_the_folder(self):
        with tempfile.TemporaryDirectory() as directory:
            root, ahead = self.behind(directory)
            env = {"GIT_DIR": str(ahead / ".git"), "GIT_WORK_TREE": str(ahead)}
            with (
                patch.dict("os.environ", env),
                self.assertRaisesRegex(ValueError, "does not contain origin/main"),
            ):
                source_check(root, unverified=False)

    def test_a_main_that_is_not_a_commit_id_is_refused(self):
        real_run = subprocess.run

        def forged(command, **kwargs):
            if "ls-remote" in command:
                return subprocess.CompletedProcess(
                    command, 0, "--upload-pack=x\trefs/heads/main\n", ""
                )
            return real_run(command, **kwargs)

        with tempfile.TemporaryDirectory() as directory:
            _, root = self.checkout_and_forge(directory)
            self.commit(root, "a")
            with (
                patch("scripts.private_studio.subprocess.run", side_effect=forged),
                self.assertRaisesRegex(ValueError, "not a commit id"),
            ):
                source_check(root, unverified=False)

    def test_unverified_source_flag_reaches_the_check(self):
        with (
            patch.object(
                sys, "argv", ["release", "--host", "fixture", "--unverified-source"]
            ),
            patch(
                "scripts.private_studio.source_check",
                side_effect=ValueError("stop here"),
            ) as check,
            self.assertRaisesRegex(ValueError, "stop here"),
        ):
            main()
        self.assertEqual(check.call_args.kwargs, {"unverified": True})

    def test_the_check_runs_before_any_remote_call(self):
        with (
            patch.object(sys, "argv", ["release", "--host", "fixture"]),
            patch(
                "scripts.private_studio.source_check",
                side_effect=ValueError("does not contain origin/main"),
            ),
            patch("scripts.private_studio.subprocess.check_output") as remote,
        ):
            with self.assertRaisesRegex(ValueError, "origin/main"):
                main()
            remote.assert_not_called()


if __name__ == "__main__":
    unittest.main()
