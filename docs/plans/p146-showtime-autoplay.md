# P146 — Showtime opens already running

Andrew: "omg deployed start show not working and on showtime remember just start started"

1. Reproduce a delayed or blocked film insert keeping the moon timeline stopped.
2. Start the native 3D show as soon as the model is ready, independently of
   optional film inserts. Keep pause/resume and camera permission explicit.
3. Verify normal and unavailable-video playback in the visible browser, run the
   cockpit checks, then PR, merge and deploy through the existing release recipe.

Fresh production playback succeeds in the approved IAB session, but `begin()`
currently waits for every film video's `play()` promise before starting the
timeline. A pending promise blocks the show; a rejection returns it to the start
overlay. Active video rejection also pauses the entire native show. Cover those
paths without changing the model, controls, gallery or private studio boundary.
