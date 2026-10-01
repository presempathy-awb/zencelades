"""Filesystem and service-state behavior of the bounded account installer."""

import hashlib
import io
import json
from types import SimpleNamespace

import pytest

from scripts import account_install as install


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


@pytest.fixture
def deployment(tmp_path, monkeypatch):
    source = tmp_path / "candidate"
    source.mkdir()
    (source / "zencelades-account").write_bytes(b"candidate binary")
    (source / "zencelades-account.service").write_bytes(b"candidate unit")
    root = tmp_path / "srv" / "zencelades-account"
    root.parent.mkdir()
    unit = tmp_path / "systemd" / "zencelades-account.service"
    unit.parent.mkdir()
    credential = tmp_path / "credential"
    credential.write_bytes(b"synthetic test credential")
    credential.chmod(0o600)
    monkeypatch.setattr(install, "ROOT", root, raising=False)
    monkeypatch.setattr(install, "UNIT", unit, raising=False)
    monkeypatch.setattr(install, "CREDENTIAL", credential, raising=False)
    monkeypatch.setattr(install, "require_root", lambda: None, raising=False)
    monkeypatch.setattr(install, "validate_unit", lambda *args: None, raising=False)
    monkeypatch.setattr(install, "healthy", lambda: None, raising=False)
    state = {"active": False, "enabled": False}

    def service(action):
        if action == "is-active":
            return state["active"]
        if action == "is-enabled":
            return state["enabled"]
        if action in ("start", "restart"):
            state["active"] = True
        elif action == "stop":
            state["active"] = False
        elif action == "enable":
            state["enabled"] = True
        elif action == "disable":
            state["enabled"] = False

    monkeypatch.setattr(install, "service", service, raising=False)
    return source, root, unit, credential, state


def planned(source, **kwargs):
    return install.install(
        source, expected_current="absent", expected_unit="absent", **kwargs
    )


def test_plan_does_not_install_or_read_credential(deployment):
    source, root, unit, credential, state = deployment
    credential.unlink()
    result = planned(source)
    assert result["applied"] is False
    assert len(result["release"]) == 64
    assert not root.exists() and not unit.exists()
    assert state == {"active": False, "enabled": False}


def test_install_and_replace_retains_previous_release(deployment):
    source, root, unit, _, state = deployment
    first = planned(source)
    result = planned(source, apply=True, release=first["release"])
    first_target = root / "releases" / first["release"]
    assert result["applied"] is True
    assert (root / "current").resolve() == first_target
    assert unit.read_bytes() == b"candidate unit"
    assert (first_target / "zencelades-account").stat().st_mode & 0o777 == 0o755
    assert state == {"active": True, "enabled": True}
    (source / "zencelades-account").write_bytes(b"new binary")
    kwargs = {
        "expected_current": first["release"],
        "expected_unit": sha(unit.read_bytes()),
    }
    second = install.install(source, **kwargs)
    install.install(source, **kwargs, apply=True, release=second["release"])
    assert first_target.is_dir()
    assert (first_target / "zencelades-account").read_bytes() == b"candidate binary"
    assert (root / "current").resolve() == root / "releases" / second["release"]


@pytest.mark.parametrize("failure", ["digest", "unit", "linked-source", "credential"])
def test_refuses_changed_or_untrusted_inputs(deployment, failure):
    source, root, unit, credential, state = deployment
    packet = planned(source)
    if failure == "digest":
        (source / "zencelades-account").write_bytes(b"unexpected replacement")
    elif failure == "unit":
        unit.write_bytes(b"another deployment owns this")
    elif failure == "linked-source":
        binary = source / "zencelades-account"
        binary.unlink()
        binary.symlink_to(credential)
    else:
        credential.chmod(0o644)
    with pytest.raises((ValueError, RuntimeError)):
        planned(source, apply=True, release=packet["release"])
    assert not (root / "current").exists()
    assert state == {"active": False, "enabled": False}
    if failure == "unit":
        assert unit.read_bytes() == b"another deployment owns this"


@pytest.mark.parametrize("previous", [None, (True, True), (False, False)])
def test_failed_start_restores_previous_service_and_keeps_artifacts(
    deployment, monkeypatch, previous
):
    source, root, unit, credential, state = deployment
    kwargs = {"expected_current": "absent", "expected_unit": "absent"}
    old_unit = None
    old_target = None
    if previous is not None:
        first = planned(source)
        planned(source, apply=True, release=first["release"])
        old_target = (root / "current").resolve()
        old_unit = unit.read_bytes()
        unit.chmod(0o600)
        kwargs = {"expected_current": first["release"], "expected_unit": sha(old_unit)}
        (source / "zencelades-account").write_bytes(b"broken new binary")
        (source / "zencelades-account.service").write_bytes(b"new unit")
        state.update(active=previous[0], enabled=previous[1])
    before = dict(state)
    packet = install.install(source, **kwargs)

    def unavailable():
        raise RuntimeError("candidate did not become healthy")

    monkeypatch.setattr(install, "healthy", unavailable)
    with pytest.raises(RuntimeError, match="candidate did not become healthy"):
        install.install(source, **kwargs, apply=True, release=packet["release"])
    assert state == before
    if previous is not None:
        assert (root / "current").resolve() == old_target
        assert unit.read_bytes() == old_unit
        assert unit.stat().st_mode & 0o777 == 0o600
    else:
        assert not (root / "current").is_symlink() and not unit.exists()
    assert (root / "releases" / packet["release"] / "zencelades-account").exists()
    assert credential.read_bytes() == b"synthetic test credential"


