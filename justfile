default:
    @just --list

# Explicit engine and palette inputs; defaults: assisted, 20 inventions + 40/40/40 meshes.
naming-run engine palette output *args:
    uv run --no-project python -m scripts.naming_run run --engine {{quote(engine)}} --palette {{quote(palette)}} --output {{quote(output)}} {{args}}

naming-resume output *args:
    uv run --no-project python -m scripts.naming_run resume {{quote(output)}} {{args}}

# Run as a background process when invoked by an agent; Ctrl-C stops a manual preview.
naming-preview output:
    uv run --no-project python -m scripts.naming_run preview {{quote(output)}}

# Plans by default. Requires --host; publication needs explicit --apply.
naming-publish output *args:
    uv run --no-project python -m scripts.naming_run publish {{quote(output)}} {{args}}

# Validate actual ANCC review receipts; --apply writes the combined rating data.
naming-review-import responses *args:
    uv run --no-project python -m scripts.naming_reviews --responses {{quote(responses)}} {{args}}

# Inventory by default; --apply fills missing light checks in a resumable output.
naming-research engine output *args:
    uv run --no-project python -m scripts.naming_research --engine {{quote(engine)}} --output {{quote(output)}} {{args}}

# Prepare a complete final-ranking packet, or validate/import real reviewer replies.
naming-final *args:
    uv run --no-project python -m scripts.naming_final {{args}}

assets-import downloads:
    uv run --no-project python -m scripts.assets --downloads {{quote(downloads)}}

assets-check:
    uv run --no-project python -c 'from pathlib import Path; from scripts.assets import verify_release; print(verify_release(Path("deliveries/enceladus_v3")), "release hashes verified")'

assets-catalog:
    uv run --no-project python -m scripts.catalog_assets

# Separate v4 manifest and inventory; never rewrites the original v3 receipts.
assets-v4 *args:
    uv run --no-project python -m scripts.catalog_v4 {{args}}

check:
    uv run --no-project --with pytest --with reportlab==5.0.1 --with pypdf==6.19.0 pytest -q
    ruff check scripts tests
    ruff format --check scripts tests
    uv run --no-project python -m scripts.grant_ledger --check

site-build:
    uv run --no-project python -m scripts.build_site

# Vite/React studio; scenario checks, TypeScript build and model verification.
cockpit-check:
    (cd cockpit && bun test)
    (cd cockpit && bun run build)

cockpit-dev:
    (cd cockpit && bun run dev)

# Build public/private bundles and prove no prompt data is in the public build.
private-studio-check:
    (cd cockpit && bun test && bun run build)
    uv run --no-project python -m unittest tests.test_private_studio

# Additive overlay from the actual live release; no writes unless --apply.
private-studio-release *args:
    uv run --no-project python -m scripts.private_studio {{args}}

# Account boundary tests run without production secrets; PG18 uses an isolated fixture.
account-check:
    (cd account-service && go test -race ./...)
    (cd account-service && go vet ./...)
    sh account-service/test-postgres.sh

# Prints additive SQL only; execution requires an explicit --apply and credential file.
account-migration *args:
    (cd account-service && go run . --migrate {{args}})

# Build the standalone service for the verified presvd1 Linux/amd64 host.
account-build output:
    (cd account-service && GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -o {{quote(output)}} .)

# Plan by default. Apply requires the systemd host, reviewed digest and expected state.
# Credentials, migration, Authentik and website publication remain separate operations.
account-install source *args:
    uv run --no-project python -m scripts.account_install {{quote(source)}} {{args}}

# Plan by default; owner is the Telpher checkout with the existing B2 declaration.
archives-b2 owner *args:
    uv run --no-project python -m scripts.archive_b2 --owner {{quote(owner)}} {{args}}

# Plans by default. --apply requires the scoped publisher token from hid-in.
assets-upload *args:
    uv run --no-project python -m scripts.lake_upload {{args}}

# Separate plan and receipts; no original catalog or B2 receipt is overwritten.
research-upload *args:
    uv run --no-project python -m scripts.research_upload {{args}}

preview *args:
    uv run --no-project python -m scripts.preview {{args}}

# Plan by default; --apply stages and activates the static tailnet catalog.
deploy-site *args:
    uv run --no-project python -m scripts.deploy_site {{args}}

# Plan by default; install the project-local Shakesplurian API with --apply.
deploy-naming *args:
    uv run --no-project python -m scripts.deploy_naming {{args}}


# Cash, in-kind and requested support per build option; --check verifies the written ledger.
grant-ledger *args:
    uv run --no-project python -m scripts.grant_ledger {{args}}

# Generate reviewed import data only; never mutates the live Pacinman workspace.
pacinman-packet:
    uv run --no-project python -m scripts.pacinman_packet

# Regenerate a local planning PDF and inventory exports; no upload or live import.
build-plans:
    uv run --no-project --with reportlab==5.0.1 python -m scripts.build_option_packet
