using EterAnima.CameraSystem;
using EterAnima.Combat;
using EterAnima.PlayerCore;
using EterAnima.UI;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

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
        private const string CaminhoSpriteAtaque = "Assets/Art/Characters/protagonista_ataque_sheet.png";
        private const string CaminhoSpriteAtaqueAereo = "Assets/Art/Characters/protagonista_ataque_aereo_sheet.png";
        private const string CaminhoSpriteMagia = "Assets/Art/Characters/protagonista_magia_sheet.png";
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

            if (!jogador.TryGetComponent(out Vida vidaJogador)) vidaJogador = jogador.AddComponent<Vida>();
            if (!jogador.TryGetComponent<JogadorCombate>(out _)) jogador.AddComponent<JogadorCombate>();
            if (!jogador.TryGetComponent(out Inventario inventarioJogador)) inventarioJogador = jogador.AddComponent<Inventario>();
            if (!jogador.TryGetComponent<JogadorInventario>(out _)) jogador.AddComponent<JogadorInventario>();

            // Sempre reaplica as folhas de sprite mais recentes, mesmo se o
            // Jogador já existia — assim, toda vez que uma folha nova chega
            // (corrida, ataque, ...), só precisa rodar o menu de novo em vez
            // de apagar e recriar o Jogador na mão.
            CriarVisualDoPersonagem(jogador.transform);
            CriarMobDeTreino();
            CriarPickupsDeTeste();
            CriarHud(vidaJogador, inventarioJogador);

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

            CarregarOuAvisar(quadrosAndar, CaminhoSpriteCorrida, "corrida", f => billboard.QuadrosCorrida = f);
            CarregarOuAvisar(quadrosAndar, CaminhoSpritePulo, "pulo", f => billboard.QuadrosPulo = f);
            CarregarOuAvisar(quadrosAndar, CaminhoSpriteAtaque, "ataque", f => billboard.QuadrosAtaque = f);
            CarregarOuAvisar(quadrosAndar, CaminhoSpriteAtaqueAereo, "ataque aéreo", f => billboard.QuadrosAtaqueAereo = f);
            CarregarOuAvisar(quadrosAndar, CaminhoSpriteMagia, "magia", f => billboard.QuadrosMagia = f);

            // Pose parada (coluna do meio, linha "baixo") só pra já aparecer
            // alguma coisa antes do primeiro Update rodar.
            if (quadrosAndar.Length > 1 && quadrosAndar[1] != null) spriteRenderer.sprite = quadrosAndar[1];
        }

        /// <summary>Carrega a folha indicada se o arquivo existir; senão
        /// avisa e usa a pose de andar como substituta (nunca deixa o
        /// campo vazio/null, que faria o personagem sumir naquele
        /// estado).</summary>
        private static void CarregarOuAvisar(Sprite[] quadrosAndar, string caminho, string nomeAmigavel, System.Action<Sprite[]> aplicar)
        {
            if (AssetDatabase.LoadAssetAtPath<Texture2D>(caminho) != null)
            {
                aplicar(CarregarQuadrosOrdenados(caminho));
            }
            else
            {
                Debug.LogWarning($"[Éter Anima] Sprite de {nomeAmigavel} não encontrado em {caminho} — vai usar a pose de andar como substituta.");
                aplicar(quadrosAndar);
            }
        }

        private static void CriarMobDeTreino()
        {
            if (GameObject.Find("MobDeTreino") != null) return;

            var mob = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            mob.name = "MobDeTreino";
            mob.transform.position = new Vector3(0f, 1f, 3f);
            mob.GetComponent<Renderer>().material.color = new Color(0.3f, 0.6f, 0.3f);
            mob.AddComponent<Vida>();
            mob.AddComponent<Mob>();
        }

        private static void CriarPickupsDeTeste()
        {
            CriarPickup("PickupEspada", new Vector3(1.5f, 0.5f, 1.5f), "espada_treino", new Color(0.8f, 0.8f, 0.2f));
            CriarPickup("PickupPocao", new Vector3(-1.5f, 0.5f, 1.5f), "pocao_vida", new Color(0.9f, 0.2f, 0.5f));
        }

        private static void CriarPickup(string nome, Vector3 posicao, string itemId, Color cor)
        {
            if (GameObject.Find(nome) != null) return;

            var pickup = GameObject.CreatePrimitive(PrimitiveType.Cube);
            pickup.name = nome;
            pickup.transform.position = posicao;
            pickup.transform.localScale = Vector3.one * 0.4f;
            pickup.GetComponent<Renderer>().material.color = cor;
            pickup.GetComponent<Collider>().isTrigger = true;
            var item = pickup.AddComponent<ItemPickup>();
            var serializado = new SerializedObject(item);
            serializado.FindProperty("itemId").stringValue = itemId;
            serializado.ApplyModifiedPropertiesWithoutUndo();
        }

        private static void CriarHud(Vida vidaJogador, Inventario inventarioJogador)
        {
            var canvasGO = GameObject.Find("HudCanvas");
            if (canvasGO == null)
            {
                canvasGO = new GameObject("HudCanvas", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
                var canvas = canvasGO.GetComponent<Canvas>();
                canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                var escala = canvasGO.GetComponent<CanvasScaler>();
                escala.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
                escala.referenceResolution = new Vector2(1920f, 1080f);
            }

            var preenchimentoHp = CriarBarra(canvasGO.transform, "BarraHp", new Vector2(24f, -24f),
                new Color(0.15f, 0.15f, 0.15f, 0.85f), new Color(0.8f, 0.15f, 0.15f));
            var preenchimentoMana = CriarBarra(canvasGO.transform, "BarraMana", new Vector2(24f, -52f),
                new Color(0.15f, 0.15f, 0.15f, 0.85f), new Color(0.2f, 0.4f, 0.9f));

            if (!canvasGO.TryGetComponent(out HudVida hud)) hud = canvasGO.AddComponent<HudVida>();
            hud.Vida = vidaJogador;
            hud.PreenchimentoHp = preenchimentoHp;
            hud.PreenchimentoMana = preenchimentoMana;

            var textoInventario = CriarTextoInventario(canvasGO.transform, new Vector2(24f, -84f));
            if (!canvasGO.TryGetComponent(out HudInventario hudInventario)) hudInventario = canvasGO.AddComponent<HudInventario>();
            hudInventario.Inventario = inventarioJogador;
            hudInventario.Texto = textoInventario;
        }

        private static Text CriarTextoInventario(Transform pai, Vector2 posicaoAncorada)
        {
            var existente = pai.Find("TextoInventario");
            if (existente != null) return existente.GetComponent<Text>();

            var textoGO = new GameObject("TextoInventario", typeof(RectTransform), typeof(Text));
            textoGO.transform.SetParent(pai, false);
            var rect = (RectTransform)textoGO.transform;
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = posicaoAncorada;
            rect.sizeDelta = new Vector2(280f, 140f);

            var texto = textoGO.GetComponent<Text>();
            texto.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            texto.fontSize = 16;
            texto.color = Color.white;
            texto.alignment = TextAnchor.UpperLeft;
            texto.text = "(inventário vazio)";
            return texto;
        }

        /// <summary>Cria (ou reaproveita) uma barra simples: fundo fixo +
        /// preenchimento cujo anchorMax.x o HudVida ajusta a cada frame.
        /// Retorna o RectTransform do preenchimento.</summary>
        private static RectTransform CriarBarra(Transform pai, string nome, Vector2 posicaoAncorada, Color corFundo, Color corPreenchimento)
        {
            var existente = pai.Find(nome);
            if (existente != null)
            {
                return existente.Find("Preenchimento") as RectTransform;
            }

            var fundoGO = new GameObject(nome, typeof(RectTransform), typeof(Image));
            fundoGO.transform.SetParent(pai, false);
            var fundoRect = (RectTransform)fundoGO.transform;
            fundoRect.anchorMin = new Vector2(0f, 1f);
            fundoRect.anchorMax = new Vector2(0f, 1f);
            fundoRect.pivot = new Vector2(0f, 1f);
            fundoRect.anchoredPosition = posicaoAncorada;
            fundoRect.sizeDelta = new Vector2(240f, 22f);
            fundoGO.GetComponent<Image>().color = corFundo;

            var preenchimentoGO = new GameObject("Preenchimento", typeof(RectTransform), typeof(Image));
            preenchimentoGO.transform.SetParent(fundoGO.transform, false);
            var preenchimentoRect = (RectTransform)preenchimentoGO.transform;
            preenchimentoRect.anchorMin = Vector2.zero;
            preenchimentoRect.anchorMax = Vector2.one; // HudVida ajusta anchorMax.x a cada frame
            preenchimentoRect.offsetMin = Vector2.zero;
            preenchimentoRect.offsetMax = Vector2.zero;
            preenchimentoGO.GetComponent<Image>().color = corPreenchimento;

            return preenchimentoRect;
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
