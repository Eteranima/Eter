from __future__ import annotations

import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def classifier_module():
    spec = importlib.util.spec_from_file_location("classificar_diff", ROOT / "tools" / "classificar_diff.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


class DiffClassifierTest(unittest.TestCase):
    def create_repo(self, changes: dict[str, bytes]) -> tuple[tempfile.TemporaryDirectory[str], Path, str, str]:
        directory = tempfile.TemporaryDirectory()
        repo = Path(directory.name)
        subprocess.run(["git", "init", "-q", str(repo)], check=True)
        (repo / "README.md").write_text("base\n", encoding="utf-8")
        subprocess.run(["git", "-C", str(repo), "add", "."], check=True)
        self.commit(repo, "base")
        base = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()
        for name, content in changes.items():
            path = repo / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
        subprocess.run(["git", "-C", str(repo), "add", "."], check=True)
        self.commit(repo, "mudanca")
        head = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()
        return directory, repo, base, head

    def commit(self, repo: Path, message: str) -> None:
        subprocess.run(
            [
                "git", "-C", str(repo), "-c", "user.name=Teste", "-c",
                "user.email=teste@example.invalid", "commit", "-qm", message,
            ],
            check=True,
        )

    def test_classifica_e_publica_outputs(self) -> None:
        directory, repo, base, head = self.create_repo({"src/scripts/jogo.js": b"let jogo = true;\n", "docs/nota.md": b"nota\n"})
        try:
            output = repo / "classification.json"
            github_output = repo / "github-output.txt"
            completed = subprocess.run(
                [
                    "python3", str(ROOT / "tools" / "classificar_diff.py"), "--repo", str(repo),
                    "--base", base, "--head", head, "--output-json", str(output),
                    "--github-output", str(github_output),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            result = json.loads(completed.stdout)
            self.assertEqual(result["classes"], ["content", "docs"])
            self.assertEqual(result["adapters"], ["node-check", "docs-contract"])
            self.assertFalse(result["large_change"])
            self.assertIn("classes=content,docs", github_output.read_text(encoding="utf-8"))
            self.assertEqual(json.loads(output.read_text(encoding="utf-8")), result)
        finally:
            directory.cleanup()

    def test_mudanca_grande_por_contagem(self) -> None:
        changes = {f"docs/{number}.md": b"x\n" for number in range(25)}
        directory, repo, base, head = self.create_repo(changes)
        try:
            result = classifier_module().classify(repo, base, head)
            self.assertTrue(result["large_change"])
            self.assertIn("large-change", result["adapters"])
        finally:
            directory.cleanup()

    def test_falha_fechado_para_raiz_desconhecida_ou_proibida(self) -> None:
        module = classifier_module()
        self.assertEqual(module.classify_path(".gitignore"), "contract")
        with self.assertRaisesRegex(ValueError, "desconhecida"):
            module.classify_path("arquivo-solto.txt")
        with self.assertRaisesRegex(ValueError, "proibida"):
            module.classify_path("runtime/servico.go")


if __name__ == "__main__":
    unittest.main()
