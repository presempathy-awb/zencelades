# P114 — Deferred Showtime audio and asset studio

Andrew, October 2, 2026:

> for the /showtime later but not yet
>
> give elevenlabs sound effects list.
>
> use asset prompt generator controls (with studio.zencleastes authentik locked) like umesemu has. link that leads to the the gimmesomepaw login for the pawthentik login.
>
> make 8 different song prompts. should switch between or dj blend them depending on setting, mode, etc

Scope: author sound-effect and music prompts, inspect existing Umesemu controls,
and save a concrete deferred studio/mixer plan. P115 specifies Suno for music.
Use the confirmed project domain as the basis for a proposed
`studio.zenceladus.com`; the typed studio spelling is not an instruction to
provision an unverified domain. No generation, spend, DNS, login configuration,
Showtime change or deployment is part of this preparation.

Steps: verify provider guidance; inspect actual Umesemu controls and runtime;
write one music prompt per file and a sound-effect list; map modes, mixing,
authentication and optimization requirements with evidence and acceptance tests.

Status: preparation complete in the [audio prompt pack](../audio/README.md):
16 ElevenLabs effects, eight separate Suno prompt files, and a source-backed
studio/auth/mixer plan. P118 subsequently implemented the separate private copy
studio with restricted Authentik access; its route activation is tracked there.
Generation, adaptive playback and the mixer remain deferred. The account-service
runtime deployment remains open.
