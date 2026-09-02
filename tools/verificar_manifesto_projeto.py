#!/usr/bin/env python3
"""Verifica os campos normativos do manifesto static-v1 sem dependências externas."""

from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / ".denverso" / "eter-project.yaml"
REQUIRED = (
    "apiVersion: denverso-eter/v1",
    "contract: static-v1",
    "source_root: src",
    "generated_root: public",
    "archive_name: eter-hml-public.tar.gz",
    "manifest_name: eter-hml-manifest.json",
    "- deploy",
    "- runtime",
    "- scripts",
    "- public",
    "file_count: 25",
    "total_bytes: 10485760",
)


def main() -> None:
    content = MANIFEST.read_text(encoding="utf-8")
    missing = [field for field in REQUIRED if field not in content]
    if missing:
        print(f"ERRO: manifesto incompleto: {', '.join(missing)}", file=sys.stderr)
        raise SystemExit(1)
    print("manifesto_projeto=valido")


if __name__ == "__main__":
    main()
