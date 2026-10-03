# P143 — A full-bottom squishy round chair

Andrew: "the squish below me needs to be covedring whole bottom like round chair"

Replace the small flat-topped cushion in Showtime with a broad continuous padded
bowl covering the bottom of the inner chamber. Keep a depressed center beneath
the occupant, raise the soft rounded sides and back like a round chair, and lower
the front edge at the entrance. Keep all padding inside the inner shell and keep
the entrance visible. Use the same seat in lander and aerial modes, following the
holder rather than the occupant's animated joints.

Verify the geometry and existing movement/capture behavior, inspect the visible
result in both rig modes, refresh the homepage recording, then PR, merge and
deploy through the existing additive release process. This is a visual seat
concept, not a manufactured cushion specification.

Implementation: the cushion reaches over 90% of the chamber radius at the sides
and back, wraps down to 98% of its lower radius, and has a lowered front lip. The
center keeps its previous seating height. Corrected the old inward top faces so
the padded surface is visible from above instead of showing the CAD floor below.
