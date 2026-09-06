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
        private const string CaminhoSpriteAndar = "Assets/Art/Characters/protagonista_sheet.png";
        private const string CaminhoSpriteCorrida = "Assets/Art/Characters/protagonista_corrida_sheet.png";
        private const string CaminhoSpritePulo = "Assets/Art/Characters/protagonista_pulo_sheet.png";
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
            }

            // Sempre reaplica as folhas de sprite mais recentes, mesmo se o
            // Jogador já existia — assim, toda vez que uma folha nova chega
            // (corrida, ataque, ...), só precisa rodar o menu de novo em vez
            // de apagar e recriar o Jogador na mão.
            CriarVisualDoPersonagem(jogador.transform);

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
            var visual = pai.Find("Visual");
            if (visual == null)
            {
                var novoVisual = new GameObject("Visual");
                novoVisual.transform.SetParent(pai);
                novoVisual.transform.localPosition = Vector3.zero;
                novoVisual.transform.localScale = Vector3.one * AlturaPersonagem;
                visual = novoVisual.transform;
            }

            if (!visual.TryGetComponent(out SpriteRenderer spriteRenderer)) spriteRenderer = visual.gameObject.AddComponent<SpriteRenderer>();
            if (!visual.TryGetComponent(out PersonagemBillboard billboard)) billboard = visual.gameObject.AddComponent<PersonagemBillboard>();

            if (AssetDatabase.LoadAssetAtPath<Texture2D>(CaminhoSpriteAndar) == null)
            {
                Debug.LogWarning($"[Éter Anima] Sprite do jogador não encontrado em {CaminhoSpriteAndar} — o personagem vai ficar invisível até o arquivo existir.");
                return;
            }

            var quadrosAndar = CarregarQuadrosOrdenados(CaminhoSpriteAndar);
            billboard.QuadrosAndar = quadrosAndar;

            if (AssetDatabase.LoadAssetAtPath<Texture2D>(CaminhoSpriteCorrida) != null)
            {
                billboard.QuadrosCorrida = CarregarQuadrosOrdenados(CaminhoSpriteCorrida);
            }
            else
            {
                Debug.LogWarning($"[Éter Anima] Sprite de corrida não encontrado em {CaminhoSpriteCorrida} — vai usar a pose de andar mesmo correndo.");
                billboard.QuadrosCorrida = quadrosAndar;
            }

            if (AssetDatabase.LoadAssetAtPath<Texture2D>(CaminhoSpritePulo) != null)
            {
                billboard.QuadrosPulo = CarregarQuadrosOrdenados(CaminhoSpritePulo);
            }
            else
            {
                Debug.LogWarning($"[Éter Anima] Sprite de pulo não encontrado em {CaminhoSpritePulo} — vai usar a pose de andar mesmo no ar.");
                billboard.QuadrosPulo = quadrosAndar;
            }
            // Pose parada (coluna do meio, linha "baixo") só pra já aparecer
            // alguma coisa antes do primeiro Update rodar.
            if (quadrosAndar.Length > 1 && quadrosAndar[1] != null) spriteRenderer.sprite = quadrosAndar[1];
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
