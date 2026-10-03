# Zencelades — Showtime audio prompt pack

Prepared October 2, 2026. **Suno for music; ElevenLabs for sound effects.**
Prompt writing and source research are complete. P118 now authorizes the private
studio deployment using Authentik while Pawthentik is unavailable; see the
[access contract](../private-studio-access.md) for its current prerequisites.
Showtime audio implementation, generation and listening acceptance remain deferred.

The musical direction is an ocean inside a human inside an icy moon: coastal,
tactile, curious, luminous and occasionally danceable. The eight pieces are
distinct modes in one family. Instrumental is the default so a participant's
presence and voice have space. Sound effects are artistic designs, not recordings
of Enceladus.

## Eight Suno prompts — one per file

| ID | Title / prompt | Mode | BPM target | Key target |
|---|---|---|---:|---|
| music-01 | [Shore to Saturn](suno/01-shore-to-saturn.md) | Arrival / idle | 72 | D minor |
| music-02 | [An Ocean Wearing Your Face](suno/02-an-ocean-wearing-your-face.md) | Portrait / participant reveal | 72 | F major |
| music-03 | [Tiger Stripe Lattice](suno/03-tiger-stripe-lattice.md) | Ice / surface detail | 96 | D minor |
| music-04 | [The Ocean Inside](suno/04-the-ocean-inside.md) | Ocean / immersion | 96 | F major |
| music-05 | [Plume Bloom](suno/05-plume-bloom.md) | Plumes / energetic reveal | 120 | D minor |
| music-06 | [Orbit Together](suno/06-orbit-together.md) | Orbit / social dance | 120 | F major |
| music-07 | [Moon Boots Optional](suno/07-moon-boots-optional.md) | Play / interactive movement | 120 | D minor |
| music-08 | [We Carry Oceans](suno/08-we-carry-oceans.md) | Return / quiet reset | 72 | F major |

## How to use the Suno fields

Use **Custom mode**, turn **Instrumental on**, leave Lyrics empty, and paste
the file's **Style prompt** into Styles. Paste its **Exclude** text into the
separate Advanced Options field. Record the model actually selected. Each file
has suggested Weirdness and Style Influence starting values; these are original
audition choices, not provider-proven optimal values.

Suno documents Custom mode's Instrumental/Styles workflow, separate Exclude
controls, and Weirdness/Style Influence sliders; Audio Influence appears for
audio uploads. The provider describes 50% Weirdness as its normal baseline;
our quieter proposals intentionally start lower. Availability must match
Andrew's actual account interface. Sources:
[Custom mode](https://help.suno.com/en/articles/3726721),
[Exclude](https://help.suno.com/en/articles/3161921),
[Creative Sliders](https://help.suno.com/en/articles/6141377).

The requested BPM, key, length, repeated motif and mix-friendly phrases are
directions. Listen and measure the actual take before labeling it DJ-ready.
Start with **An Ocean Wearing Your Face** and **Orbit Together** as the calm and
rhythmic pilot pair, then complete the other six after the sound is right.
Use the remaining eight-track list as a planned set, not a pre-authorized batch.

## Sound effects and studio design

[ElevenLabs: sixteen effects, settings and copy-ready text](elevenlabs-effects.md)
covers ambient beds, ice, plumes, human reveals, touch responses and transitions.

[Studio, login, mixing and Umesemu reuse plan](studio-and-umesemu.md) includes
source file evidence, prioritized optimizations, the proposed authenticated
studio route, asset controls, the 60-second film-loop constraint and acceptance
steps. It separates what already exists from what still needs implementation.

## Selection, export and delivery

Preserve the original take and generation record, then make reviewed playback
derivatives. Keep stable IDs, prompt/settings revisions, provider job/model,
measured audio data, immutable object hashes and acceptance notes. Store large
files through this project's existing lakeFS/B2 publisher; do not check audio
masters into Git.

Use two approved music decks first. Stem mixing is an optional later production
step: extract parts from the chosen take and confirm alignment/artifacts.
Suno's current [Get Stems guide](https://help.suno.com/en/articles/13925185)
documents paid access and different split methods; no extraction or entitlement
check was performed here.

The cockpit prompt browser and copy controls are implemented. The earlier public
prompt release is recorded in [publication evidence](publication.md); P118 moves
delivery to the restricted studio build and replaces the public audio page with
a sign-in link. Studio route activation is tracked separately in the
[access contract](../private-studio-access.md). No music or effects have been
generated or auditioned, and Showtime mixing remains deferred. No new production
dependency is introduced by this prompt browser.

Requests: [P114](../plans/p114-showtime-audio-studio.md) and
[P115](../plans/p115-suno-umesemu-optimizations.md).
