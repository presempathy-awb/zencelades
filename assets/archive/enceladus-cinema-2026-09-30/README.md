# Enceladus cinema records, archived from zencelades #2

These are the records from zencelades `feat/enceladus-cinema` (#2, head `86c132d`,
30 September 2026) that main did not otherwise carry. Andrew closed #2 as superseded on
2026-11-19: its catalogs, film code and Showtime modules reached main through #5, #16,
#17 and #19 to #29. He chose to keep these remaining records here.

They are a record only:

- Nothing reads this folder. `scripts/restore_assets.py` reads
  `assets/enceladus-*/catalog.json`, one level down, so these catalogs ask it for nothing.
  The night-stills catalog lists 10 originals, and only 3 of them were on maxipaxi in
  November; at its old path it would have made every restore refuse.
- The originals are in lakeFS (`thatsnozorb-assets`), not here:

  | Set | lakeFS commit | Where |
  |---|---|---|
  | night stills | `f264962365ba…` | `imports/research/enceladus-night-stills/2026-10-01/` |
  | extra footage | `5c9f43ace44f…` | `imports/research/…`, per `enceladus-extra/lakefs-receipt.json` |
  | videos | `50919d730790…` | `imports/research/…`, per `enceladus-videos/lakefs-receipt.json` |

  The moon-stills and night-wrap sets have prompts and upload plans but no receipt.

- Each JSON file is byte for byte as #2 had it. The docs are in
  `docs/archive/enceladus-cinema-2026-09-30/`. Their text is as #2 had it, except relative
  links, which now point at these copies or at main's files so that they resolve.
- The night-stills prompts describe Andrew and name his reference photo,
  `andrew-reference.jpeg`. The photo is not in the repository. The same text was already
  public on #2's branch.
