#!/usr/bin/env python3
"""Auditoria reproduzível de assets de cenário (SPR-001).

Cruza `src/asset-catalog.json`, `SPRITE_DATA` (todas as ocorrências em
`src/scripts/00-assets.js`, para pegar chave duplicada/sobrescrita) e o
disco em `src/assets/`, e devolve — por chave — a mesma ficha pedida pelo
plano de expansão de assets: key, path, mime, bytes, sha256, width,
height, has_alpha, consumer_count, map_consumers, status.

`identify` (ImageMagick) fornece dimensão/alpha real; não há geração nem
correção de arte aqui — só leitura e cruzamento determinístico.

Uso:
    python3 tools/auditar_assets_cenario.py               # resumo no stdout
    python3 tools/auditar_assets_cenario.py --json rel.json  # relatório completo
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"

# Prefixos de chave montada em runtime (nome nunca aparece literal no
# código-fonte, só a concatenação) — mesma lista já usada em auditorias
# manuais anteriores desta sessão. Ver comentários em 15/20/22/24/28-*.js.
DYNAMIC_PREFIXES = (
    "busto_", "hab_", "ail_", "tree_bg_", "ui_elem_", "battle_bg_",
)

STATUS_VALIDOS = {
    "OK", "UNUSED", "DUPLICATE_CONTENT", "DUPLICATE_KEY", "MISSING_FILE",
    "MISSING_CATALOG", "MISSING_SPRITE_DATA", "BROKEN_ALPHA",
    "SUSPICIOUS_DIMENSIONS", "LEGACY_OVERRIDE", "REVIEW_VISUAL",
    "CATALOG_MISMATCH",
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for bloco in iter(lambda: f.read(1 << 20), b""):
            h.update(bloco)
    return h.hexdigest()


def carregar_catalogo() -> dict:
    return json.loads((SRC / "asset-catalog.json").read_text(encoding="utf-8"))


def carregar_sprite_data() -> list[tuple[str, str, int]]:
    """[(key, path, linha)] — TODAS as ocorrências, na ordem do arquivo.

    `SPRITE_DATA` nasce de um literal grande e cresce por vários
    `Object.assign(SPRITE_DATA, {...})` — uma chave repetida mais adiante
    sobrescreve a de cima em silêncio. Devolver todas as ocorrências é o
    que permite `DUPLICATE_KEY`/`LEGACY_OVERRIDE` existir.
    """
    texto = (SRC / "scripts" / "00-assets.js").read_text(encoding="utf-8")
    quebras = [0] + [i + 1 for i, c in enumerate(texto) if c == "\n"]

    def linha_de(pos: int) -> int:
        lo, hi = 0, len(quebras) - 1
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if quebras[mid] <= pos:
                lo = mid
            else:
                hi = mid - 1
        return lo + 1

    ocorrencias = []
    for m in re.finditer(r'["\']?([A-Za-z0-9_]+)["\']?\s*:\s*"([^"]+)"', texto):
        ocorrencias.append((m.group(1), m.group(2), linha_de(m.start())))
    return ocorrencias


def carregar_codigo_consumidor() -> str:
    """Todo `src/scripts/**/*.js` menos o próprio catálogo de sprites."""
    partes = []
    for p in sorted((SRC / "scripts").rglob("*.js")):
        if p.name == "00-assets.js":
            continue
        partes.append(p.read_text(encoding="utf-8"))
    return "\n".join(partes)


def mapas_por_bloco(texto_mapas: str) -> dict[str, str]:
    """{map_id: texto_do_bloco} — corta `12-maps.js` em cada entrada de
    `MAPS`, pra poder dizer QUAL mapa referencia uma chave."""
    marcadores = list(re.finditer(r"^  ([a-z_0-9]+): \{", texto_mapas, re.M))
    blocos = {}
    for i, m in enumerate(marcadores):
        fim = marcadores[i + 1].start() if i + 1 < len(marcadores) else len(texto_mapas)
        blocos[m.group(1)] = texto_mapas[m.start():fim]
    return blocos


def eh_dinamica(chave: str) -> bool:
    return any(chave.startswith(p) for p in DYNAMIC_PREFIXES)


def identify_info(path: Path) -> dict:
    try:
        saida = subprocess.run(
            ["identify", "-format", "%w %h %A %m", str(path)],
            capture_output=True, text=True, timeout=10, check=True,
        ).stdout.strip()
        w, h, alpha, fmt = saida.split(None, 3)
        return {"width": int(w), "height": int(h), "has_alpha": alpha != "Undefined", "format": fmt}
    except Exception as exc:  # arquivo corrompido/ilegível — reporta e segue
        return {"width": None, "height": None, "has_alpha": None, "format": None, "erro": str(exc)}


def auditar() -> dict:
    catalogo = carregar_catalogo()
    catalogo_por_key = {a["key"]: a for a in catalogo["assets"]}
    ocorrencias_sd = carregar_sprite_data()
    codigo_consumidor = carregar_codigo_consumidor()
    texto_mapas = (SRC / "scripts" / "world" / "12-maps.js").read_text(encoding="utf-8")
    blocos_mapa = mapas_por_bloco(texto_mapas)

    contagem_sd: dict[str, list[tuple[str, int]]] = {}
    for k, v, ln in ocorrencias_sd:
        contagem_sd.setdefault(k, []).append((v, ln))

    por_sha: dict[str, list[str]] = {}
    itens = []
    for key, asset in sorted(catalogo_por_key.items()):
        caminho = SRC / asset["path"]
        status: list[str] = []
        existe = caminho.is_file()
        if not existe:
            status.append("MISSING_FILE")
        else:
            bytes_reais = caminho.stat().st_size
            sha_real = sha256(caminho)
            if bytes_reais != asset["bytes"] or sha_real != asset["sha256"]:
                status.append("CATALOG_MISMATCH")
            por_sha.setdefault(sha_real, []).append(key)

        ocorr = contagem_sd.get(key, [])
        if not ocorr:
            status.append("MISSING_SPRITE_DATA")
        else:
            caminhos_distintos = {c[0] for c in ocorr}
            if len(caminhos_distintos) > 1:
                status.append("DUPLICATE_KEY")

        dinamica = eh_dinamica(key)
        usada_no_codigo = dinamica or (f'"{key}"' in codigo_consumidor) or (f"'{key}'" in codigo_consumidor)
        mapas_consumidores = sorted(mid for mid, bloco in blocos_mapa.items() if key in bloco)
        consumer_count = (1 if usada_no_codigo else 0) + len(mapas_consumidores)
        if consumer_count == 0 and not dinamica:
            status.append("UNUSED")

        dims = identify_info(caminho) if existe else {"width": None, "height": None, "has_alpha": None}
        if existe and dims.get("width") and (dims["width"] > 2048 or dims["height"] > 2048):
            status.append("SUSPICIOUS_DIMENSIONS")

        if not status:
            status.append("OK")

        itens.append({
            "key": key,
            "path": asset["path"],
            "mime": asset.get("mime"),
            "bytes": asset.get("bytes"),
            "sha256": asset.get("sha256"),
            "width": dims.get("width"),
            "height": dims.get("height"),
            "has_alpha": dims.get("has_alpha"),
            "consumer_count": consumer_count,
            "map_consumers": mapas_consumidores,
            "dinamica": dinamica,
            "status": status,
        })

    for sha_, keys_ in por_sha.items():
        if len(keys_) > 1:
            for item in itens:
                if item["key"] in keys_:
                    item["status"] = [s for s in item["status"] if s != "OK"] + ["DUPLICATE_CONTENT"]
                    item["duplicate_of"] = [k for k in keys_ if k != item["key"]]

    orfas_sem_catalogo = sorted(set(contagem_sd) - set(catalogo_por_key))
    for k in orfas_sem_catalogo:
        itens.append({
            "key": k, "path": None, "status": ["MISSING_CATALOG"],
            "map_consumers": sorted(mid for mid, bloco in blocos_mapa.items() if k in bloco),
        })

    itens.sort(key=lambda r: r["key"])

    resumo: dict[str, int] = {}
    for item in itens:
        for s in item["status"]:
            resumo[s] = resumo.get(s, 0) + 1

    return {"total": len(itens), "resumo": resumo, "itens": itens}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", type=Path, default=None)
    args = parser.parse_args()

    relatorio = auditar()
    print(f"itens={relatorio['total']}")
    for status, n in sorted(relatorio["resumo"].items()):
        print(f"  {status}: {n}")

    texto = json.dumps(relatorio, ensure_ascii=False, indent=2)
    if args.json:
        args.json.write_text(texto, encoding="utf-8")
        print(f"relatorio_completo={args.json}")
    else:
        print(texto)


if __name__ == "__main__":
    main()
