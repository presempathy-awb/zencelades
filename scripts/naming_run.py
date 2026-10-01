"""Run, resume, preview or publish a saved naming experiment."""

import argparse
import hashlib
import html
import json
import math
import re
import shutil
import subprocess
import tomllib
from pathlib import Path
from urllib.request import urlopen

from scripts.assets import ROOT, sha256
from scripts.naming_runtime import (
    Qwen,
    build_engine,
    request_json,
    save_json,
    workbench,
)
from scripts.naming_studio import (
    DEFAULT_WEIGHTS,
    candidates,
    run_pipeline,
    validate_ideas,
)


def read_json(path: Path) -> object:
    return json.loads(path.read_text())


def csv_ints(text: str) -> list[int]:
    try:
        return [int(n) for n in text.split(",")]
    except ValueError as exc:
        raise argparse.ArgumentTypeError("Use comma-separated integers") from exc


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    commands = result.add_subparsers(dest="command", required=True)
    run = commands.add_parser("run", help="Create a new immutable-input experiment")
    run.add_argument("--engine", required=True, type=Path)
    run.add_argument("--output", required=True, type=Path)
    run.add_argument("--palette", required=True, type=Path)
    run.add_argument("--project", default="thatsnozorb")
    run.add_argument("--mode", choices=["assisted", "full-auto"], default="assisted")
    run.add_argument("--brief", help="Default: palette purpose")
    run.add_argument(
        "--families", help="Comma-separated palette family IDs; default all"
    )
    run.add_argument("--words-per-family", type=int, default=8)
    run.add_argument("--word-counts", type=csv_ints, default=[3, 4])
    run.add_argument("--levels", type=csv_ints, default=[0, 1, 2, 3, 4])
    run.add_argument(
        "--count", type=int, default=40, help="Names per word-count collection"
    )
    run.add_argument("--invent-count", type=int, default=20)
    run.add_argument("--multi-count", type=int, default=40)
    run.add_argument("--seed", type=int, default=42)
    run.add_argument("--weights", type=csv_ints, default=DEFAULT_WEIGHTS)
    run.add_argument("--research", choices=["light", "skip"], default="light")
    run.add_argument("--reroll-rounds", type=int, default=2)
    run.add_argument("--qwen-url", default="http://127.0.0.1:11434")
    run.add_argument("--ai-timeout", type=int, default=600)
    run.add_argument(
        "--ideas", type=Path, help="JSON rows or research-rolls.json with authored rows"
    )
    run.add_argument(
        "--previous",
        type=Path,
        help="Prior research-rolls.json to keep as forgotten history",
    )
    resume = commands.add_parser(
        "resume", help="Continue the saved inputs without starting over"
    )
    resume.add_argument("output", type=Path)
    resume.add_argument("--ideas", type=Path, help="Only the missing invention slots")
    resume.add_argument("--judgments", type=Path, help="Completed review.json")
    preview = commands.add_parser(
        "preview", help="Serve saved page and real project API until interrupted"
    )
    preview.add_argument("output", type=Path)
    publish = commands.add_parser(
        "publish", help="Plan existing site/API deployment; --apply publishes"
    )
    publish.add_argument("output", type=Path)
    publish.add_argument("--host", required=True)
    publish.add_argument("--apply", action="store_true")
    return result


