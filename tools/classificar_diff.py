#!/usr/bin/env python3
"""Classifica diffs da HML e falha fechado fora do contrato static-v1."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path


LARGE_FILE_COUNT = 25
LARGE_TOTAL_BYTES = 10 * 1024 * 1024
PROHIBITED_ROOTS = {"deploy", "runtime", "scripts", "public", "historico", "Temp"}
ADAPTERS = {
    "docs": "docs-contract",
    "content": "node-check",
    "assets": "asset-catalog",
    "tests": "test-discovery",
    "tools": "tool-smoke",
    "workflow": "workflow-policy",
    "contract": "contract-policy",
}


def git(repo: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True)


def classify_path(path: str) -> str:
    if not path or path.startswith("../") or path.startswith("/"):
        raise ValueError(f"caminho inválido: {path}")
    root = path.split("/", 1)[0]
    if root in PROHIBITED_ROOTS or path.startswith(".env"):
        raise ValueError(f"raiz proibida no contrato static-v1: {path}")
    if path.startswith("docs/"):
        return "docs"
    if path.startswith("src/assets/"):
        return "assets"
    if path.startswith("src/"):
        return "content"
    if path.startswith("tests/"):
        return "tests"
    if path.startswith("tools/"):
        return "tools"
    if path.startswith(".github/workflows/"):
        return "workflow"
    if path in {".github/CODEOWNERS", ".denverso/eter-project.yaml", "AGENTS.md", "HANDOFF.md"}:
        return "contract"
    if path in {"README.md", "HOW-TO-SOLVE.md", "LICENSE", "NONCOMMERCIAL.md", "NOTICE", "THIRD_PARTY_NOTICES.md"}:
        return "docs"
    raise ValueError(f"raiz desconhecida no contrato static-v1: {path}")


def changed_paths(repo: Path, base: str, head: str) -> list[str]:
    paths = [line for line in git(repo, "diff", "--name-only", "--diff-filter=ACDMRTUXB", base, head).splitlines() if line]
    if not paths:
        raise ValueError("diff vazio não pode ser classificado")
    return sorted(set(paths))


def path_bytes(repo: Path, base: str, head: str, path: str) -> int:
    for revision in (head, base):
        result = subprocess.run(
            ["git", "-C", str(repo), "cat-file", "-s", f"{revision}:{path}"],
            text=True,
            capture_output=True,
        )
        if result.returncode == 0:
            return int(result.stdout.strip())
    raise ValueError(f"não foi possível medir: {path}")


def classify(repo: Path, base: str, head: str) -> dict[str, object]:
    paths = changed_paths(repo, base, head)
    classes = sorted({classify_path(path) for path in paths})
    total_bytes = sum(path_bytes(repo, base, head, path) for path in paths)
    large_change = len(paths) >= LARGE_FILE_COUNT or total_bytes >= LARGE_TOTAL_BYTES
    adapters = [ADAPTERS[item] for item in classes]
    if large_change:
        adapters.append("large-change")
    return {
        "adapters": adapters,
        "base": base,
        "classes": classes,
        "file_count": len(paths),
        "head": head,
        "large_change": large_change,
        "paths": paths,
        "total_bytes": total_bytes,
    }


def write_github_output(path: Path, result: dict[str, object]) -> None:
    values = {
        "classes": ",".join(result["classes"]),
        "adapters": ",".join(result["adapters"]),
        "large_change": str(result["large_change"]).lower(),
    }
    with path.open("a", encoding="utf-8") as stream:
        for key, value in values.items():
            stream.write(f"{key}={value}\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, default=Path("."))
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", required=True)
    parser.add_argument("--output-json", type=Path)
    parser.add_argument("--github-output", type=Path)
    args = parser.parse_args()
    try:
        result = classify(args.repo.resolve(), args.base, args.head)
    except (ValueError, subprocess.CalledProcessError) as error:
        print(f"ERRO: {error}", file=sys.stderr)
        raise SystemExit(1)
    encoded = json.dumps(result, indent=2, sort_keys=True) + "\n"
    if args.output_json:
        args.output_json.write_text(encoded, encoding="utf-8")
    if args.github_output:
        write_github_output(args.github_output, result)
    print(encoded, end="")


if __name__ == "__main__":
    main()
