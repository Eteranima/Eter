from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class ContratosVigentesTest(unittest.TestCase):
    def test_repositorio_contem_apenas_superficie_estatica(self) -> None:
        prohibited = {"deploy", "runtime", "scripts", "public", "historico", "Temp"}
        present = {path.name for path in ROOT.iterdir() if path.is_dir()}
        self.assertFalse(prohibited & present)

    def test_fonte_nao_referencia_componentes_de_servidor(self) -> None:
        prohibited = (
            "backend",
            "oauth",
            "oidc",
            "websocket",
            "socket.io",
            "postgres",
            "mysql",
            "sqlite",
            "mongodb",
            "firebase",
            "supabase",
            "multiplayer",
        )
        source = "\n".join(
            path.read_text(encoding="utf-8").lower()
            for path in sorted((ROOT / "src").rglob("*"))
            if path.suffix in {".html", ".css", ".js", ".json"}
        )
        for term in prohibited:
            with self.subTest(term=term):
                self.assertNotIn(term, source)

    def test_automacao_nao_declarar_segredos(self) -> None:
        workflow = (ROOT / ".github" / "workflows" / "hml.yml").read_text(encoding="utf-8").lower()
        self.assertNotIn("secrets.", workflow)
        self.assertIn("contents: write", workflow)

    def test_validador_cobre_o_contrato_estatico(self) -> None:
        validator = (ROOT / "tests" / "validar_hml_estatica.py").read_text(encoding="utf-8")
        for category in ("backend", "autenticação", "banco de dados", "multiplayer", "segredo versionado"):
            with self.subTest(category=category):
                self.assertIn(category, validator)


if __name__ == "__main__":
    unittest.main()
