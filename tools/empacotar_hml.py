#!/usr/bin/env python3
"""Cria o pacote determinístico e o manifesto da HML estática."""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import tarfile
from datetime import UTC, datetime
from pathlib import Path


ARCHIVE_NAME = "eter-hml-public.tar.gz"
MANIFEST_NAME = "eter-hml-manifest.json"
SOURCE_REPOSITORY = "Eteranima/Eter"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def public_files(public: Path) -> list[Path]:
    if not (public / "index.html").is_file():
        raise ValueError("public/ deve conter index.html")
    files: list[Path] = []
    for path in sorted(public.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"link simbólico não permitido: {path.relative_to(public)}")
        if path.is_file():
            files.append(path)
    return files


def public_tree_sha256(public: Path, files: list[Path]) -> str:
    digest = hashlib.sha256()
    for path in files:
        relative = path.relative_to(public).as_posix().encode("utf-8")
        digest.update(relative)
        digest.update(b"\0")
        digest.update(str(path.stat().st_size).encode("ascii"))
        digest.update(b"\0")
        digest.update(bytes.fromhex(sha256_file(path)))
    return digest.hexdigest()


def build_archive(public: Path, archive: Path, files: list[Path]) -> None:
    with archive.open("wb") as raw_stream:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw_stream, mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode="w", format=tarfile.GNU_FORMAT) as tar:
                for path in files:
                    info = tar.gettarinfo(str(path), arcname=path.relative_to(public).as_posix())
                    info.uid = 0
                    info.gid = 0
                    info.uname = ""
                    info.gname = ""
                    info.mtime = 0
                    info.mode = 0o644
                    with path.open("rb") as stream:
                        tar.addfile(info, stream)


def build_manifest(source_commit: str, archive: Path, tree_sha256: str, generated_at: str) -> dict[str, str]:
    if len(source_commit) != 40 or any(char not in "0123456789abcdef" for char in source_commit.lower()):
        raise ValueError("source_commit deve ser um SHA-1 completo")
    if not generated_at.endswith("Z"):
        raise ValueError("generated_at deve estar em UTC e terminar em Z")
    datetime.fromisoformat(generated_at.replace("Z", "+00:00"))
    return {
        "archive_name": ARCHIVE_NAME,
        "archive_sha256": sha256_file(archive),
        "generated_at": generated_at,
        "public_tree_sha256": tree_sha256,
        "source_commit": source_commit.lower(),
        "source_repository": SOURCE_REPOSITORY,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--public", type=Path, required=True)
    parser.add_argument("--source-commit", required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--generated-at")
    args = parser.parse_args()

    public = args.public.resolve()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    files = public_files(public)
    archive = output_dir / ARCHIVE_NAME
    build_archive(public, archive, files)
    generated_at = args.generated_at or datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    manifest = build_manifest(args.source_commit, archive, public_tree_sha256(public, files), generated_at)
    (output_dir / MANIFEST_NAME).write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