def prepare(args: argparse.Namespace) -> tuple[dict, dict, Path]:
    config = vars(args).copy()
    if not re.fullmatch(r"[a-z][a-z0-9_-]{0,47}", args.project):
        raise ValueError("Invalid project ID")
    if (
        any(not 1 <= n <= 40 for n in [args.count])
        or not 1 <= args.invent_count <= 32
        or not 0 <= args.multi_count <= 40
    ):
        raise ValueError("count 1-40, invent-count 1-32, multi-count 0-40 required")
    if (
        not args.word_counts
        or len(set(args.word_counts)) != len(args.word_counts)
        or not set(args.word_counts) <= {2, 3, 4}
    ):
        raise ValueError("word-counts must be distinct values from 2,3,4")
    if not args.levels or not set(args.levels) <= set(range(6)):
        raise ValueError("levels must be 0-5 (5 randomizes every join)")
    if (
        len(args.weights) != 8
        or any(w < 0 or not math.isfinite(w) for w in args.weights)
        or sum(args.weights) <= 0
    ):
        raise ValueError("Supply eight nonnegative weights with a positive sum")
    if (
        not 0 <= args.seed < 2**62
        or not 0 <= args.reroll_rounds <= 10
        or not 1 <= args.words_per_family <= 32
        or args.ai_timeout < 1
    ):
        raise ValueError("Invalid seed, retry budget, word limit or AI timeout")
    engine = args.engine.resolve(strict=True)
    if not (engine / "cmd/naming-workbench/main.go").is_file():
        raise ValueError("Engine checkout lacks cmd/naming-workbench")
    palette = tomllib.loads(args.palette.read_text())
    wanted = (
        args.families.split(",")
        if args.families
        else [f["name"] for f in palette["families"]]
    )
    available = {f["name"]: f for f in palette["families"]}
    if len(set(wanted)) != len(wanted) or not set(wanted) <= available.keys():
        raise ValueError("Unknown or duplicate family ID")
    if not max(args.word_counts) <= len(wanted) <= (23 if args.multi_count else 24):
        raise ValueError(
            "Need enough distinct families and room for the submitted-name family"
        )
    families = [
        {
            "id": key,
            "label": key.replace("_", " "),
            "enabled": True,
            "words": available[key]["words"],
            "selected": available[key]["words"][: args.words_per_family],
            "pool": available[key].get("reserve", []),
        }
        for key in wanted
    ]
    if (
        sum(len(f["selected"]) for f in families)
        + (args.invent_count if args.multi_count else 0)
        > 256
    ):
        raise ValueError(
            "Selected palette plus inventions exceeds 256 words; lower words-per-family"
        )
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    (output / "data/families").mkdir(parents=True)
    shutil.copy2(args.palette, output / "data/families" / f"{args.project}.toml")
    shutil.copytree(ROOT / "site/naming", output / "template/naming")
    shutil.copy2(ROOT / "site/style.css", output / "template/style.css")
    config.update(
        engine=str(engine),
        output=str(output),
        palette=str(args.palette.resolve()),
        brief=args.brief or palette.get("purpose", "Explore a new project name"),
    )
    for key in ("ideas", "previous"):
        config[key] = str(config[key].resolve()) if config[key] else None
    state = {
        "families": families,
        "authored": [],
        "groups": [],
        "archive": [],
        "phase": "prepared",
    }
    if args.previous:
        old = read_json(args.previous)
        state["archive"] = [
            {**r, "forgotten": True}
            for r in old.get("authored", [])
            + [c for g in old.get("groups", []) for c in g["candidates"]]
            + old.get("archive", [])
        ]
    save_json(output / "config.json", config)
    save_json(output / "run.json", state)
    build_engine(engine, output)
    save_json(
        output / "inputs.json",
        {
            "binary_sha256": sha256(output / "naming-workbench"),
            "linux_sha256": sha256(output / "naming-workbench-linux"),
            "palette_sha256": sha256(output / "data/families" / f"{args.project}.toml"),
            "config_sha256": sha256(output / "config.json"),
        },
    )
    return config, state, output


def verify_inputs(output: Path, config: dict) -> None:
    expected = read_json(output / "inputs.json")
    for key, path in [
        ("binary_sha256", output / "naming-workbench"),
        ("palette_sha256", output / "data/families" / f"{config['project']}.toml"),
        ("config_sha256", output / "config.json"),
    ]:
        if sha256(path) != expected[key]:
            raise ValueError(
                f"Saved input changed: {path.name}; start a new experiment"
            )


