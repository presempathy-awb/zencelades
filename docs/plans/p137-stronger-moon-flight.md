# P137 — Stronger moon-flight imagery

Andrew: "moon flight image stronger".

Interpretation: make the animated moon-flight imagery more prominent on the
sphere while retaining the visible person and the existing controls.

1. Trace the blend from the UI through the renderer.
2. Increase the default film contribution from 35% to 70%, preserving the
   static lunar map underneath and the independent human blend.
3. Verify the renderer default and slider behavior, refresh the homepage
   recording using the approved local workflow, then run the frontend checks.
4. PR, merge and deploy through the existing additive release; verify live.
