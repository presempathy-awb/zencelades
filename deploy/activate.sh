#!/usr/bin/env bash
# Plan by default; run on the deployment host with one SHA-256-addressed release.
# SHORTCUT: static catalog only; replace this unit when the shared Much Ado module
# has its independent PG18, broker grants and reviewed production release.
set -euo pipefail
release=${1:?usage: activate.sh RELEASE_SHA256 [--apply]}
[[ "$release" =~ ^[a-f0-9]{64}$ ]] || { echo "invalid release hash"; exit 1; }
apply=${2:-}
[[ "$apply" == "" || "$apply" == "--apply" ]] || exit 1
root=/srv/thatsnozorb
target=$root/releases/$release
unit=/etc/systemd/system/thatsnozorb.service
test -f "$target/release-files.json"
test -x /usr/bin/caddy
python3 - "$target" <<'PY'
import hashlib,json,pathlib,sys
root=pathlib.Path(sys.argv[1])
for entry in json.loads((root/'release-files.json').read_text()):
    relative=pathlib.PurePosixPath(entry['path'])
    if relative.is_absolute() or '..' in relative.parts:
        raise SystemExit('unsafe release path')
    file=root/relative
    if not file.is_file() or file.is_symlink():
        raise SystemExit('missing or linked release file')
    if file.stat().st_size != entry['bytes'] or hashlib.sha256(file.read_bytes()).hexdigest() != entry['sha256']:
        raise SystemExit('release integrity mismatch: '+entry['path'])
print('All staged release files verified')
PY
sudo -n /usr/bin/caddy validate --config "$target/deploy/Caddyfile" --adapter caddyfile
previous=$(readlink -f "$root/current" 2>/dev/null || true)
if [[ "$apply" != "--apply" ]]; then
    echo "Plan: activate $target; previous=${previous:-none}; install $unit; start loopback :18131"
    exit 0
fi
backup=$root/activation-backups/$release
sudo -n install -d -m 0755 "$backup"
[[ ! -e "$unit" ]] || sudo -n cp -p "$unit" "$backup/thatsnozorb.service"
rollback() {
    code=$?
    trap - EXIT
    if [[ "$code" != 0 ]]; then
        if [[ -n "$previous" ]]; then
            sudo -n ln -sfn "$previous" "$root/current"
            [[ ! -f "$backup/thatsnozorb.service" ]] || sudo -n install -m 0644 "$backup/thatsnozorb.service" "$unit"
            sudo -n systemctl daemon-reload
            sudo -n systemctl restart thatsnozorb.service
        else
            sudo -n systemctl stop thatsnozorb.service || true
        fi
        echo "Activation failed; prior release restored when present" >&2
    fi
    exit "$code"
}
trap rollback EXIT
sudo -n ln -sfn "$target" "$root/current"
sudo -n install -m 0644 "$target/deploy/thatsnozorb.service" "$unit"
sudo -n systemctl daemon-reload
sudo -n systemctl enable thatsnozorb.service
sudo -n systemctl restart thatsnozorb.service
for _ in $(seq 1 20); do
    if curl -fsS --max-time 2 http://127.0.0.1:18131/ -o /dev/null; then break; fi
    sleep 0.5
done
curl -fsS --max-time 5 http://127.0.0.1:18131/ -o /dev/null
expected=$(sha256sum "$target/site/dist/index.html" | cut -d ' ' -f 1)
actual=$(curl -fsS --max-time 5 -H 'Host: thatsnozorb.muchadoaboutoneside.com' http://127.0.0.1:18131/ | sha256sum | cut -d ' ' -f 1)
[[ "$actual" == "$expected" ]] || { echo "Hosted homepage bytes differ from staged release" >&2; exit 1; }
systemctl is-active --quiet thatsnozorb.service
echo "Active release: $release"
