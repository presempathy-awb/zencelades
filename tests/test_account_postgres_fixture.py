"""Reject the temporary socket-only server during fixture initialization."""

import os
import re
import shutil
import signal
import subprocess
import time
from pathlib import Path

import pytest


@pytest.mark.unit
@pytest.mark.parametrize(
    ("initializing", "logs_exit"), [(0, 0), (2, 0), (31, 0), (31, 7)]
)
def test_persistence_waits_for_completed_database_initialization(
    tmp_path, initializing, logs_exit
):
    script = Path(__file__).resolve().parents[1] / "account-service/test-postgres.sh"
    state = tmp_path / "initializing"
    state.write_text(str(initializing))
    tools = tmp_path / "tools"
    tools.mkdir()
    fake = """#!/bin/sh
if [ "${0##*/}" = go ]; then
    while [ "$1" != -o ]; do shift; done
    printf 'fixture executable' > "$2"
    exit
fi
if [ "${0##*/}" = sleep ]; then exit; fi
case "$1" in
image) printf 'arm64\n' ;;
run) printf 'owned-fixture\n' ;;
logs)
    if [ "$FIXTURE_LOGS_EXIT" -ne 0 ]; then exit "$FIXTURE_LOGS_EXIT"; fi
    echo 'initdb: synthetic disk allocation failure'
    ;;
exec)
    case "$*" in
    *pg_isready*)
        # The bootstrap server accepts socket connections but never TCP.
        case "$*" in
        *' -h '*)
            remaining=$(cat "$FIXTURE_TEST_STATE")
            if [ "$remaining" -gt 0 ]; then
                printf '%s' "$((remaining - 1))" > "$FIXTURE_TEST_STATE"
                exit 1
            fi
            ;;
        esac
        ;;
    *-test.v)
        if [ "$(cat "$FIXTURE_TEST_STATE")" -gt 0 ]; then
            echo 'database system is shutting down' >&2
            exit 1
        fi
        echo 'PASS: persistence after initialization'
        ;;
    esac
    ;;
esac
"""
    for name in ("go", "docker", "sleep"):
        executable = tools / name
        executable.write_text(fake)
        executable.chmod(0o700)
    environment = {
        **os.environ,
        "PATH": f"{tools}:{os.environ['PATH']}",
        "TMPDIR": str(tmp_path),
        "FIXTURE_TEST_STATE": str(state),
        "FIXTURE_LOGS_EXIT": str(logs_exit),
    }
    result = subprocess.run(
        ["sh", str(script)],
        env=environment,
        capture_output=True,
        text=True,
        timeout=10,
        check=False,
    )
    if initializing > 30:
        assert result.returncode == 1, result.stderr
        if logs_exit:
            assert "Owned PG18 fixture logs unavailable" in result.stderr
        else:
            assert "initdb: synthetic disk allocation failure" in result.stderr
        assert "PASS: persistence after initialization" not in result.stdout
    else:
        assert result.returncode == 0, result.stderr
        assert "PASS: persistence after initialization" in result.stdout


