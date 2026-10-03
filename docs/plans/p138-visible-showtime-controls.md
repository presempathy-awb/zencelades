# P138 — Visible interactive Showtime

Andrew: "make sure showtime STILL doesnt have the interactive omg".

The live renderer and controls exist, but the fixed cockpit shows the canvas
while its long control document falls below the visible area. Prior off-screen
control clicks did not prove usable visibility.

1. Fit the interactive scene and a persistent control dock into the cockpit.
2. Use visible control-group buttons with drill-down panels; preserve every
   existing control and the full installation films/notes in a separate view.
3. Test control navigation, actual viewport visibility and normal clicks.
4. Refresh the source-bound recording if needed, then PR, merge, deploy and
   verify both the canonical route and direct /showtime/ entry.
