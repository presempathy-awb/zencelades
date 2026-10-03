# P128 — Approved cache cleanup

Andrew, October 2, 2026, Denver:

> approve

This approves the immediately preceding request to revoke only superseded
Cloudflare token `1a58e7872f72641787dda595d1b6529d`, named
`telpher-zenceladus.com-dns`. Its replacement is
`0c70db7c5ea3f03f061e4b694c6a35bb`.

1. Verify the exact old token and active replacement, then revoke that old ID.
2. Use the existing Telpher recipe to mint and mirror a cache-capable token for
   the old `zencelades.com` alias. Preserve unrelated tokens.
3. Purge the ten retired prompt URLs and rerun live access and route checks.
4. Record the results, publish the bounded documentation follow-up and save a
   checkpoint. Authenticated browser sign-in remains a separate pending check.

The existing mint helper creates before revoking and cannot free a full token
quota. The bounded revocation therefore uses that helper's own API function
against the exact approved ID; token creation and purge use declared recipes.

## Result

Complete October 3 UTC. The replacement was verified active and identical on
both hosts before the exact approved revocation. The live token count was 46
before deletion, down independently from the earlier quota failure, and 45
after deletion. No unrelated token was revoked.

The alias replacement `246ec1eb1b0cb26cbe53bed27219ebf9` was minted through
Telpher, stored in hid-in, mirrored encrypted to presvd1, and verified active
and byte-identical across hosts. Cloudflare accepted the ten-URL alias purge.
All commands exited 0. The fresh 40-case URL check has zero failures; the
four Authentik route checks pass. Active release `dfecc13fcfbd` is unchanged.
See [deployment evidence](../private-studio-deployment.md). No application
rebuild or authenticated browser check was performed for this operational fix.
