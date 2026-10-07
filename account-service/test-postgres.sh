#!/bin/sh
# Own disposable PostgreSQL 18 fixture; no network, published port or live credential.
set -eu
cd "$(dirname "$0")"
fixture_dir=$(mktemp -d)
fixture_id=
cleanup() {
    result=$?
    if [ -n "$fixture_id" ] && ! docker stop "$fixture_id" >/dev/null; then
        echo 'Could not stop owned PG18 fixture; its lifetime limit still applies' >&2
        if [ "$result" -eq 0 ]; then result=1; fi
    fi
    if ! rm -f "$fixture_dir/account-tests" || ! rmdir "$fixture_dir"; then
        echo 'Could not remove owned fixture build directory' >&2
        if [ "$result" -eq 0 ]; then result=1; fi
    fi
    return "$result"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
fixture_arch=$(docker image inspect postgres:18-bookworm --format '{{.Architecture}}')
GOOS=linux GOARCH="$fixture_arch" CGO_ENABLED=0 go test -c -o "$fixture_dir/account-tests"
fixture_id=$(docker run --detach --rm --pull never --network none \
    --entrypoint timeout \
    --tmpfs /var/lib/postgresql:rw,nosuid,nodev,size=256m \
    --env POSTGRES_HOST_AUTH_METHOD=trust \
    --env POSTGRES_DB=zencelades_account_test postgres:18-bookworm \
    --signal=TERM --kill-after=10s 600s docker-entrypoint.sh postgres)
attempt=0
# Initialization uses a socket-only server that shuts down before normal startup.
until docker exec "$fixture_id" pg_isready -h 127.0.0.1 -U postgres -d zencelades_account_test >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 30 ]; then
        echo 'PG18 fixture did not become ready' >&2
        if ! docker logs "$fixture_id" >&2; then
            echo 'Owned PG18 fixture logs unavailable (container may have exited)' >&2
        fi
        exit 1
    fi
    sleep 1 # Condition polling for the newly created database, bounded to 30 seconds.
done
docker cp "$fixture_dir/account-tests" "$fixture_id:/tmp/account-tests" >/dev/null
docker exec --env 'ZENCELADES_TEST_DATABASE_URL=postgres://postgres@127.0.0.1/zencelades_account_test?sslmode=disable' \
    "$fixture_id" /tmp/account-tests -test.v