@pytest.mark.integration
def test_fixture_expires_after_its_caller_is_killed(tmp_path):
    """The daemon-owned fixture must expire without the caller's shell trap."""
    timeout = shutil.which("timeout") or shutil.which("gtimeout")
    if timeout is None:
        pytest.skip("requires GNU timeout for the simulated container entrypoint")
    script = Path(__file__).resolve().parents[1] / "account-service/test-postgres.sh"
    tools = tmp_path / "tools"
    tools.mkdir()
    fake = """#!/bin/sh
if [ "${0##*/}" = go ]; then
    while [ "$1" != -o ]; do shift; done
    printf 'fixture executable' > "$2"
    exit
fi
case "$1" in
image) printf 'arm64\n' ;;
run)
    bounded=false
    mount=
    while [ "$1" != postgres:18-bookworm ]; do
        if [ "$1" = --entrypoint ] && [ "$2" = timeout ]; then bounded=true; fi
        if [ "$1" = --tmpfs ]; then mount="$2"; fi
        shift
    done
    shift
    printf '%s' "$mount" > "$FIXTURE_TEST_ROOT/mount"
    printf '%s' "$3" > "$FIXTURE_TEST_ROOT/duration"
    (
        # Start the shortened clock after cancellation, independent of host load.
        while [ ! -f "$FIXTURE_TEST_ROOT/cancelled" ]; do sleep 0.01; done
        if "$bounded"; then
            # Exercise real signals; shorten only the fixture's duration.
            "$FIXTURE_TEST_TIMEOUT" "$1" "$2" 0.6s sleep 60
        else
            sleep 60
        fi
        printf '%s' "$?" > "$FIXTURE_TEST_ROOT/expired"
    ) </dev/null >/dev/null 2>&1 &
    printf 'owned-fixture\n'
    ;;
exec)
    case "$*" in
    *-test.v)
        touch "$FIXTURE_TEST_ROOT/testing"
        sleep 60
        ;;
    esac
    ;;
esac
"""
    for name in ("go", "docker"):
        executable = tools / name
        executable.write_text(fake)
        executable.chmod(0o700)
    environment = {
        **os.environ,
        "PATH": f"{tools}:{os.environ['PATH']}",
        "TMPDIR": str(tmp_path),
        "FIXTURE_TEST_ROOT": str(tmp_path),
        "FIXTURE_TEST_TIMEOUT": timeout,
    }
    with subprocess.Popen(
        ["sh", str(script)],
        env=environment,
        start_new_session=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ) as caller:
        try:
            deadline = time.monotonic() + 3
            while not (tmp_path / "testing").exists():
                assert caller.poll() is None, "fixture failed before tests started"
                assert time.monotonic() < deadline, "fixture tests did not start"
                time.sleep(0.01)
            assert not (tmp_path / "expired").exists(), (
                "fixture expired before cancellation"
            )
            root, _, mount_options = (tmp_path / "mount").read_text().partition(":")
            assert root == "/var/lib/postgresql", "PG18 data is not in tmpfs"
            options = dict(
                option.partition("=")[::2] for option in mount_options.split(",")
            )
            size = re.fullmatch(r"([0-9]+)([bkmg]?)", options.get("size", ""))
            assert size is not None, "fixture tmpfs must have a finite memory cap"
            size_bytes = (
                int(size[1])
                * {"": 1, "b": 1, "k": 1024, "m": 1024**2, "g": 1024**3}[size[2]]
            )
            assert 0 < size_bytes <= 256 * 1024**2, (
                "fixture tmpfs exceeds its memory budget"
            )
            duration = re.fullmatch(
                r"([0-9]+(?:\.[0-9]+)?)([smhd]?)", (tmp_path / "duration").read_text()
            )
            assert duration is not None, "fixture must have a finite lifetime"
            seconds = (
                float(duration[1])
                * {"": 1, "s": 1, "m": 60, "h": 3600, "d": 86400}[duration[2]]
            )
            assert 0 < seconds <= 600, (
                "fixture lifetime exceeds its cancellation budget"
            )
            caller.kill()
            caller.wait(timeout=1)
            (tmp_path / "cancelled").touch()
            deadline = time.monotonic() + 2
            while not (tmp_path / "expired").exists():
                assert time.monotonic() < deadline, (
                    "fixture outlived its cancelled caller"
                )
                time.sleep(0.01)
            assert (tmp_path / "expired").read_text() == "124"
        finally:
            try:
                os.killpg(caller.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass


@pytest.mark.unit
@pytest.mark.parametrize(
    ("test_exit", "stop_exit", "expected"), [(0, 0, 0), (5, 0, 5), (5, 7, 5), (0, 7, 1)]
)
def test_cleanup_preserves_test_failure_and_removes_owned_files(
    tmp_path, test_exit, stop_exit, expected
):
    script = Path(__file__).resolve().parents[1] / "account-service/test-postgres.sh"
    tools = tmp_path / "tools"
    tools.mkdir()
    fake = """#!/bin/sh
if [ "${0##*/}" = go ]; then
    while [ "$1" != -o ]; do shift; done
    printf 'fixture executable' > "$2"
    exit
fi
case "$1" in
image) printf 'arm64\n' ;;
run) printf 'owned-fixture\n' ;;
exec) case "$*" in *-test.v) exit "$FIXTURE_TEST_EXIT" ;; esac ;;
stop) exit "$FIXTURE_STOP_EXIT" ;;
esac
"""
    for name in ("go", "docker"):
        executable = tools / name
        executable.write_text(fake)
        executable.chmod(0o700)
    result = subprocess.run(
        ["sh", str(script)],
        env={
            **os.environ,
            "PATH": f"{tools}:{os.environ['PATH']}",
            "TMPDIR": str(tmp_path),
            "FIXTURE_TEST_EXIT": str(test_exit),
            "FIXTURE_STOP_EXIT": str(stop_exit),
        },
        capture_output=True,
        text=True,
        timeout=3,
        check=False,
    )
    assert result.returncode == expected, result.stderr
    assert list(tmp_path.iterdir()) == [tools]
