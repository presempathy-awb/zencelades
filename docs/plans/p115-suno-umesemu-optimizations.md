# P115 — Suno music and Umesemu optimizations

Andrew, October 2, 2026:

> suno prompts for music.
>
> get the optimizations and such too from umesemu see what other great stuff

This refines P114: music prompts target Suno; sound effects target ElevenLabs.
Inspect Umesemu's real prompt controls, media delivery, rendering and audio
implementations. Record the useful patterns, what Zencelades already has,
what needs adaptation, and what should wait. Preserve P114's "later but not yet"
boundary: research and durable design now, implementation later.

Status: preparation complete. [Eight Suno prompt files and the effect list](../audio/README.md)
are written. The [reuse/optimization plan](../audio/studio-and-umesemu.md)
maps actual Umesemu source to the existing Babylon cockpit and newer Showtime
source. No runtime change, generation, dependency addition or deployment.
