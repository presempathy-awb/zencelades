"""Record the current Showtime build and insert its accessible homepage player."""

import re
import subprocess
from pathlib import Path

START = "<!-- showtime-home:start -->"
END = "<!-- showtime-home:end -->"


def insert_loop(page: str, player: str) -> str:
    """Replace only our owned block, refusing ambiguous homepage markup."""
    block = START + "\n" + player + "\n" + END
    if START in page or END in page:
        if page.count(START) != 1 or page.count(END) != 1:
            raise ValueError("Ambiguous homepage film markers")
        start, end = page.index(START), page.index(END)
        if end < start:
            raise ValueError("Reversed homepage film markers")
        return page[:start] + block + page[end + len(END) :]
    bodies = list(re.finditer(r"<body\b[^>]*>", page, re.IGNORECASE))
    if len(bodies) != 1:
        raise ValueError("Expected exactly one homepage body")
    position = bodies[0].end()
    return page[:position] + "\n" + block + page[position:]


def record_loop(root: Path) -> None:
    """Always record from this build; a failed recording aborts deployment."""
    subprocess.run(
        ["node", "scripts/record-showtime.mjs"], cwd=root / "cockpit", check=True
    )


def homepage(root: Path, page: str) -> str:
    """Insert the versioned player fragment into the built homepage."""
    return insert_loop(page, (root / "site/homepage-loop.html").read_text())
