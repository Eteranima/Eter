from __future__ import annotations

import importlib.util
import re
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def carregar_build():
    spec = importlib.util.spec_from_file_location("construir_modular", ROOT / "tools" / "construir_modular.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


class ModularTest(unittest.TestCase):
    def test_arvore_modular_e_integra(self) -> None:
        catalog = carregar_build().validate(ROOT / "src")
        self.assertEqual(catalog["version"], "5.31.0")
        self.assertEqual(len(catalog["assets"]), 639)
        self.assertEqual(len(catalog["scripts"]), 41)

    def test_nenhum_arquivo_volta_a_ser_monolito(self) -> None:
        maiores = [
            path for path in (ROOT / "src").rglob("*")
            if path.is_file() and path.stat().st_size >= 2 * 1024 * 1024
        ]
        self.assertEqual(maiores, [])

    def test_build_carimba_versao_em_toda_imagem_referenciada(self) -> None:
        """Achado real (2026-09-04): imagem é servida com cache-control
        `max-age=31536000, immutable` — revisar o conteúdo de um asset já
        publicado nunca chegava a quem já visitou o jogo. `?v=<build>` em
        todo caminho `assets/...webp`/`.png` dentro dos scripts
        materializados obriga a CDN/navegador a buscar de novo."""
        modulo = carregar_build()
        with tempfile.TemporaryDirectory() as diretorio:
            public = Path(diretorio) / "public"
            modulo.build(ROOT / "src", public)
            padrao = re.compile(r'''(['"])assets/[^'"]+\.(?:webp|png)\?v=\d+\1''')
            arquivos = list((public / "scripts").rglob("*.js"))
            self.assertTrue(arquivos)
            achou_em = [
                caminho for caminho in arquivos
                if padrao.search(caminho.read_text(encoding="utf-8"))
            ]
            self.assertIn(public / "scripts" / "00-assets.js", achou_em)
            self.assertIn(
                public / "scripts" / "characters" / "07-characters.js", achou_em,
            )
            catalogo = (public / "asset-catalog.json").read_text(encoding="utf-8")
            self.assertNotIn("?v=", catalogo, "catálogo não deve carregar query string")

    def test_runtime_preserva_contratos_de_publicacao(self) -> None:
        scripts = "\n".join(
            path.read_text(encoding="utf-8")
            for path in (ROOT / "src" / "scripts").rglob("*.js")
        )
        for contract in (
            "aguardarRecursosDoAutoteste().then(runSelfTests)",
            "const ModificadorCombate =",
            "modificadorCombate: G.modificadorCombate",
            "function chanceAcerto(",
        ):
            with self.subTest(contract=contract):
                self.assertIn(contract, scripts)


if __name__ == "__main__":
    unittest.main()
