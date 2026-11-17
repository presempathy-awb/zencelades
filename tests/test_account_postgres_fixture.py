"""Reject the temporary socket-only server during fixture initialization."""

import os
import subprocess
import sys
from pathlib import Path

import pytest


@pytest.mark.unit
@pytest.mark.parametrize("initializing", [0, 2])
def test_persistence_waits_for_completed_database_initialization(
    tmp_path, initializing
):
    script = Path(__file__).resolve().parents[1] / "account-service/test-postgres.sh"
    state = tmp_path / "initializing"
    state.write_text(str(initializing))
    tools = tmp_path / "tools"
    tools.mkdir()
    fake = (
        f"#!{sys.executable}\n"
        + """
import os
import sys
from pathlib import Path

tool = Path(sys.argv[0]).name
args = sys.argv[1:]
state = Path(os.environ["FIXTURE_TEST_STATE"])
if tool == "go":
    Path(args[args.index("-o") + 1]).write_bytes(b"fixture executable")
elif tool == "docker":
    if args[:2] == ["image", "inspect"]:
        print("arm64")
    elif args[0] == "run":
        print("owned-fixture")
    elif args[0] == "exec" and "pg_isready" in args:
        # The bootstrap server accepts socket connections but never TCP.
        if "-h" in args:
            remaining = int(state.read_text())
            if remaining:
                state.write_text(str(remaining - 1))
                sys.exit(1)
    elif args[0] == "exec" and args[-1] == "-test.v":
        if int(state.read_text()):
            print("database system is shutting down", file=sys.stderr)
            sys.exit(1)
        print("PASS: persistence after initialization")
"""
    )
    for name in ("go", "docker", "sleep"):
        executable = tools / name
        executable.write_text(fake)
        executable.chmod(0o700)
    environment = {
        **os.environ,
        "PATH": f"{tools}:{os.environ['PATH']}",
        "TMPDIR": str(tmp_path),
        "FIXTURE_TEST_STATE": str(state),
    }
    result = subprocess.run(
        ["sh", str(script)],
        env=environment,
        capture_output=True,
        text=True,
        timeout=10,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    assert "PASS: persistence after initialization" in result.stdout