def test_concurrent_change_during_validation_is_not_overwritten(
    deployment, monkeypatch
):
    source, root, unit, _, state = deployment
    packet = planned(source)

    def changed(*args):
        unit.write_bytes(b"concurrent owner unit")

    monkeypatch.setattr(install, "validate_unit", changed)
    with pytest.raises(RuntimeError, match="changed"):
        planned(source, apply=True, release=packet["release"])
    assert unit.read_bytes() == b"concurrent owner unit"
    assert not (root / "current").exists()
    assert state == {"active": False, "enabled": False}


def test_apply_requires_explicit_reviewed_digest(deployment):
    source, root, unit, _, _ = deployment
    with pytest.raises(ValueError, match="reviewed"):
        planned(source, apply=True)
    assert not root.exists() and not unit.exists()


def test_enable_failure_restores_disabled_state(deployment, monkeypatch):
    source, root, unit, _, state = deployment
    packet = planned(source)
    normal = install.service

    def fail_enable(action):
        result = normal(action)
        if action == "enable":
            raise RuntimeError("enable failed")
        return result

    monkeypatch.setattr(install, "service", fail_enable)
    with pytest.raises(RuntimeError, match="enable failed"):
        planned(source, apply=True, release=packet["release"])
    assert state == {"active": False, "enabled": False}
    assert not (root / "current").is_symlink() and not unit.exists()


@pytest.mark.parametrize("health_fails", [False, True])
def test_rollback_does_not_overwrite_concurrent_owner(
    deployment, monkeypatch, health_fails
):
    source, root, unit, _, _ = deployment
    packet = planned(source)

    def other_deployment():
        unit.write_bytes(b"another owner changed the service")
        if health_fails:
            raise RuntimeError("health failed after concurrent change")

    monkeypatch.setattr(install, "healthy", other_deployment)
    with pytest.raises(BaseExceptionGroup) as raised:
        planned(source, apply=True, release=packet["release"])
    assert "health" in str(raised.value.exceptions[0])
    assert "rollback refused" in str(raised.value.exceptions[1])
    assert unit.read_bytes() == b"another owner changed the service"
    assert (root / "current").resolve() == root / "releases" / packet["release"]


def test_foreign_current_pointer_is_preserved(deployment, tmp_path):
    source, root, _, _, _ = deployment
    foreign = tmp_path / "another-service"
    foreign.mkdir()
    root.mkdir()
    (root / "current").symlink_to(foreign)
    with pytest.raises(RuntimeError, match="current pointer"):
        planned(source)
    assert (root / "current").resolve() == foreign


def test_fifo_candidate_is_rejected_without_blocking(deployment):
    import os

    source, root, _, _, _ = deployment
    binary = source / "zencelades-account"
    binary.unlink()
    os.mkfifo(binary)
    with pytest.raises(ValueError, match="regular file"):
        planned(source)
    assert not root.exists()


def test_changed_active_binary_is_not_treated_as_reviewed_previous_state(deployment):
    source, root, unit, _, state = deployment
    packet = planned(source)
    planned(source, apply=True, release=packet["release"])
    (root / "current" / "zencelades-account").write_bytes(b"unexpected active bytes")
    with pytest.raises(RuntimeError, match="release bytes changed"):
        install.install(
            source,
            expected_current=packet["release"],
            expected_unit=sha(unit.read_bytes()),
        )
    assert (
        root / "current" / "zencelades-account"
    ).read_bytes() == b"unexpected active bytes"
    assert state == {"active": True, "enabled": True}


def test_http_response_does_not_hide_inactive_account_unit(deployment, monkeypatch):
    source, root, unit, _, state = deployment
    packet = planned(source)

    def response_from_another_process():
        state["active"] = False

    monkeypatch.setattr(install, "healthy", response_from_another_process)
    with pytest.raises(RuntimeError, match="not active"):
        planned(source, apply=True, release=packet["release"])
    assert not (root / "current").is_symlink() and not unit.exists()
    assert state == {"active": False, "enabled": False}


@pytest.mark.parametrize(
    "case", ["anonymous", "signed-in", "cacheable", "html", "error"]
)
def test_health_probe_requires_the_private_anonymous_contract(monkeypatch, case):
    data = {
        "data": {
            "user": None,
            "signInURL": "/outpost.goauthentik.io/start?rd=%2F",
            "signOutURL": "/outpost.goauthentik.io/sign_out",
        }
    }
    if case == "signed-in":
        data["data"]["user"] = {"id": "unexpected", "username": "wrong service"}
    body = b"<html>login page</html>" if case == "html" else json.dumps(data).encode()
    response = io.BytesIO(body)
    response.status = 503 if case == "error" else 200
    response.headers = {
        "Cache-Control": "public" if case == "cacheable" else "private, no-store"
    }
    monkeypatch.setattr(
        install.urllib.request,
        "build_opener",
        lambda *_: SimpleNamespace(open=lambda *a, **kw: response),
    )
    ticks = iter([0, 21])
    monkeypatch.setattr(install.time, "monotonic", lambda: next(ticks))
    if case == "anonymous":
        install.healthy()
    else:
        with pytest.raises(RuntimeError, match="did not become healthy"):
            install.healthy()
