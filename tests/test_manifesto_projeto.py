from __future__ import annotations

import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class ManifestoProjetoTest(unittest.TestCase):
    def test_manifesto_static_v1_e_valido(self) -> None:
        completed = subprocess.run(
            ["python3", str(ROOT / "tools" / "verificar_manifesto_projeto.py")],
            check=True,
            capture_output=True,
            text=True,
        )
        self.assertEqual(completed.stdout.strip(), "manifesto_projeto=valido")

    def test_codeowners_minimo(self) -> None:
        self.assertEqual((ROOT / ".github" / "CODEOWNERS").read_text(encoding="utf-8"), "* @Eteranima\n")


if __name__ == "__main__":
    unittest.main()
