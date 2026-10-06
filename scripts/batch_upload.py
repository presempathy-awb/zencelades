"""Preserve the fixed model or v4 batch through the scoped publisher."""

import argparse

from scripts.research_upload import run


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("batch", choices=("model", "v4"))
    parser.add_argument("--endpoint", required=True)
    parser.add_argument("--branch", required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    run(args, batch=args.batch)


if __name__ == "__main__":
    main()
