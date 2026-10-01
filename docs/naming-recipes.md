# Reusable naming runs

Run these recipes from this artwork checkout. The Shakesplurian checkout and palette are explicit inputs. Every experiment gets a new output directory; existing experiments are resumed, never overwritten. The published page remains at `https://thatsnozorb.muchadoaboutoneside.com/naming/index.html`.

## Full-auto: Qwen 27

```bash
# maxipaxi
A=~/code/pres/make/thatsnozorb
E=~/code/branch/shakesplurian/enceladus-naming/main
P=$E/data/naming/families/thatsnozorb.toml
O=~/.cache/codex/naming-my-next-roll
just -f "$A/justfile" naming-run "$E" "$P" "$O" --mode full-auto
```

The default run makes **20 inventions, 40 three-word meshes, 40 four-word meshes, and 40 submitted-invention multi-mesh descendants**. The ordinary collections cycle through strengths 0–4; multi-mesh uses strength 5, randomly varying each join, and alternates three and four input words. Word count and strength are independent. Every descendant retains its input words, join levels and random seed.

Full-auto calls the existing local Ollama service using `qwen3.5:27b`. It checks the installed tag and 27B parameter size, records the model digest, and rejects a changed model on resume. It does not substitute the older `telpher-qwen-medium` 9B alias or install a model. Qwen supplies inventions and all eight editorial scores. Missing or malformed model results fail explicitly with saved progress; there is no heuristic-score fallback. The native Ollama JSON chat protocol is already used by Shakesplurian's mesh-appeal command; this recipe uses Python's standard library and needs no APIoly environment or new dependency.

Research attempts Brave exact-name search, GitHub repository names, npm and `.com` RDAP through the real Shakesplurian workbench. Confirmed collisions go into the archive and are replaced, with a bounded retry budget. Unavailable or rate-limited sources remain incomplete and do not block generation. A clean receipt means no exact hit in those checks, not legal clearance. Credentials remain with the existing engine configuration; this recipe does not provision them.

## Arguments

| Argument | Default | Meaning |
|---|---|---|
| `--mode` | `assisted` | `full-auto` enables Qwen 27 |
| `--count` | `40` | Results in each ordinary word-count collection, 1–40 |
| `--word-counts` | `3,4` | Distinct counts from 2,3,4 |
| `--levels` | `0,1,2,3,4` | Ordinary mesh strengths; 5 means random per join |
| `--invent-count` | `20` | Invented seed names, 1–32 |
| `--multi-count` | `40` | Submitted-name descendants, 0–40 |
| `--seed` | `42` | Nonnegative native-roll seed; saved per request |
| `--weights` | `50,12,10,8,7,5,5,3` | Eight nonnegative weights, normalized by their sum |
| `--research` | `light` | Four sources; `skip` explicitly marks unchecked names |
| `--reroll-rounds` | `2` | Replacement retries beyond the first attempt, 0–10 |
| `--families` | all | Comma-separated palette IDs |
| `--words-per-family` | `8` | First N checked entries per family; respects 256 total including invented seeds |
| `--brief` | palette purpose | Creative instructions for Qwen |
| `--project` | `thatsnozorb` | Palette/API ID; publication supports the existing thatsnozorb route |
| `--qwen-url` | `http://127.0.0.1:11434` | Ollama origin; choose a trusted local service |
| `--ai-timeout` | `600` | Seconds allowed for each Qwen call |
| `--ideas` | none | Supplied invention JSON; required during assisted work |
| `--previous` | none | Earlier research JSON to retain and exclude from new rolls |

The generation recipe retains its original eight-score contract: personal preference, sayability, memorability, water play, ocean moon, light/morphing, root clarity, distinctive sound. Its saved JSON ranking uses the supplied eight weights. The newer website comparison uses twelve categories and actual independent ChatGPT/Grok reviews as described below. Generated Qwen scores remain labelled as Qwen in the original-score details; they are never relabelled as ChatGPT or Grok. A new name waits for the independent reviews or personal score edits before entering the twelve-category ranking. The generation recipe does not automatically request Grok.

## Independent ChatGPT and Grok comparison

The website's twelve dimensions are ChatGPT preference, Grok preference, sayability, memorability, cleverness, ocean moon, wordplay, root clarity, distinctive sound, inventiveness, cool explanation, and holistic project fit. Shared categories use the arithmetic mean of the two actual judgments. Personal preferences remain separate. A missing positively weighted score makes the total unranked; zero weights also make a name unranked. Browser edits override only the selected category, and clearing an edit restores the model score.

