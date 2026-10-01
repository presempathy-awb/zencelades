#!/usr/bin/env bash
set -euo pipefail
release=${1:?release SHA-256 required}
[[ "$release" =~ ^[a-f0-9]{64}$ ]] || exit 2
target="/srv/thatsnozorb-naming/releases/$release"
[[ ${2:-} == --apply ]] || { echo "Plan: verify and activate $target"; exit 0; }
if [[ $EUID != 0 ]]; then exec sudo -n bash "$0" "$release" --apply; fi
(cd "$target" && sha256sum -c files.sha256)
old=$(readlink -f /srv/thatsnozorb-naming/current || true)
unit=/etc/systemd/system/naming-workbench.service
if [[ -f "$unit" ]]; then cp "$unit" "$target/previous.service"; fi
rollback() {
    status=$?
    if [[ $status -ne 0 ]]; then
        echo "Naming activation failed; restoring the previous service" >&2
        if [[ -n "$old" ]]; then
            ln -sfn "$old" /srv/thatsnozorb-naming/current
        fi
        if [[ -f "$target/previous.service" ]]; then
            install -m 0644 "$target/previous.service" "$unit"
            systemctl daemon-reload
            systemctl restart naming-workbench.service
        else
            systemctl stop naming-workbench.service || true
        fi
    fi
}
trap rollback EXIT
install -m 0644 "$target/naming-workbench.service" "$unit"
ln -sfn "$target" /srv/thatsnozorb-naming/current
systemctl daemon-reload
systemctl enable --now naming-workbench.service
systemctl restart naming-workbench.service
for attempt in $(seq 1 20); do
    if curl -fsS --max-time 2 http://127.0.0.1:18132/naming/api/workbench \
        -H 'Host: thatsnozorb.muchadoaboutoneside.com' \
        -H 'Origin: https://thatsnozorb.muchadoaboutoneside.com' \
        -H 'Content-Type: application/json' \
        --data '{"project":"thatsnozorb","action":"catalog"}' \
        -o "$target/catalog-probe.json"; then break; fi
    sleep 0.5
done
python3 - "$target/catalog-probe.json" "$target/expected-catalog.json" <<'PY'
import json,sys
data=json.load(open(sys.argv[1]))
actual = {f['id']: {'words': f['words'], 'pool': f.get('pool') or []} for f in data['families']}
assert len(data['families']) == len(actual), 'Duplicate catalog IDs'
assert actual == json.load(open(sys.argv[2])), 'Live catalog differs from the supplied palette'
PY
systemctl is-active --quiet naming-workbench.service
echo "Active naming release: $release"
