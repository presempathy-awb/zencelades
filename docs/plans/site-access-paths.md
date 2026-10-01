# P005: Site access through tailnet, IP or Pawthentik

Actor: Codex. Status: applied and directly verified for the hostname's network
and Authentik policy paths; browser login remains unexercised. Captured
September 30, 2026. Evidence: [access verification](../site-access-verification.md).

Andrew's request, verbatim: “tailnet or tailnet ip or authentik login”.

1. Inspect live DNS, host routes, direct-IP behavior and existing Telpher
   recipes. Preserve other services sharing presvd1 and active project work.
2. Keep the existing HTTPS hostname usable without an app login over tailnet
   IPv4/IPv6. Distinguish direct IP links from curl --resolve/SNI checks; an IP
   cannot automatically identify one site on a shared server.
3. Prepare the supported route for authenticated access outside the tailnet,
   preserving the existing account authorization model and denying forged
   identity/source headers. Do not replace security with public anonymous access.
4. Use Telpher plan-by-default owner recipes for authorized changes. Observe
   actual hid-in status in the host's verified runtime context. Never bypass
   a human ticket/grant or fabricate authenticated browser evidence.
5. Verify successful/denied network paths, login redirect, and actual membership
   checks where credentials permit; record remaining limits in project status.

Dependencies: live route ownership, public DNS/routing strategy, application
registration and group policy, safe direct-IP dispatch on a shared host.
P004 grant research is published. External committee access is not
established merely by adding a login screen: reviewers need an authorized account
or actual form attachments.

Completion requires observed behavior for each provided access path. Existing
pytest pause and scoped browser-consent boundary remain in effect.

## Initial observations and preparation

The existing exact hostname routes to 127.0.0.1:18131 and enforces tailnet source
addresses. Bare IPv4 and IPv6 HTTP requests return 301 to HTTPS on their IP
literals; this is not proof of a usable project link or a trusted IP certificate.

The `feat/tailnet-site-access` Telpher lane now provides `tailnet-auth-site`
through `domain-add --tailnet-or-auth`. It renders one DNS-only hostname with
an authenticated default route and a higher-priority ClientIP tailnet route.
The latter strips incoming identity headers. Outpost callbacks have higher
priority still. Six invalid combinations are refused; YAML checks cover
middleware selection, priorities, source ranges and loopback target. The CLI
initially rejected the new flag, and the implemented command now renders
successfully. No pytest or live authenticated workflow is claimed.

Packet: `/Users/andrew/code/branch/telpher/tailnet-site-access/main/.remember/traefik-domain-route-renders/p005-review-muchadoaboutoneside-thatsnozorb/render-report.json`.
Its route/installer hashes validate. The existing remote dry-run exited 0 and
reports no installed change; its output also includes archive extended-attribute
warnings and an unreadable unrelated concierge route during conflict scanning.
Do not treat that scan as a complete all-route collision audit. Ruff found five
existing diagnostics; comparing with the parent revision confirms the same five
and no new diagnostics. At this initial P005 checkpoint no commit, PR, merge or
live route/DNS change had occurred; P007 subsequently applied the access change.

Read source: [Traefik ClientIP and priority documentation](https://doc.traefik.io/traefik/reference/routing-configuration/http/routing/rules-and-priority/).

## P007 applied result

Andrew's project unlock worked. The exact application/provider/outpost entry
was created, members were added before binding, and policy checks allowed
andrew/awb and refused the checked non-member. Signups remain off. The rendered
OR route, exact-host MagicDNS override and public DNS cutover were applied
through the owner tools. The normal hostname and both mesh IP families return
200; the public origin returns Authentik 302, including forged-source/identity
requests. All HTTPS probes validate the certificate. Repeat DNS plans are clean.

The later optional owner recheck returned project-locked exit 4; earlier
successful policy evidence is retained, and no bypass was attempted. The
installed site remained reachable. The [verification record](../site-access-verification.md)
contains exact results, backups, code-lane status and unverified browser scope.

Source-based access remains the provided interpretation. Bare-IP HTTPS on a
shared server is not a project shortcut; no default-site takeover, open signup
or anonymous public access was made. PG18 creation is also complete, while its
HBA confinement and scoped application storage work remain Q01/Q02.

## P008 linked-chat comparison

Read **telpher: Allow approved IPs without login** and its current source.
Its no-port hostname, socket-IP checks and refusal probes are reusable; its
blanket allowlist would deny unlisted public Authentik visitors on this project.
Keep our separate tailnet and authenticated routers. Do not import its public
IP list or claim its active PR is landed. The comparison is recorded in the
verification document; the other chat and its files were not modified.
