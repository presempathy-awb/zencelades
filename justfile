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
    uv run --no-project --with pytest pytest -q
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

# Plan by default; overlay the live site and install the IP adapter with --apply.
deploy-access *args:
    uv run --no-project --with pyyaml python -m scripts.deploy_access {{args}}

# Cash, in-kind and requested support per build option; --check verifies the written ledger.
grant-ledger *args:
    uv run --no-project python -m scripts.grant_ledger {{args}}

# Generate reviewed import data only; never mutates the live Pacinman workspace.
pacinman-packet:
    uv run --no-project python -m scripts.pacinman_packet
