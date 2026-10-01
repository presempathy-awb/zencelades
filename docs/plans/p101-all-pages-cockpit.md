# P101 — Every page in the cockpit

Andrew: “make all pages go into cockpit format but dont sactifice any of coolness
of main view etc”.

Keep the overview's immersive hero, renders and narrative. Inventory existing
pages; bring their complete content and interactions into the shared SPA shell,
retain download URLs and external destinations, and route existing page links to
the appropriate cockpit view. Validate content and navigation preservation,
build, inspect in the approved browser scope and publish a scoped release.
P100 hoop fit stays active and P098 account-owned saves remain pending.

Published in release 47956431; all eight additional page destinations and old
entry URLs now use the cockpit. Actual prior page content and downloads are
preserved. Build/tests and 161 HTTPS hash checks pass. Existing approved views
were exercised live; additional page-control browser approval remains pending.
See docs/cockpit-pages.md for the exact evidence and remaining boundary.
