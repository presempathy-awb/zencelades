#!/bin/sh
# Own disposable PostgreSQL 18 fixture; no network, published port or live credential.
set -eu
cd "$(dirname "$0")"
fixture_dir=$(mktemp -d)
fixture_id=
cleanup() {
    if [ -n "$fixture_id" ]; then docker stop "$fixture_id" >/dev/null; fi
    rm -f "$fixture_dir/account-tests"
    rmdir "$fixture_dir"
}
trap cleanup EXIT HUP INT TERM
fixture_arch=$(docker image inspect postgres:18-bookworm --format '{{.Architecture}}')
GOOS=linux GOARCH="$fixture_arch" CGO_ENABLED=0 go test -c -o "$fixture_dir/account-tests"
fixture_id=$(docker run --detach --rm --pull never --network none \
    --env POSTGRES_HOST_AUTH_METHOD=trust \
    --env POSTGRES_DB=zencelades_account_test postgres:18-bookworm)
attempt=0
until docker exec "$fixture_id" pg_isready -U postgres -d zencelades_account_test >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 30 ]; then echo 'PG18 fixture did not become ready' >&2; exit 1; fi
    sleep 1 # Condition polling for the newly created database, bounded to 30 seconds.
done
docker cp "$fixture_dir/account-tests" "$fixture_id:/tmp/account-tests" >/dev/null
docker exec --env 'ZENCELADES_TEST_DATABASE_URL=postgres://postgres@/zencelades_account_test?host=/var/run/postgresql' \
    "$fixture_id" /tmp/account-tests -test.v