ChatGPT's starting proposal is `50,10,8,6,4,4,4,2,3,3,2,4`. The Grok and average buttons use the imported actual proposal; the average first normalizes each proposal to 100. Existing custom browser weights keep unchanged categories only, with new categories at zero until a preset or slider change. Original eight-value weights and scores remain in exported state. Old water-play and light/morphing ratings never become cleverness and wordplay ratings.

The original review inputs and manifest are in `assets/naming-review/`. Four immutable batches cover 140 current candidates and 171 eligible historical names, excluding recorded collisions and eliminated inventions. `chatgpt-scores.txt` is the independent editorial assessment; current personal-preference values are retained at import because Andrew requested a label-only change. The final round allows up to fifteen total picks per model across eligible current and historical names. These replace each model's previous ten nominations, which remain in the exported review history. Separate shelves reapply browser-local forgotten choices and current research verdicts. No nomination changes a personal favorite or the most recent live roll.

Andrew authorized the temporary aintnocallerbackcurrrrl route. This run uses that checkout's `grok_capacity.invoke` and `OwnedCLIBackend` through the existing APIoly environment, with the signed-in official Grok CLI, two owned slots, three seconds between starts, a 1,800-second deadline, and saved process/response receipts. It is a local adapter run, not a deployed ANCC queue submission. Collectern's general request service was documented as uninstalled at preparation. Failed `.json` prompt attempts are retained separately; the CLI's documented plain-text prompt path is used for the corrected attempts.

Import is reusable and plans by default. The responses directory contains one folder per packet stem, each with `response.txt` and its actual `attempt.json`, plus the adapter's completed `report.json`. `--packets`, `--project` and `--output` select alternate explicit paths. The importer verifies source and packet hashes, exact name coverage, eleven finite scores per reviewer, matching successful attempt receipts, twelve weights, and eligible favorite choices before writing. A changed source needs fresh review inputs and actual reviews, not edited hashes or fabricated receipts.

```bash
# maxipaxi
R=~/.cache/codex/naming-grok-ancc-review-txt
just -f "$A/justfile" naming-review-import "$R"
just -f "$A/justfile" naming-review-import "$R" --apply
```

The generated `site/naming/reviews.json` contains both judgments, weight proposals, revival reasons and digest provenance. Original research receipts are unchanged by an import. Raw adapter results remain in the responses directory; the public file includes only validated naming review data. This temporary adapter invocation is not a new automatic production dispatch recipe.

For a final round, `just naming-research ENGINE OUTPUT` inventories missing Brave, GitHub, npm and .com receipts; adding `--apply` executes checks and writes resumable per-name receipts plus `OUTPUT/availability.json`. Still-fresh conclusive evidence survives a failed retry, original source dates remain visible, and known collisions remain excluded. GitHub gaps use the existing authenticated `gh` CLI's public-repository search with pacing; missing credentials or provider failures remain unknown. This recipe does not publish or replace names.

`just naming-final prepare --research OUTPUT/availability.json --output PACKETS` creates a complete input packet with the project brief, all reviewed names and explanations, both score sets, both weight proposals, the exact formula, three calculated rankings, previous picks and availability. It preserves immutable input snapshots. Supply this packet to the authorized reviewer route; the temporary ANCC adapter uses the official subscription CLI in read-only mode and retains actual prompt/response and cleanup receipts. For the full packet, the CLI's documented `--verbatim` flag sends the prompt unchanged; the initial default-mode response reported seeing only part of the list and was rejected. No direct API credential or fabricated model response is supported.

`just naming-final import --packets PACKETS --responses RESPONSES --chatgpt PROPOSAL` validates the unchanged inputs, successful owned Grok attempt, all twelve weights and at most fifteen distinct eligible names per model. It prepares the results by default; `--apply` writes `site/naming/reviews.json` and `site/naming/final-round.json`. The ChatGPT proposal has `favorites` (name/reason objects), `weights` (all twelve named dimensions totaling 100) and `weight_rationale`. Existing candidate scores are reused, not claimed as newly rescored. Publication is a separate naming-only release; preserve all concurrent site changes and bind activation to the observed current release.

The response directory contains the adapter's actual `report.json` and `grok-final/attempt.json` plus its verbatim `grok-final/response.txt`. A successful process exit with a prose-only or incomplete response still fails import. Local host capacity contention does not authorize clearing another run's lock; a different declared host may execute the same bounded adapter only after its own capacity and cleanup guards pass. The final-round receipt records the actual host, CLI version and adapter hashes.

