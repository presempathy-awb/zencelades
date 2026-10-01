# Continuation after the presvd1 human vault unlock

The current site, asset preservation and tailnet-or-Authentik edge access are
live. Open STATUS.md, docs/verification.md and docs/site-access-verification.md
for the exact applied proof. Database creation is complete; HBA confinement,
per-person storage governance and the shared-app release remain pending.

## PostgreSQL creation is complete; confinement remains

September 30 update: the noninteractive SSH check had omitted XDG_RUNTIME_DIR.
The verified `/run/user/1002` context found Andrew's existing general unlock.
The provisioner then created `thatsnozorb_user` and `thatsnozorb` and stored the
URL in presvd1 hid-in. A repeat plan reports the role present, correct owner and
no creation steps. The HBA lines are still absent; do not claim full confinement.

```bash
# presvd1
export XDG_RUNTIME_DIR=/run/user/$(id -u)
hid-in gunlock-status
T=~/code/pres/scaffold/telpher
(cd "$T" && bin/pg18-app-provision thatsnozorb)
```

The binary, runtime directory and hid-in were verified live on presvd1. The
commands above inspect current state. Do not rotate the existing role or print
its stored connection URL. P007's separate Telpher project unlock succeeded:
the Authentik application was created, restricted and checked before the OR
route and split DNS were installed. A later optional admin recheck found the
project ticket locked again. Recheck authorization only when a further owner
operation needs it; do not recreate the application or bypass the ticket.

## Remaining owner changes

The provisioner deliberately requires its HBA lines to land through the
Telpher owner PR path before reload/confinement proof. The exact additions are
deploy/pg18-hba.additions.conf. The Much Ado integration lane is
/Users/andrew/code/branch/muchadoaboutoneside/enceladus-module/main. Its bundle
passes; full typecheck/startup have missing existing private dependencies.
The project-scoped broker/hid-in additions are under deploy/ and remain
unapplied. Runtime manifest grants require Andrew's interactive host approval.
Pawthentik per-person membership/revocation remains unestablished.

The reusable applied route and DNS recipes are in
/Users/andrew/code/branch/telpher/tailnet-site-access/main. It is local, not
landed in canonical Telpher. Its peer-review attempt failed because the
helper's default model is unsupported; no review or PR approval is claimed.
Infrastructure landing needs the appropriate review and high-tier PR scope
approval. Preserve unrelated main checkouts and protected branches.

## Preserve the completed proof

lakeFS repository thatsnozorb-assets, ingestion branch
ingest-enceladus-20260930T201112Z, commit
95490407ec74af428a4630816c3dfae1b9cefb6a39c5f2fba19e62cb2d92f29d has all
132 files / 61,416,414 bytes with complete immutable readback. Main remains
protected/unmerged and retention is verified. Do not rerun owner-import.py;
it refuses existing receipts/repositories to prevent replacement.

The research checkpoint release was
3dfc6ae2f4911795c607fbf42ff2ddec71d2d52ac04676da3fa9ffaad6591734. At access
closeout, the other chat's later release
0f8ea3ccbf08553572acd8a3f1f3afcf3239473c0fe97862787436f674789e1f was active
and matched assets/deployment-receipt.json. Re-read both before further activation.
The research checkpoint's changed outputs
passed exact HTTPS readback. Earlier full verification covers all 132 downloads,
catalog/naming bytes, video range 206, trusted IPv4/IPv6 TLS and public-origin
spoof rejection. The later access receipt records the current public login
redirect and both tailnet bypass paths. Do not call the static catalog a completed
PG18/Pawthentik workflow. Pytest remains paused; browser-control scope remains
unapproved. Keep the preserved release byte-identical and use
PYTHONDONTWRITEBYTECODE=1 if running its reference CLI again.

The last site plan also contains concurrent naming-page changes; this chat did
not deploy that combined build. Two grant-document source corrections now say
tailnet-or-Authentik instead of tailnet-only and await the next coordinated
release. See docs/site-access-verification.md; preserve the naming chat's work.
