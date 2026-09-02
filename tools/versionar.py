#!/usr/bin/env python3
"""Incrementa o campo secundário de APP_VERSION quando o HTML completo muda."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


VERSION_RE = re.compile(r"(\bAPP_VERSION\s*=\s*['\"])([^'\"]+)(['\"])")


def ler_versao(texto: str) -> str | None:
    """Retorna a versão declarada em APP_VERSION, ou None quando ausente."""
    achado = VERSION_RE.search(texto)
    return achado.group(2) if achado else None


def proxima_versao(versao: str) -> str:
    """Soma um ao segundo campo e zera o terceiro, preservando o primeiro.

    Args:
        versao: versão atual no formato `MAIOR.MENOR.CORRECAO`.

    Returns:
        A versão seguinte, por exemplo `3.3.0` vira `3.4.0`.

    Raises:
        ValueError: quando a versão não possui três campos numéricos.
    """
    campos = versao.strip().split(".")
    if len(campos) != 3 or not all(campo.isdigit() for campo in campos):
        raise ValueError(f"Versão fora do formato MAIOR.MENOR.CORRECAO: {versao!r}")
    return f"{int(campos[0])}.{int(campos[1]) + 1}.0"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--anterior", type=Path, default=None)
    args = parser.parse_args()

    texto = args.source.read_text(encoding="utf-8")
    atual = ler_versao(texto)
    if atual is None:
        print("versionamento=ignorado motivo=sem-APP_VERSION")
        return

    anterior = None
    if args.anterior is not None and args.anterior.exists():
        anterior = ler_versao(args.anterior.read_text(encoding="utf-8"))

    if anterior is not None and anterior != atual:
        print(f"versionamento=manual versao={atual} anterior={anterior}")
        return

    nova = proxima_versao(atual)
    args.source.write_text(VERSION_RE.sub(rf"\g<1>{nova}\g<3>", texto, count=1), encoding="utf-8")
    print(f"versionamento=automatico versao={nova} anterior={atual}")


if __name__ == "__main__":
    main()