Explanations describe the recorded inputs, a concrete image that fits the project, and a candid sound or spelling tradeoff. Full-auto prompts Qwen to distinguish literal fragments from invented endings and to acknowledge when strong joins obscure the roots. Editorial copy for the current 140 names and Andrew's three creations is preserved in `assets/naming-explanations.json` and published in the research/history JSON. A newer `explanation_revision` refreshes that copy in existing browser shelves while preserving scores, weights, favorites, creations, forgotten status and research receipts.

The final editorial pass covers all 276 surviving contenders. Its 135 expanded historical explanations are in `assets/naming-explanations-final.json`; the other 141 survivors retain their already detailed copy. Post-scoring expansions use a separate `editorial_explanation` field in `reviews.json` candidate entries and `final-round.json` rows. The ranked cards display that text only when the saved candidate's roots and original explanation match the reviewed input. The original `explanation` remains accessible in score details, and all scores still refer to that original wording. This preserves the actual ChatGPT/Grok assessments without pretending either model rescored the expanded prose. On a later scoring import, supply the desired prose as the review input and obtain real new scores; do not carry this supplement onto a different root set or assessment by name alone. Historical report downloads retain their original wording.

## Assisted mode and resume

```bash
# maxipaxi
just -f "$A/justfile" naming-run "$E" "$P" "$O" --ideas ideas.json
just -f "$A/justfile" naming-resume "$O" --judgments reviewed.json
```

Paths to idea/review files must be absolute when invoking Just from outside the artwork checkout. `ideas.json` is an array of `{ "name": "...", "morphemes": ["..."], "explanation": "..." }` records, or an existing research document with an `authored` array. Invented names and roots use 2–24 lowercase ASCII letters. Supply exactly the requested number of new slots. An assisted run without ideas saves `needs-ideas`; if research rejects inventions, supply only their replacements using `naming-resume --ideas FILE`.

After rolling and research, assisted mode saves `needs-review` and a `review.json` template. Copy it to `reviewed.json`, fill all eight scores and explanations for every name, then resume. Completed generation and research are reused. Full-auto interruptions use `just naming-resume OUTPUT`; accepted names, source receipts and successful AI responses are retained. A malformed AI receipt is retained for diagnosis rather than silently replaced. Correct that input or begin a new run; do not edit model/config identities to bypass validation.

The run directory contains `config.json`, `run.json`, `inputs.json`, copied palette and page templates, native and Linux API binaries, `model.json` and `ai-*.json` in full-auto mode, `review.json`, `research-rolls.json`, `site/`, and `site-manifest.json`. Keep valuable experiments somewhere durable; the example cache directory is disposable. Fixed native seeds reproduce engine rolls; AI responses and web research are saved evidence, not a promise that a later fresh request produces identical results.

## Preview and publication

```bash
# maxipaxi
just -f "$A/justfile" naming-preview "$O"
```

Preview prints a loopback URL and serves both the saved page and the real project API. Stop with Ctrl-C. Agents start long-lived previews in the background. The copied page retains the older explained exploration below the new ranking, explicitly labelled historical. Earlier saved names, favorites and creations remain in history; browser edits, forgotten names and favorites retain their existing storage keys for thatsnozorb. Other project IDs use separate storage keys.

```bash
# maxipaxi
H=$(agents-config get peers.presvd1.ssh)
just -f "$A/justfile" naming-publish "$O" --host "$H"
just -f "$A/justfile" naming-publish "$O" --host "$H" --apply
```

Publication plans by default and requires a complete thatsnozorb run. `--apply` verifies artifact hashes, saves the current naming directory in `before-publication`, stages only the naming files, and calls the existing `deploy-naming` and `deploy-site` recipes. The site recipe publishes the current whole artwork site, including other ready site changes; inspect concurrent work before applying. The API activation compares every live family, word and reserve against the supplied palette instead of requiring a hardcoded family count. Full-auto never implies publication or name locking.

After deployment, the recipe reads the HTTPS origin from the existing service declaration, checks every published naming-file hash, compares the live API catalog to the supplied palette, and saves that evidence in `publication.json`. An interrupted publication leaves the receipt and backup for inspection and refuses an automatic second apply. API and static deployments have their own activation receipts/rollback behavior; this wrapper does not claim atomic rollback across both services. It never changes `locked.csv` or chooses the project's final name.

The old Shakesplurian `data/naming/rolls/thatsnomoon/research_roll.py` and `render.py` remain historical artifacts of the original exploration. Use these declared recipes for new experiments; those older scripts contain the original fixed inputs.
