using EterAnima.CameraSystem;
using EterAnima.PlayerCore;
using UnityEditor;
using UnityEngine;

namespace EterAnima.EditorTools
{
    /// <summary>
    /// Monta a cena mínima de teste (chão + jogador com CharacterController
    /// e sprite billboard + câmera terceira pessoa) com UM clique, em vez de
    /// exigir configurar cada componente manualmente no Inspector.
    /// Idempotente: rodar de novo não duplica nada, só reaproveita o que já
    /// existe.
    /// </summary>
    public static class CriarCenaDeTeste
    {
        private const string CaminhoSpriteJogador = "Assets/Art/Characters/kael_sheet.png";
        private const float AlturaPersonagem = 1.9f; // mesma altura usada no protótipo Three.js

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
                jogador = new GameObject("Jogador");
                jogador.transform.position = new Vector3(0f, 0f, 0f);

                var controlador = jogador.AddComponent<CharacterController>();
                controlador.center = new Vector3(0f, AlturaPersonagem / 2f, 0f);
                controlador.height = AlturaPersonagem;
                controlador.radius = 0.3f;
                jogador.AddComponent<JogadorController>();

                CriarVisualDoPersonagem(jogador.transform);
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
            Debug.Log("[Éter Anima] Cena de teste pronta: Chão + Jogador (CharacterController + sprite) + Câmera terceira pessoa. Aperta Play e usa WASD/Shift/Espaço.");
        }

        private static void CriarVisualDoPersonagem(Transform pai)
        {
            var visual = new GameObject("Visual");
            visual.transform.SetParent(pai);
            visual.transform.localPosition = Vector3.zero;
            visual.transform.localScale = Vector3.one * AlturaPersonagem;

            var spriteRenderer = visual.AddComponent<SpriteRenderer>();
            var billboard = visual.AddComponent<PersonagemBillboard>();

            var textura = AssetDatabase.LoadAssetAtPath<Texture2D>(CaminhoSpriteJogador);
            if (textura == null)
            {
                Debug.LogWarning($"[Éter Anima] Sprite do jogador não encontrado em {CaminhoSpriteJogador} — o personagem vai ficar invisível até o arquivo existir.");
                return;
            }

            var quadros = CarregarQuadrosOrdenados(CaminhoSpriteJogador);
            billboard.Quadros = quadros;
            // Pose parada (coluna do meio, linha "baixo") só pra já aparecer
            // alguma coisa antes do primeiro Update rodar.
            if (quadros.Length > 1 && quadros[1] != null) spriteRenderer.sprite = quadros[1];
        }

        /// <summary>
        /// Sprites fatiados por ImportadorFolhaDePersonagem viram sub-assets
        /// nomeados "{nomeDaTextura}_{indice}" — carrega todos e devolve num
        /// array de 12 posições na ordem certa (índice = linha*3+coluna).
        /// </summary>
        private static Sprite[] CarregarQuadrosOrdenados(string caminhoTextura)
        {
            var quadros = new Sprite[12];
            foreach (var objeto in AssetDatabase.LoadAllAssetsAtPath(caminhoTextura))
            {
                if (objeto is not Sprite sprite) continue;
                int posUnderscore = sprite.name.LastIndexOf('_');
                if (posUnderscore < 0) continue;
                if (!int.TryParse(sprite.name[(posUnderscore + 1)..], out int indice)) continue;
                if (indice is < 0 or >= 12) continue;
                quadros[indice] = sprite;
            }
            return quadros;
        }
    }
}
