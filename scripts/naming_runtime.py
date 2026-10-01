"""Native workbench and explicitly pinned local Qwen execution."""

import hashlib
import json
import os
import re
import subprocess
import time
from contextlib import contextmanager
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from scripts.naming_studio import QWEN_MODEL


def save_json(path: Path, value: object) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, indent=2, allow_nan=False) + "\n")
    temporary.replace(path)


def request_json(
    url: str,
    payload: dict | None = None,
    timeout: int = 120,
    headers: dict | None = None,
) -> dict:
    request = Request(
        url,
        data=None if payload is None else json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", **(headers or {})},
    )
    try:
        with urlopen(request, timeout=timeout) as response:
            return json.load(response)
    except HTTPError as exc:
        detail = exc.read(2000).decode(errors="replace")
        raise RuntimeError(f"HTTP {exc.code} from {url}: {detail}") from exc


class Qwen:
    def __init__(self, base: str, output: Path, timeout: int):
        self.base, self.output, self.timeout = base.rstrip("/"), output, timeout
        tags = request_json(self.base + "/api/tags", timeout=10)["models"]
        model = next((m for m in tags if m["name"] == QWEN_MODEL), None)
        if model is None or not model.get("details", {}).get(
            "parameter_size", ""
        ).startswith("27"):
            raise ValueError(
                f"{QWEN_MODEL} with 27B parameters must be installed; no fallback"
            )
        identity = {
            "model": QWEN_MODEL,
            "digest": model["digest"],
            "details": model["details"],
        }
        previous = output / "model.json"
        if previous.exists() and json.loads(previous.read_text()) != identity:
            raise ValueError("Qwen model changed since this run; start a new run")
        save_json(previous, identity)

    def __call__(self, task: str, payload: dict) -> list:
        common = {"name": {"type": "string"}, "explanation": {"type": "string"}}
        if task == "invent":
            common["morphemes"] = {"type": "array", "items": {"type": "string"}}
            instruction = (
                "Invent exactly count fresh, pronounceable art-project names. Names and roots must "
                "be lowercase ASCII letters, 2-24 letters. Exclude every excluded name. "
                "Use the brief and palette creatively; explain each name. Return JSON rows."
            )
        else:
            common["scores"] = {
                "type": "array",
                "items": {"type": "number", "minimum": 0, "maximum": 10},
                "minItems": 8,
                "maxItems": 8,
            }
            instruction = (
                "Judge every supplied candidate with exactly eight scores, 0-10, in score_labels order. "
                "First is your personal creative preference. Use differentiated honest judgments. "
                "Research availability must not inflate a creative score. Preserve exact names. "
                "Return JSON rows."
            )
        instruction += (
            " For each explanation, write 2-3 specific sentences (roughly 35-65 words): "
            "identify what each recorded input contributes, describe one concrete image or experience "
            "that fits the brief, and assess the resulting sound or spelling honestly. "
            "Distinguish literal surviving fragments from invented endings or loose associations. "
            "If an input is itself an invented seed, describe its role without claiming it is a dictionary root. "
            "Say when strong blending hides the roots or makes pronunciation difficult. "
            "Do not invent etymologies, availability claims, hardware capabilities, or a flattering story "
            "unsupported by the actual inputs. Avoid generic praise and merely restating the root list."
        )
        schema = {
            "type": "object",
            "properties": {
                "rows": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": common,
                        "required": list(common),
                        "additionalProperties": False,
                    },
                }
            },
            "required": ["rows"],
            "additionalProperties": False,
        }
        request = {
            "model": QWEN_MODEL,
            "stream": False,
            "think": False,
            "format": schema,
            "options": {"temperature": 0.6, "num_predict": 8192},
            "messages": [
                {"role": "user", "content": instruction + "\n" + json.dumps(payload)}
            ],
        }
        key = hashlib.sha256(json.dumps(request, sort_keys=True).encode()).hexdigest()
        receipt = self.output / f"ai-{key}.json"
        if receipt.exists():
            response = json.loads(receipt.read_text())["response"]
        else:
            print(
                f"Qwen 27: {task} ({len(payload.get('candidates', [])) or payload.get('count')} names)",
                flush=True,
            )
            response = request_json(self.base + "/api/chat", request, self.timeout)
            save_json(receipt, {"request": request, "response": response})
        if (
            response.get("model") != QWEN_MODEL
            or not response.get("done")
            or response.get("done_reason") != "stop"
        ):
            raise ValueError(
                f"Qwen response incomplete or wrong model; inspect {receipt.name}"
            )
        return json.loads(response["message"]["content"])["rows"]


def build_engine(engine: Path, output: Path) -> None:
    subprocess.run(
        [
            "mise",
            "exec",
            "--",
            "go",
            "build",
            "-o",
            str(output / "naming-workbench"),
            "./cmd/naming-workbench",
        ],
        cwd=engine,
        check=True,
    )
    subprocess.run(
        [
            "mise",
            "exec",
            "--",
            "go",
            "build",
            "-o",
            str(output / "naming-workbench-linux"),
            "./cmd/naming-workbench",
        ],
        cwd=engine,
        env={**os.environ, "GOOS": "linux", "GOARCH": "amd64", "CGO_ENABLED": "0"},
        check=True,
    )


@contextmanager
def workbench(output: Path, project: str):
    log_path = output / "workbench.log"
    with log_path.open("w") as log:
        process = subprocess.Popen(
            [
                str(output / "naming-workbench"),
                "--data",
                str(output / "data"),
                "--site",
                str(output / "site"),
                "--project",
                project,
            ],
            stdout=log,
            stderr=log,
        )
        try:
            deadline = time.monotonic() + 20
            base = None
            while time.monotonic() < deadline:
                match = re.search(r"http://127\.0\.0\.1:\d+", log_path.read_text())
                if match:
                    base = match.group()
                    break
                if process.poll() is not None:
                    raise RuntimeError("Workbench exited; inspect workbench.log")
                time.sleep(0.05)  # Poll the announced bound address, with a deadline.
            if base is None:
                raise TimeoutError(
                    "Workbench failed to announce its address in 20 seconds"
                )

            def api(payload):
                return request_json(
                    base + "/naming/api/workbench", payload, headers={"Origin": base}
                )

            api({"action": "catalog", "project": project})
            yield api
        finally:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
