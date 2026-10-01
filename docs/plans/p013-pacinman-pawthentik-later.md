# P013 — Pacinman reference and Pawthentik integration, deferred

Andrew's prompt:

> pacinman also. also like pacinman will need to use pawthentik. but like shelve this for after other stuff done

## Decision and priority

Add Pacinman alongside Umesemu, Erebe and Much Ado as a project reference.
Thatsnozorb will need Pawthentik integration, like the intended direction for
Pacinman. Defer this comparison and user-level authorization integration until
the currently prioritized research/storage delivery is complete. This is not
a claim that Pacinman's integration already exists or has been verified.

The current owner PR reviews/eligible merges, scoped machine publisher rollout
and six-PDF preservation/readback retain priority. The existing tailnet-or-
Authentik site access remains in place; P013 does not request a route or account
change. Machine ingest authorization and later per-person membership/revocation
are separate milestones.

## Resume later

1. Inspect Pacinman's actual source and deployment evidence, identifying what
   its Pawthentik integration implements and what remains planned. The app's
   project registry currently maps its checkout to `home/packing-command`;
   re-resolve the canonical project and host paths before work.
2. Compare those boundaries with Thatsnozorb's existing edge login, Much Ado
   module and hesellsheshells machine capabilities. Reuse established contracts
   where they fit; do not copy another project's identities or credentials.
3. Define and implement the applicable per-person membership, authorization and
   revocation behavior after the priority work, with explicit allowed/denied
   and revocation evidence. Follow the current owner and human-secret gates.

Status: **deferred at Andrew's request**. No Pacinman source inspection, runtime
change, identity provisioning, new chat or message to another chat occurred for
this prompt. The durable plan is the deliverable for P013; no reminder or
background automation is scheduled.
