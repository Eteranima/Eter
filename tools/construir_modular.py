#!/usr/bin/env python3
"""Valida e materializa a árvore modular do Éter para publicação."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def validate(source: Path) -> dict[str, object]:
    catalog_path = source / "asset-catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    index = (source / "index.html").read_text(encoding="utf-8")
    if "data:image/" in index:
        raise ValueError("index ainda contém imagem embutida")
    if "fonts.googleapis.com" in (source / "styles" / "game.css").read_text(encoding="utf-8"):
        raise ValueError("CSS ainda depende de fonte externa")
    for relative in catalog["scripts"]:
        path = source / relative
        if not path.is_file() or f'src="{relative}"' not in index:
            raise ValueError(f"módulo ausente ou fora do índice: {relative}")
    for asset in catalog["assets"]:
        path = source / str(asset["path"])
        if not path.is_file():
            raise ValueError(f"asset ausente: {path}")
        if path.stat().st_size != asset["bytes"] or sha256(path) != asset["sha256"]:
            raise ValueError(f"asset divergente do catálogo: {path}")
    return catalog


def build(source: Path, public: Path) -> None:
    catalog = validate(source)
    temporary = public.with_name(public.name + ".new")
    if temporary.exists():
        shutil.rmtree(temporary)
    shutil.copytree(source, temporary)
    backup = public.with_name(public.name + ".previous")
    if public.exists():
        if backup.exists():
            shutil.rmtree(backup)
        public.rename(backup)
    temporary.rename(public)
    if backup.exists():
        shutil.rmtree(backup)
    print(
        f"versao={catalog['version']} assets={len(catalog['assets'])} "
        f"scripts={len(catalog['scripts'])} public={public}"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path("src"))
    parser.add_argument("--public", type=Path, required=True)
    args = parser.parse_args()
    build(args.source.resolve(), args.public.resolve())


if __name__ == "__main__":
    main()
