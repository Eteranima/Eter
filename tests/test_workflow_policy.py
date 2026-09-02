from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = (ROOT / ".github" / "workflows" / "hml.yml").read_text(encoding="utf-8")


class WorkflowPolicyTest(unittest.TestCase):
    def test_actions_usam_sha_completo_e_versao_documentada(self) -> None:
        expected = (
            "actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0",
            "actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4.6.2",
            "actions/download-artifact@d3f86a106a0bac45b974a628896c90dbdf5c8093 # v4.3.0",
        )
        for action in expected:
            with self.subTest(action=action):
                self.assertIn(action, WORKFLOW)

    def test_workflow_tem_controles_de_execucao_e_adaptadores(self) -> None:
        for contract in ("fetch-depth: 0", "concurrency:", "timeout-minutes:", "classificar", "node --check"):
            with self.subTest(contract=contract):
                self.assertIn(contract, WORKFLOW)


if __name__ == "__main__":
    unittest.main()
