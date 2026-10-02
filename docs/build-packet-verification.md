# Build packet recovery and verification

October 2, 2026. The recovered source is reproducible through `just build-plans`.
The recipe uses ReportLab 5.0.1 as a build tool and writes a local planning PDF,
the public parts CSV and the reviewed Pacinman import JSON under `output/pdf/`.
The website runtime gains no dependency. Tests use pypdf 6.19.0 to read the
generated artifact. Neither recipe imports live inventory or publishes files.

## Preserved sources

All eleven original build-document bodies match the original triangle lane
after their historical banners. The old overview remains `p059-overview.md`;
the current README makes the later two-projector Love Burn proposal primary.
The recovered workbook intake matches its original body, its 40-candidate,
26-sheet catalog is byte-identical, and the preserved XLSX SHA-256 matches
the catalog. All local source links resolved before generation.

The old packet generator was missing from committed source. Its restoration
reuses the tested `pacinman_packet.write_inventory` function. Rendering now
escapes authored text, formats supported emphasis and links, separates numbered
steps, retains headings with their content, allocates useful widths to step and
budget tables, and numbers pages. Local Markdown links retain their labels;
HTTP(S) references remain clickable. The PDF does not embed private inventory.

## Checks

The functional test first failed because the generator module was absent.
After restoration it passed: the PDF preserves selected plan text, literal
angle brackets, ampersands, prices and separate sections; it renders emphasis
without Markdown delimiters, retains an external hyperlink and page numbers,
and exports the owned-hazer inventory semantics and parts CSV.

The first full artifact had stranded headings and oversized step-number
columns. Visual inspection caught these; heading retention and table widths
were corrected. The final PDF has 18 letter-size pages, with 11 plan documents,
88 part/resource export records and 24 task export records. The records include
alternatives, so their raw sum is not a selected-build budget. The PDF covers
the current primary plan, five historical configuration workflows, optics and
participant modules, material/host choices, field operations and inventory.

All pages were rendered and inspected during layout verification; the final
changed opening pages were rendered and inspected again. Text extraction and
page-bound checks supplement that visual inspection. The original lane,
existing grant attachments and live website are unchanged.

Final `just check` exited 0: 83 tests and 13 subtests passed, Ruff check/format
passed for 39 files, and the grant ledger matched its sources. The final PDF
contains the expected prices and configuration sections with no characters
outside page bounds; local links resolve. Artifact SHA-256:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Zencelades-Build-Plans.pdf | 50,587 | `3f8eb296c55e8e031cf91256476293aee3a01d9611a63c635ee33414cdcb474f` |
| Zencelades-Parts.csv | 21,869 | `e8c7341bc14658951ebd72d5de01455ab85782a1ba8aa4953eb97a0b6a351f45` |
| pacinman-import.json | 126,317 | `31a9ab6c901c24d8f420e586ab22f46031dcc58e66d9d86a9782c099b63f2e7a` |

These hashes identify this generated delivery. PDF creation metadata may change
on a later run; the recipe reproduces content, not a promised byte-stable PDF.

No fabrication approval, current quote, purchase, new live Pacinman import,
remote preservation receipt or website deployment is established by this PDF.