def render(output: Path, config: dict, state: dict) -> None:
    destination = output / "site/naming"
    shutil.copytree(output / "template", output / "site", dirs_exist_ok=True)
    source = destination / "index.html"
    text = source.read_text()
    # This saved template retains the earlier explained exploration below the live studio.
    notice = (
        f'<p class="editor-note">Saved recipe run: {html.escape(state["phase"])}. '
        f"{len(state['authored'])} inventions; "
        + "; ".join(
            f"{len(g['candidates'])} {html.escape(g['label'])}" for g in state["groups"]
        )
        + f". Mode: {config['mode']}. Scores and receipts are in the ranking; the static exploration below is historical.</p>"
    )
    start = text.index('<section id="name-studio"')
    end = text.index("</section>", start) + len("</section>")
    studio = text[start:end]
    studio = re.sub(
        r'<p(?: class="editor-note")?>(?:20 names invented by Codex|Saved recipe run:).*?</p>',
        notice,
        studio,
    )
    studio = re.sub(
        r"<p>Scores run from 0 to 10.*?</p>",
        "<p>Eight scores run from 0 to 10. Change and normalize the weights to rerank immediately.</p>",
        studio,
    )
    studio = re.sub(
        r'<p class="editor-note">The 20 inventions.*?</p>',
        '<p class="editor-note">Each name identifies its scoring source. Creative scores are separate from availability research.</p>',
        studio,
    )
    studio = (
        studio.replace("Codex favorites", "AI/editorial favorites")
        .replace("20 invented by Codex", "Invented names")
        .replace('value="20 invented"', 'value="Invented"')
    )
    studio = (
        studio.replace("40 three-word meshes", "Three-word meshes")
        .replace("40 four-word meshes", "Four-word meshes")
        .replace("40 submitted-name multi meshes", "Submitted-name multi meshes")
        .replace("all 140 new names", "all saved new names")
    )
    text = text[:start] + studio + text[end:]
    text = re.sub(r'(<html[^>]*?) data-project="[^"]*"', r"\1", text, count=1)
    text = text.replace("<html", f'<html data-project="{config["project"]}"', 1)
    source.write_text(text)
    save_json(destination / "research-rolls.json", state)
    previous = read_json(output / "template/naming/research-rolls.json")
    history = read_json(destination / "report.json")
    prior = (
        previous.get("authored", [])
        + [c for g in previous.get("groups", []) for c in g["candidates"]]
        + previous.get("archive", [])
    )
    known = {c["name"] for g in history["groups"] for c in g["candidates"]}
    history["groups"].append(
        {
            "label": "Earlier saved recipe",
            "candidates": [
                {**c, "forgotten": True} for c in prior if c["name"] not in known
            ],
        }
    )
    save_json(destination / "report.json", history)
    save_json(destination / "palette.json", {"families": state["families"]})
    shutil.copy2(
        output / "data/families" / f"{config['project']}.toml",
        destination / "palette.toml",
    )
    save_json(output / "research-rolls.json", state)
    review = [
        {
            "name": r["name"],
            "morphemes": r.get("morphemes", []),
            "scores": r.get("scores", [None] * 8),
            "explanation": r.get("explanation", ""),
        }
        for r in candidates(state)
    ]
    save_json(output / "review.json", review)
    save_json(
        output / "site-manifest.json",
        {
            str(p.relative_to(output / "site")): sha256(p)
            for p in (output / "site").rglob("*")
            if p.is_file()
        },
    )


def verify_publication(output: Path) -> dict:
    service = (ROOT / "deploy/naming-workbench.service").read_text()
    origin = re.search(r"--origin (https://[^\s]+)", service)
    if origin is None:
        raise ValueError("No HTTPS origin declared by the deployed naming service")
    base = origin.group(1)
    count = 0
    for relative, expected in read_json(output / "site-manifest.json").items():
        if not relative.startswith("naming/"):
            continue
        with urlopen(base + "/" + relative, timeout=30) as response:
            actual = hashlib.sha256(response.read()).hexdigest()
        if actual != expected:
            raise ValueError(f"Published bytes differ: {relative}")
        count += 1
    catalog = request_json(
        base + "/naming/api/workbench",
        {"project": "thatsnozorb", "action": "catalog"},
        headers={"Origin": base},
    )
    from scripts.deploy_naming import expected_catalog

    expected = json.loads(expected_catalog(output / "data/families/thatsnozorb.toml"))
    actual = {
        f["id"]: {"words": f["words"], "pool": f.get("pool") or []}
        for f in catalog["families"]
    }
    if actual != expected or len(actual) != len(catalog["families"]):
        raise ValueError("Published API palette differs from this run")
    return {"origin": base, "verified_files": count, "verified_families": len(actual)}


