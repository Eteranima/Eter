from __future__ import annotations

import importlib.util
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
        self.assertEqual(len(catalog["assets"]), 620)
        self.assertEqual(len(catalog["scripts"]), 40)

    def test_nenhum_arquivo_volta_a_ser_monolito(self) -> None:
        maiores = [
            path for path in (ROOT / "src").rglob("*")
            if path.is_file() and path.stat().st_size >= 2 * 1024 * 1024
        ]
        self.assertEqual(maiores, [])

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
