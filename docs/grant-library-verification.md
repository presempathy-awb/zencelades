# P004 publication evidence

September 30, 2026, maxipaxi → presvd1. The library has 12 guide entries,
eight art cases (six confirmed funded works and two comparisons), 28 primary
source records and a separate Enceladus proposal workshop.

```bash
# maxipaxi
just site-build
ruff check scripts/build_site.py
ruff format --check scripts/build_site.py
just deploy-site --host presvd1 --apply
```

All commands exited 0. Build verified 132 preserved asset copies. Deployment
verified 172 staged files and activated release
`3dfc6ae2f4911795c607fbf42ff2ddec71d2d52ac04676da3fa9ffaad6591734`.
Existing Caddy formatting/automatic-HTTPS warnings remain; Traefik terminates
TLS. The first health probe during restart failed to connect, then bounded
polling passed and activation completed.

Direct HTTPS readback returned 200 and exact size/SHA-256 for:

| Output | Bytes |
| --- | ---: |
| `/index.html` | 30,620 |
| `/grants/index.html` | 10,912 |
| `/grants/reading.css` | 821 |
| `/grants/sources.json` | 10,809 |
| `/documents/grant-research-library.md` | 14,047 |
| `/documents/strong-art-grant-guide.md` | 11,217 |
| `/documents/grant-draft.md` | 8,784 |
| `/documents/love-burn-research.md` | 17,150 |

Python standard-library delivery verification exited 0 with no mismatches.
All grant-page local href/src targets exist; all source IDs are unique.
Browser interaction remains unexercised because scoped control consent is
pending. Pytest remains paused. No application, contact or purchase occurred.
P005 access work continues separately.