def publish(output: Path, config: dict, state: dict, host: str, apply: bool) -> None:
    if state["phase"] != "complete" or config["project"] != "thatsnozorb":
        raise ValueError("Publication requires a complete thatsnozorb run")
    for relative, digest in read_json(output / "site-manifest.json").items():
        if sha256(output / "site" / relative) != digest:
            raise ValueError(f"Rendered artifact changed: {relative}")
    print(
        f"{'Apply' if apply else 'Plan'}: {len(candidates(state))} names to {host}; preserve a local naming backup."
    )
    if not apply:
        print(
            "Apply uses the saved Linux API, stages only site/naming, then calls deploy-naming and deploy-site. Existing unrelated site changes also ship through deploy-site."
        )
        return
    linux = output / "naming-workbench-linux"
    if sha256(linux) != read_json(output / "inputs.json")["linux_sha256"]:
        raise ValueError("Saved Linux API changed; refusing publication")
    backup = output / "before-publication"
    if backup.exists():
        raise ValueError(
            "Publication already attempted; inspect its receipt/backup before retrying"
        )
    shutil.copytree(ROOT / "site/naming", backup)
    shutil.copytree(output / "site/naming", ROOT / "site/naming", dirs_exist_ok=True)
    save_json(
        output / "publication.json",
        {"phase": "staged", "host": host, "backup": str(backup)},
    )
    subprocess.run(
        [
            "just",
            "deploy-naming",
            "--host",
            host,
            "--binary",
            str(linux),
            "--palette",
            str(output / "data/families/thatsnozorb.toml"),
            "--apply",
        ],
        cwd=ROOT,
        check=True,
    )
    subprocess.run(
        ["just", "deploy-site", "--host", host, "--apply"], cwd=ROOT, check=True
    )
    public = verify_publication(output)
    save_json(
        output / "publication.json",
        {
            "phase": "deployed",
            "host": host,
            "backup": str(backup),
            "api": read_json(ROOT / "assets/naming-deployment-receipt.json"),
            "public_verification": public,
        },
    )


def main() -> None:
    args = parser().parse_args()
    if args.command == "run":
        config, state, output = prepare(args)
    else:
        output = args.output.resolve(strict=True)
        config, state = (
            read_json(output / "config.json"),
            read_json(output / "run.json"),
        )
        verify_inputs(output, config)
    if args.command == "publish":
        publish(output, config, state, args.host, args.apply)
        return
    if args.command == "preview":
        with workbench(output, config["project"]):
            print((output / "workbench.log").read_text().strip(), flush=True)
            import signal

            signal.pause()
        return
    if args.ideas:
        rows = read_json(args.ideas)
        if isinstance(rows, dict):
            rows = rows["authored"]
        rows = validate_ideas(
            rows,
            config["invent_count"] - len(state["authored"]),
            {r["name"] for r in candidates(state) + state["archive"]},
        )
        state["authored"].extend(rows)
    ai = (
        Qwen(config["qwen_url"], output, config["ai_timeout"])
        if config["mode"] == "full-auto" and state["phase"] != "complete"
        else None
    )
    judgments = read_json(args.judgments) if getattr(args, "judgments", None) else None
    checkpoint = lambda: save_json(output / "run.json", state)
    checkpoint()
    try:
        with workbench(output, config["project"]) as api:
            run_pipeline(config, state, api, ai, checkpoint, judgments)
    except (ValueError, OSError, RuntimeError) as exc:
        state["error"] = str(exc)
        checkpoint()
        raise
    state.pop("error", None)
    checkpoint()
    render(output, config, state)
    print(
        f"{state['phase']}: {output}; {len(candidates(state))} names. Review: review.json; preview: just naming-preview OUTPUT"
    )


if __name__ == "__main__":
    main()
