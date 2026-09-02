#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "public"
EMBEDDED_IMAGE_RE = re.compile(
    r"data:image/[a-zA-Z0-9.+-]+(?:;[a-zA-Z0-9=.+-]+)*,([^\"'`)\s]+)",
    re.IGNORECASE,
)


def fail(message: str) -> None:
    print(f"ERRO: {message}", file=sys.stderr)
    raise SystemExit(1)


if not (PUBLIC / "index.html").is_file():
    fail("public/index.html não existe")

for path in PUBLIC.rglob("*"):
    if path.is_symlink():
        fail(f"link simbólico não permitido: {path.relative_to(PUBLIC)}")

texts = []
for suffix in ("*.html", "*.css", "*.js"):
    for path in PUBLIC.rglob(suffix):
        texts.append((path, path.read_text(encoding="utf-8")))
for path, content in texts:
    for match in EMBEDDED_IMAGE_RE.finditer(content):
        payload = match.group(1)
        if payload != "...":
            fail(f"a versão estruturada ainda contém imagem embutida: {path.relative_to(PUBLIC)}")

html = (PUBLIC / "index.html").read_text(encoding="utf-8")
for reference in re.findall(r'(?:href|src)=["\']([^"\']+)', html, re.IGNORECASE):
    if reference.startswith(("http://", "https://", "//", "data:", "blob:", "#")):
        continue
    relative = reference.split("?", 1)[0].split("#", 1)[0]
    target = (PUBLIC / relative.lstrip("/")).resolve()
    try:
        target.relative_to(PUBLIC.resolve())
    except ValueError:
        fail(f"referência escapa de public/: {reference}")
    if not target.is_file():
        fail(f"recurso local ausente: {reference}")

manifest_path = PUBLIC / "assets" / "manifest.json"
if manifest_path.is_file():
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for resource in manifest.get("resources", []):
        path = PUBLIC / resource["file"]
        if not path.is_file():
            fail(f"recurso do manifesto ausente: {resource['file']}")
        payload = path.read_bytes()
        if len(payload) != resource["bytes"]:
            fail(f"tamanho divergente: {resource['file']}")
        if hashlib.sha256(payload).hexdigest() != resource["sha256"]:
            fail(f"hash divergente: {resource['file']}")

catalog_path = PUBLIC / "asset-catalog.json"
if catalog_path.is_file():
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    for resource in catalog.get("assets", []):
        path = PUBLIC / resource["path"]
        if not path.is_file():
            fail(f"asset do catálogo ausente: {resource['path']}")
        payload = path.read_bytes()
        if len(payload) != resource["bytes"]:
            fail(f"tamanho divergente: {resource['path']}")
        if hashlib.sha256(payload).hexdigest() != resource["sha256"]:
            fail(f"hash divergente: {resource['path']}")

# O HUD de toque precisa ser alcançável por teclado e leitor de tela: cada
# controle carrega papel, foco e rótulo, e o CSS publica um foco visível.
indice = (PUBLIC / "index.html").read_text(encoding="utf-8")
controles = re.findall(r'data-(?:dir|btn)="([a-z]+)"[^>]*role="button"[^>]*aria-label="([^"]+)"', indice)
if len(controles) != 8:
    fail(f"HUD móvel acessível incompleto: {len(controles)} controles de oito")
if any(not rotulo.strip() for _, rotulo in controles):
    fail("HUD móvel possui controle sem rótulo")
estilo = (PUBLIC / "styles" / "game.css").read_text(encoding="utf-8")
if "focus-visible" not in estilo:
    fail("estilo publicado não define foco visível para o HUD móvel")

# Nenhum recurso pode vir de servidor de terceiro.
for externo in re.findall(r'https?://[^\s"\')]+', indice + estilo):
    if "denverso.com" in externo or externo.startswith("https://openfontlicense.org"):
        continue
    fail(f"recurso externo no conteúdo publicado: {externo}")

print(f"publicacao=valida arquivos={sum(1 for path in PUBLIC.rglob('*') if path.is_file())}")
