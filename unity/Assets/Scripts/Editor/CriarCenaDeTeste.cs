using EterAnima.CameraSystem;
using EterAnima.PlayerCore;
using UnityEditor;
using UnityEngine;

namespace EterAnima.EditorTools
{
    /// <summary>
    /// Monta a cena mínima de teste (chão + jogador com CharacterController
    /// + câmera terceira pessoa) com UM clique, em vez de exigir configurar
    /// cada componente manualmente no Inspector. Idempotente: rodar de novo
    /// não duplica nada, só reaproveita o que já existe.
    /// </summary>
    public static class CriarCenaDeTeste
    {
        [MenuItem("Éter Anima/Criar Chão + Jogador + Câmera de Teste")]
        public static void Criar()
        {
            GameObject chao = GameObject.Find("Chao");
            if (chao == null)
            {
                chao = GameObject.CreatePrimitive(PrimitiveType.Plane);
                chao.name = "Chao";
                chao.transform.localScale = new Vector3(5f, 1f, 5f);
            }

            GameObject jogador = GameObject.Find("Jogador");
            if (jogador == null)
            {
                jogador = GameObject.CreatePrimitive(PrimitiveType.Capsule);
                jogador.name = "Jogador";
                jogador.transform.position = new Vector3(0f, 1f, 0f);
                // O Capsule já vem com um CapsuleCollider — troca pelo
                // CharacterController, que é quem resolve colisão/gravidade
                // de verdade (o collider de física comum não serve pra isso).
                Object.DestroyImmediate(jogador.GetComponent<CapsuleCollider>());
                var controlador = jogador.AddComponent<CharacterController>();
                controlador.center = new Vector3(0f, 1f, 0f);
                jogador.AddComponent<JogadorController>();
            }

            Camera camera = Camera.main;
            if (camera != null)
            {
                var cameraScript = camera.GetComponent<CameraTerceiraPessoa>();
                if (cameraScript == null)
                {
                    cameraScript = camera.gameObject.AddComponent<CameraTerceiraPessoa>();
                }
                cameraScript.Alvo = jogador.transform;
            }
            else
            {
                Debug.LogWarning("[Éter Anima] Nenhuma Main Camera encontrada na cena — a câmera terceira pessoa não foi configurada.");
            }

            Selection.activeGameObject = jogador;
            Debug.Log("[Éter Anima] Cena de teste pronta: Chão + Jogador (CharacterController) + Câmera terceira pessoa. Aperta Play e usa WASD/Shift/Espaço.");
        }
    }
}
