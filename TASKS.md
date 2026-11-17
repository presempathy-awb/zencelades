# Enceladus Within tasks

## Digital preparation — Codex

Completed locally: preserve originals and extract every asset; verify hashes; build the local project exhibit and downloadable catalog; record sourced grant/placement research; implement isolated Much Ado registration and scoped PG18/broker configuration; prepare the upload helper and Telpher rollout packet. Pending application: provision scoped project resources, upload and verify immutable readback, review public release selection, and deploy after the remaining approvals. Further pytest work is paused.

## Artistic and production decisions — Andrew

Choose the actual Love Burn deliverable and requested funding, confirm the public host and concrete rollout scope, provide artist/crew/portfolio details, review the narrative and submit the application if pursuing this cycle. The intended storage service has been resolved to hesellsheshells; its project repository/principals remain to be provisioned. Host-secret grants and biometric/TTY approvals remain Andrew's actions.

## Specialist and venue gates — owners to be appointed by Andrew

Projection/capture testing; exact vehicle-interface/manufacturer evidence; structural and whole-truck stability review; electrical and wet-site design; placement and authority determinations. Any occupied design additionally needs purpose-designed enclosure, performer support, egress and rescue review.

## Release hygiene — open since 2026-11-16

- **Rebase older lanes and pull-request branches onto main before releasing from them.**
  Owner: whoever next works in each. Every lane and open pull-request branch created before
  2026-11-16 predates the logo (#39 to #41). On maxipaxi that is 16 lanes under
  `~/code/branch/thatsnozorb/`, including the ones behind #10 and #28. A release built from
  one would remove the live logo and return the open-source page to its old text. See
  [docs/releasing.md](docs/releasing.md).
- **Decide whether the release tool should refuse a stale build.** Owner: Andrew to decide;
  Claude can build it. `scripts/private_studio.py` could refuse to run from a folder that
  does not contain `origin/main`. It changes a hardened tool, so it needs a review first,
  and the check must cope with scratch copies that carry no git history.
- **Decide how the presvd1 runner hands out the Docker socket.** Owner: Andrew to decide;
  the change is Telpher's. `/srv/telpher/gitea-runner/config.yaml` sets `docker_host`, so
  the runner mounts `/var/run/docker.sock` into every job container in every repository,
  which is root on presvd1. This repository's account job runs only on pushes to main and
  manual runs for that reason, but any workflow a pull request can run still reaches the
  socket. Not checked: whether Gitea runs a fork's pull-request workflows without approval.
