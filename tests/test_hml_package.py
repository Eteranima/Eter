from __future__ import annotations

import importlib.util
import json
import tarfile
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def package_module():
    spec = importlib.util.spec_from_file_location("empacotar_hml", ROOT / "tools" / "empacotar_hml.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


class HmlPackageTest(unittest.TestCase):
    def test_pacote_tem_raiz_publica_e_manifesto_contratado(self) -> None:
        package = package_module()
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            public = base / "public"
            (public / "assets").mkdir(parents=True)
            (public / "index.html").write_text("<!doctype html>\n", encoding="utf-8")
            (public / "assets" / "jogo.bin").write_bytes(b"eter")
            files = package.public_files(public)
            archive = base / package.ARCHIVE_NAME
            package.build_archive(public, archive, files)
            manifest = package.build_manifest(
                "a" * 40, archive, package.public_tree_sha256(public, files), "2026-09-01T00:00:00Z"
            )
            self.assertEqual(manifest["source_repository"], "Eteranima/Eter")
            self.assertEqual(manifest["archive_name"], package.ARCHIVE_NAME)
            self.assertEqual(manifest["source_commit"], "a" * 40)
            self.assertRegex(manifest["archive_sha256"], r"^[0-9a-f]{64}$")
            self.assertRegex(manifest["public_tree_sha256"], r"^[0-9a-f]{64}$")
            with tarfile.open(archive, "r:gz") as tar:
                self.assertEqual(sorted(tar.getnames()), ["assets/jogo.bin", "index.html"])
                self.assertTrue(all(not name.startswith("public/") for name in tar.getnames()))

    def test_rejeita_link_simbolico(self) -> None:
        package = package_module()
        with tempfile.TemporaryDirectory() as directory:
            public = Path(directory) / "public"
            public.mkdir()
            (public / "index.html").write_text("ok", encoding="utf-8")
            (public / "link").symlink_to("index.html")
            with self.assertRaises(ValueError):
                package.public_files(public)

    def test_manifesto_serializado_tem_os_campos_obrigatorios(self) -> None:
        required = {
            "source_repository",
            "source_commit",
            "archive_name",
            "archive_sha256",
            "generated_at",
        }
        self.assertTrue(required <= set(json.loads((ROOT / "tests" / "manifest-example.json").read_text(encoding="utf-8"))))


if __name__ == "__main__":
    unittest.main()
