# ElevenLabs sound-effect run sheet

Status: 16 original prompts prepared on October 2, 2026; no audio generated,
no credits spent, no listening acceptance. These are imagined installation
sound designs, not recordings of Enceladus.

## Controls kept outside the copied prompt

Use Sound Effects, not text-to-speech or music. The current API reference lists
`eleven_text_to_sound_v2`, duration **0.5–30 seconds**, and a separate `loop`
control. Prompt Influence defaults to **0.3** in that API. Start there; only
compare a stronger setting when the result misses the specified sound. Record
what the actual UI exposes rather than inventing equivalent controls.

Every prompt below is under the help page's 450-character text ceiling. Durations
are candidate targets. Loop On requests a repeatable effect; verify the rendered
seam in the browser. A longer ambience is playback of an accepted loop, not a
request for a generation exceeding the supported duration. The overview gives a
different minimum than the API; this run sheet follows the API's stricter minimum.

Sources checked October 2: [API controls](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert),
[Sound Effects help](https://elevenlabs.io/docs/help-center/product/core-capabilities/sound-effects/what-is-sound-effects),
[capabilities](https://elevenlabs.io/docs/overview/capabilities/sound-effects).

## Copy-ready effects

| ID / cue | Use | Seconds | Loop | Prompt |
|---|---|---:|:---:|---|
| sfx-01 · Shore wash | Arrival / idle | 20 | On | Soft small waves washing onto a sandy shore, close gentle foam fizz, calm distant surf, warm open-air ambience. Even continuous texture, no people, voices, birds, boats or music. |
| sfx-02 · Under-ice water | Ocean | 20 | On | Imagined underwater ambience beneath a vast ice ceiling: soft filtered water movement, tiny distant bubbles and a faint rounded low resonance. Calm, spacious, continuous texture, no whales, voices or music. |
| sfx-03 · Ice microcrystals | Ice detail | 3 | Off | A few delicate ice crystals settling and lightly ticking against one another, close and dry, crisp but soft, one short irregular cluster with a natural decay. No glass smash, heavy impact or music. |
| sfx-04 · Deep ice movement | Ice transition | 8 | Off | A distant glacier slowly flexing: gentle low creak, a rounded resonant swell, then a soft fading tail. Majestic and curious, never threatening. No explosive crack, sharp transient, alarm or music. |
| sfx-05 · Plume breath | Plume reveal | 5 | Off | A soft pressurized vapor plume blooming upward: a smooth airy rise, delicate granular spray, then a gently receding hiss. One controlled swell, no blast, machinery, voices or music. |
| sfx-06 · Ice particle drift | Plumes / orbit | 15 | On | Fine airy ice particles drifting through open space, a light granular shimmer with soft scattered crystalline ticks. Sparse, continuous and non-rhythmic, with subdued high frequencies. No melody, wind roar or music. |
| sfx-07 · Orbital pass | Orbit transition | 4 | Off | A soft wide airy whoosh approaching slowly, passing gently across the stereo field, and fading away. Smooth rounded texture, unpitched, no engine, impact, dramatic hit or music. |
| sfx-08 · Portrait bloom | Human reveal | 4 | Off | A warm airy bloom opening gently into a delicate glass-like shimmer and soft tail. Intimate and welcoming, with a rounded attack and no definite melody. No voice, choir, bell strike or music. |
| sfx-09 · Gentle welcome | Entry cue | 2 | Off | Two tiny soft wooden taps followed by a brief warm airy sparkle, a friendly subtle acknowledgement. Close and clean with a short natural tail. No notification alarm, speech or musical phrase. |
| sfx-10 · Touch ripple | Play interaction | 2 | Off | One small fingertip touching still water, a close soft plip followed by delicate circular ripples and a few tiny bubbles. Clear, gentle, intimate. No splash impact, voices or music. |
| sfx-11 · Crystal response | Play variation | 2 | Off | One tiny frosted crystal touched gently, a soft rounded tick and a brief glassy resonant tail. Delicate and tactile, not piercing, with no distinct tune, voice or background ambience. |
| sfx-12 · Moon turning | Slow rotation | 12 | On | A subtle continuous silky friction and airy granular swirl suggesting a huge icy sphere turning very slowly. Light, spacious, non-mechanical texture. No grinding, motor, rhythmic pulse, voices or music. |
| sfx-13 · Surface to ocean | Ice-to-ocean transition | 8 | Off | Dry delicate ice grains gradually dissolve into soft filtered water ripples and tiny bubbles. One smooth continuous transformation from crisp to fluid, with a gentle tail. No crack explosion, voice or music. |
| sfx-14 · Ocean to stars | Ocean-to-orbit transition | 8 | Off | Soft watery ripples thin gradually into a wide weightless airy shimmer, then settle into a quiet tail. A smooth gentle lift with no impact or melodic notes. No voices or music. |
| sfx-15 · Quiet release | Exit / return | 6 | Off | A small soft wave receding through fine sand, its airy fizz slowly thinning into calm near-silence. Close, warm and reassuring with an unhurried natural tail. No voices, birds or music. |
| sfx-16 · Weightless air | Neutral mix bridge | 20 | On | Very soft broad-band airy atmosphere, smooth and even with barely perceptible slow movement. Weightless, spacious and neutral, without definite pitch or rhythm. No wind gusts, voices, machinery or music. |

## Produce a small pilot before filling the library

First audition sfx-01, sfx-02, sfx-05, sfx-08 and sfx-16: these cover the core
arrival, ocean, plume, participant and transition needs. Accept or revise those
before generating the rest. Make alternate takes only for frequently repeated
touch/reveal events. Do not generate a giant batch just because the list exists.

## Runtime delivery contract

Keep provider originals in the existing asset preservation flow, individual
files in lakeFS/B2 through the owner-managed publisher. Save prompt, controls,
provider/model/job, source SHA-256, duration and rights/provenance record.
Store actual measured loudness and peak, channel count, loop start/end, and
named event offsets separately from the requested values. Outputs that are
unavailable in a preferred format stay in their original format; conversion
does not make a lossy original lossless.

Deliver a browser-tested compressed format and a fallback where needed. Long
ambiences are stereo beds; local effects can have reviewed mono derivatives for
positional playback. Do not collapse a stereo score into a point source. Do not
upload a ZIP as an ElevenLabs prompt attachment.

Use a shared Music / Ambience / Events mix with user-controlled mute. Apply
event cooldowns, a simultaneous-voice limit and non-repeating take selection.
Preview only after an explicit sound action, and silence everything immediately
on Stop. Air effects accompany imagery; none is an instruction to operate haze,
inflation, lifting or other physical equipment.

[Audio index](README.md) · [Studio and Umesemu reuse](studio-and-umesemu.md)
