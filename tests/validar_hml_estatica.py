#!/usr/bin/env python3
"""Bloqueia referências ativas a componentes fora do contrato estático."""

from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ACTIVE_PATHS = (ROOT / "src", ROOT / "tools", ROOT / ".github")
FORBIDDEN = {
    "backend": ("backend",),
    "autenticação": ("oauth", "oidc", "auth0", "login"),
    "banco de dados": ("banco de dados", "postgres", "mysql", "sqlite", "mongodb", "firebase", "supabase"),
    "multiplayer": ("multiplayer", "websocket", "socket.io"),
    "segredo versionado": ("api_key", "private_key", "client_secret", "password="),
}
TEXT_SUFFIXES = {".css", ".html", ".js", ".json", ".py", ".yml", ".yaml"}


def fail(message: str) -> None:
    print(f"ERRO: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    for root in ACTIVE_PATHS:
        for path in sorted(root.rglob("*")):
            if path.is_symlink():
                fail(f"link simbólico não permitido: {path.relative_to(ROOT)}")
            if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
                continue
            content = path.read_text(encoding="utf-8").lower()
            for category, terms in FORBIDDEN.items():
                if any(term in content for term in terms):
                    fail(f"referência a {category}: {path.relative_to(ROOT)}")
    workflow = ROOT / ".github" / "workflows" / "hml.yml"
    if "secrets." in workflow.read_text(encoding="utf-8").lower():
        fail("workflow referencia secret configurável")
    print("hml_estatica=valida")


if __name__ == "__main__":
    main()
