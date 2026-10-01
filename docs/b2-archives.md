# ZIP archive storage in B2

Andrew requested ZIPs in B2 in P002. The one supplied ZIP is now preserved in
the existing private `glassine` bucket, under a separate content-addressed prefix:

`archives/thatsnozorb/sha256/ead14bd9a4d3e30b4b55aabd0ebd9a84d20cedd0ad9de47e5d1b80fffa41437a/Enceladus_Within_v3_Project.zip`

The archive contains exactly 15,283,642 bytes. Its SHA-256 is
`ead14bd9a4d3e30b4b55aabd0ebd9a84d20cedd0ad9de47e5d1b80fffa41437a`.
The B2 file version is
`4_z25616d79dddca8999eec0610_f1000bee0526687b5_d20260930_m204105_c004_v0402029_t0021_u01790800865798`.
See [the receipt](../assets/b2-archive-receipt.json) for the readback time and
recorded metadata. A second invocation verified the same version and full bytes
without creating another version.

The catalog adds B2 bucket/key/file ID to the ZIP record and marks B2 as its
preferred archive storage. All 132 existing lakeFS objects, the original uploads
and 125 extracted members remain preserved. This is not a deletion or a migration
of the encrypted backup repository. XLSX and NPZ containers remain ordinary
individual assets; there are no other `.zip` files in the supplied inventory.

## Repeatable owner workflow

The project recipe plans by default; the Telpher checkout supplies its existing
B2 configuration and declared hid-in key names. Both directories and the recipe
were verified on maxipaxi. No credential values are persisted in the project,
receipt, site or rclone config.

```bash
# maxipaxi
T=~/code/pres/scaffold/telpher
P=~/code/pres/make/thatsnozorb
(cd "$P" && just archives-b2 "$T")
(cd "$P" && just archives-b2 "$T" --apply)
```

The existing Telpher B2 one-shots manage encrypted restic repositories. This
project's narrow recipe uses the installed rclone B2 backend for raw ZIP storage,
with credentials delivered by Telpher's `bin/hid-in-env`. The archive prefix is
outside `telpher/mac/maxipaxi`, the existing restic repository. No bucket or
credentials were created, and no access policy was widened.

Before writing, the helper checks source hashes, confirms the existing bucket is
private, and refuses lifecycle rules that would automatically hide its archives.
It uses immutable copy semantics and never overwrites an existing object. Each
readback is fully hashed; metadata before and after must name the same version.
The receipt is replaced atomically only after all requested ZIPs pass.

Current bucket metadata reports no lifecycle rules. The key cannot read Object
Lock settings, so this record does not claim WORM protection or an enforced
retention duration. Version identification and successful readback are the proof
provided. The helper does not change retention, lifecycle, privacy or backup jobs.

Native metadata calls follow the official
[authorization](https://www.backblaze.com/apidocs/b2-authorize-account) and
[bucket listing](https://www.backblaze.com/apidocs/b2-list-buckets) APIs.
Transfers use the documented [rclone B2 backend](https://rclone.org/b2/).
