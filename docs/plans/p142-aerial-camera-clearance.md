# P142 — Rotate the aerial assembly clear of its poles

Andrew: "remember in the rig version to rotate it some to get cams away from the poles."

Measure the current aerial model and select a modest fixed rotation of the common
holder within its host frame that improves optical-head clearance. Keep the
triangle, ring, sphere, occupant, projector arms and capture views together. Keep
the host frame fixed and preserve the lander orientation. Align the entrance view
and fixed boarding steps with the rotated aerial entrance, including when motion
and effects are disabled.

Verify against the actual GLB, run the existing tests and builds, refresh the
source-bound homepage recording, check the visible Showtime controls and both rig
modes, then PR, merge and deploy using the existing release recipe. Geometry is a
concept clearance study, not fabrication or occupied-rig approval.

Selected geometry: −50° fixed yaw of the suspended assembly. The negative
direction gives the offset boarding steps more room than the mirrored +50° turn.
With the current
raised heads and P059 host poles, the nearest optical-axis-to-pole-surface
separation at rest increases from about 0.32 m to 0.94 m. Actual-GLB regression
checks keep every axis above 0.8 m under the sampled gentle sway as well as with
effects disabled. These are modeled sightline separations, not swept hardware or
full-cone clearance guarantees. Boarding steps turn with the entrance but remain
fixed to the ground while the bowl sways.
