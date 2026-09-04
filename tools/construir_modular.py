#!/usr/bin/env python3
"""Valida e materializa a árvore modular do Éter para publicação."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
from datetime import datetime, timedelta, timezone
from pathlib import Path

BRT = timezone(timedelta(hours=-3))
BUILD_TIMESTAMP_MARKER = "__BUILD_TIMESTAMP__"


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


def carimbar_build(public: Path, agora: str) -> None:
    """Escreve a data/hora real do build em cima do marcador de index.html.

    Só index.html MATERIALIZADO (public/) é tocado — src/index.html nunca
    muda, então rodar o jogo direto da fonte mostra o marcador cru em vez
    de uma data (inofensivo; é só o carimbo que fica escondido/estranho).
    A visibilidade de verdade é decidida em runtime por hostname, em
    scripts/39-build-badge.js — este carimbo é só o texto.
    """
    index = public / "index.html"
    texto = index.read_text(encoding="utf-8")
    if BUILD_TIMESTAMP_MARKER not in texto:
        return
    index.write_text(texto.replace(BUILD_TIMESTAMP_MARKER, agora), encoding="utf-8")


def aplicar_cache_bust(public: Path, versao: str) -> None:
    """Acrescenta `?v=<versao>` em script/CSS locais do index.html materializado.

    O servidor manda `Cache-Control: max-age=14400` (4h) pros arquivos
    estáticos, e o nome do arquivo nunca muda de um build pro outro — um
    navegador que já visitou o jogo nas últimas 4h continua rodando o JS
    ANTIGO em cache local mesmo depois de um `git push` pra main, sem
    erro nenhum pra avisar (foi exatamente o que aconteceu: o elenco já
    tinha encolhido no servidor, mas quem visitou antes seguia vendo o
    elenco velho). `index.html` em si já é `Cache-Control: no-cache`, mas
    isso não ajuda em nada os arquivos que ELE referencia.

    A query string muda a cada build (mesmo carimbo de `carimbar_build`),
    então a URL do script é literalmente outra — o navegador é obrigado a
    buscar de novo, mesmo com `max-age` alto. Só toca `scripts/*.js` e
    `styles/*.css` locais; nunca um `<script>` de CDN (não existe nenhum
    neste projeto, mas a regra fica explícita pra não quebrar se um dia
    entrar). Imagem/áudio não entram aqui — cache-bust neles pediria
    tocar em `00-assets.js` (onde cada `Image().src` é montado), mudança
    maior e fora do reportado desta vez. """
    index = public / "index.html"
    texto = index.read_text(encoding="utf-8")
    texto = re.sub(
        r'(src|href)="((?:scripts|styles)/[^"?]+\.(?:js|css))"',
        rf'\1="\2?v={versao}"',
        texto,
    )
    index.write_text(texto, encoding="utf-8")


def build(source: Path, public: Path) -> None:
    catalog = validate(source)
    temporary = public.with_name(public.name + ".new")
    if temporary.exists():
        shutil.rmtree(temporary)
    shutil.copytree(source, temporary)
    agora_dt = datetime.now(BRT)
    carimbar_build(temporary, agora_dt.strftime("%d/%m/%y às %H:%M"))
    aplicar_cache_bust(temporary, agora_dt.strftime("%Y%m%d%H%M%S"))
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
