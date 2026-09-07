using EterAnima.CameraSystem;
using EterAnima.Combat;
using EterAnima.Mundo;
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
        private const string CaminhoSpriteNpcAnciana = "Assets/Art/Npcs/npc_anciana.png";
        private const string CaminhoSpriteNpcMercador = "Assets/Art/Npcs/npc_mercador.png";
        private const string CaminhoSpriteMobGoblin = "Assets/Art/Monsters/mob_goblin.png";
        private const string CaminhoSpriteMobGoblinAndar = "Assets/Art/Npcs/mob_goblin_sheet.png";
        private const float AlturaPersonagem = 1.9f; // mesma altura usada no protótipo Three.js
        private const float AlturaNpc = 1.8f;
        private const float AlturaMob = 1.4f;

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
            jogador.tag = "Player"; // Mob usa isso pra achar o alvo sem depender de PlayerCore

            if (!jogador.TryGetComponent(out Vida vidaJogador)) vidaJogador = jogador.AddComponent<Vida>();
            if (!jogador.TryGetComponent<JogadorCombate>(out _)) jogador.AddComponent<JogadorCombate>();
            if (!jogador.TryGetComponent(out Inventario inventarioJogador)) inventarioJogador = jogador.AddComponent<Inventario>();
            if (!jogador.TryGetComponent(out JogadorInventario inventarioInputJogador)) inventarioInputJogador = jogador.AddComponent<JogadorInventario>();
            if (!jogador.TryGetComponent(out JogadorInteracao interacaoJogador)) interacaoJogador = jogador.AddComponent<JogadorInteracao>();
            if (!jogador.TryGetComponent<JogadorSave>(out _)) jogador.AddComponent<JogadorSave>();
            inventarioInputJogador.Interacao = interacaoJogador;
            interacaoJogador.Inventario = inventarioJogador;

            // Sempre reaplica as folhas de sprite mais recentes, mesmo se o
            // Jogador já existia — assim, toda vez que uma folha nova chega
            // (corrida, ataque, ...), só precisa rodar o menu de novo em vez
            // de apagar e recriar o Jogador na mão.
            CriarVisualDoPersonagem(jogador.transform);
            CriarMobDeTreino();
            CriarNpcDeTeste();
            CriarLojaDeTeste();
            CriarPickupsDeTeste();
            CriarHud(vidaJogador, inventarioJogador, interacaoJogador);

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
            Debug.Log("[Éter Anima] Cena de teste pronta. WASD/Shift/Espaço move, clique/J ataca, clique-direito/K conjura, 1-5 usa/equipa item, E conversa/compra (1-4 na loja), F5 salva, F9 carrega.");
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
            var mob = GameObject.Find("MobDeTreino");
            if (mob != null && mob.transform.Find("Visual") == null)
            {
                // Versão antiga (cápsula primitiva sem sprite) — recria do
                // zero em vez de tentar remendar mesh/collider da primitiva.
                Object.DestroyImmediate(mob);
                mob = null;
            }

            if (mob == null)
            {
                mob = new GameObject("MobDeTreino");
                mob.transform.position = new Vector3(0f, 0f, 4f);
                var colisor = mob.AddComponent<CapsuleCollider>();
                colisor.center = new Vector3(0f, AlturaMob / 2f, 0f);
                colisor.height = AlturaMob;
                colisor.radius = 0.35f;
                mob.AddComponent<Vida>();
                mob.AddComponent<Mob>();
            }

            CriarVisualDoMob(mob.transform);
        }

        /// <summary>Visual do goblin: prefere a folha animada (3×4, ciclo
        /// de andar) e cai pra pose estática única se ela ainda não
        /// existir. Faz upgrade automático de uma versão anterior parada
        /// pra animada (remove o BillboardSimples se achar um).</summary>
        private static void CriarVisualDoMob(Transform pai)
        {
            var visual = pai.Find("Visual");
            if (visual == null)
            {
                var novoVisual = new GameObject("Visual");
                novoVisual.transform.SetParent(pai);
                novoVisual.transform.localPosition = new Vector3(0f, AlturaMob * 0.5f, 0f);
                novoVisual.transform.localScale = Vector3.one * AlturaMob;
                visual = novoVisual.transform;
            }

            if (!visual.TryGetComponent(out SpriteRenderer spriteRenderer)) spriteRenderer = visual.gameObject.AddComponent<SpriteRenderer>();

            if (AssetDatabase.LoadAssetAtPath<Texture2D>(CaminhoSpriteMobGoblinAndar) != null)
            {
                if (visual.TryGetComponent<BillboardSimples>(out var billboardAntigo)) Object.DestroyImmediate(billboardAntigo);
                if (!visual.TryGetComponent(out InimigoBillboard billboard)) billboard = visual.gameObject.AddComponent<InimigoBillboard>();

                var quadros = CarregarQuadrosOrdenados(CaminhoSpriteMobGoblinAndar);
                billboard.QuadrosAndar = quadros;
                visual.localScale = Vector3.one * AlturaMob;
                if (quadros.Length > 1 && quadros[1] != null) spriteRenderer.sprite = quadros[1];
                return;
            }

            Debug.LogWarning($"[Éter Anima] Folha animada do goblin não encontrada em {CaminhoSpriteMobGoblinAndar} — usando a pose estática como substituta.");
            var spriteEstatico = AssetDatabase.LoadAssetAtPath<Sprite>(CaminhoSpriteMobGoblin);
            if (spriteEstatico == null)
            {
                Debug.LogWarning($"[Éter Anima] Sprite do mob não encontrado em {CaminhoSpriteMobGoblin} — o mob vai ficar invisível até algum dos dois arquivos existir.");
            }
            CriarVisualEstatico(pai, spriteEstatico, AlturaMob);
        }

        private static void CriarNpcDeTeste()
        {
            var npc = GameObject.Find("NpcAnciana");
            if (npc == null)
            {
                npc = new GameObject("NpcAnciana");
                npc.transform.position = new Vector3(-3f, 0f, 2f);
                npc.AddComponent<Npc>();
            }

            // Trigger, não sólido: NPC não deve travar o CharacterController
            // do jogador (física "esquisita" relatada ao vivo) — só precisa
            // ser detectável pelo OverlapSphere de JogadorInteracao.
            if (!npc.TryGetComponent(out CapsuleCollider colisorNpc)) colisorNpc = npc.AddComponent<CapsuleCollider>();
            colisorNpc.center = new Vector3(0f, AlturaNpc / 2f, 0f);
            colisorNpc.height = AlturaNpc;
            colisorNpc.radius = 0.35f;
            colisorNpc.isTrigger = true;

            var quadros = AssetDatabase.LoadAssetAtPath<Texture2D>(CaminhoSpriteNpcAnciana) != null
                ? CarregarQuadrosOrdenados(CaminhoSpriteNpcAnciana)
                : null;
            var spriteIdle = quadros != null && quadros.Length > 1 ? quadros[1] : null; // linha baixo, coluna do meio
            if (spriteIdle == null)
            {
                Debug.LogWarning($"[Éter Anima] Sprite do NPC não encontrado em {CaminhoSpriteNpcAnciana} — o NPC vai ficar invisível até o arquivo existir.");
            }
            CriarVisualEstatico(npc.transform, spriteIdle, AlturaNpc);
        }

        private static void CriarLojaDeTeste()
        {
            var loja = GameObject.Find("LojaMercador");
            if (loja == null)
            {
                loja = new GameObject("LojaMercador");
                loja.transform.position = new Vector3(3f, 0f, -2f);
                loja.AddComponent<Loja>();
            }

            if (!loja.TryGetComponent(out CapsuleCollider colisorLoja)) colisorLoja = loja.AddComponent<CapsuleCollider>();
            colisorLoja.center = new Vector3(0f, AlturaNpc / 2f, 0f);
            colisorLoja.height = AlturaNpc;
            colisorLoja.radius = 0.35f;
            colisorLoja.isTrigger = true; // não bloqueia passagem, mesma razão do NpcAnciana

            var quadros = AssetDatabase.LoadAssetAtPath<Texture2D>(CaminhoSpriteNpcMercador) != null
                ? CarregarQuadrosOrdenados(CaminhoSpriteNpcMercador)
                : null;
            var spriteIdle = quadros != null && quadros.Length > 1 ? quadros[1] : null;
            if (spriteIdle == null)
            {
                Debug.LogWarning($"[Éter Anima] Sprite do mercador não encontrado em {CaminhoSpriteNpcMercador} — vai ficar invisível até o arquivo existir.");
            }
            CriarVisualEstatico(loja.transform, spriteIdle, AlturaNpc);
        }

        /// <summary>Sprite de pose única (sem folha de andar/pulo) num
        /// filho "Visual" que só encara a câmera — usado por mob e NPC
        /// parados. Escala pra ficar com `altura` metros de alto,
        /// preservando a proporção original da imagem.</summary>
        private static void CriarVisualEstatico(Transform pai, Sprite sprite, float altura)
        {
            var visual = pai.Find("Visual");
            if (visual == null)
            {
                var novoVisual = new GameObject("Visual");
                novoVisual.transform.SetParent(pai);
                novoVisual.transform.localPosition = new Vector3(0f, altura * 0.5f, 0f);
                visual = novoVisual.transform;
            }

            if (!visual.TryGetComponent(out SpriteRenderer spriteRenderer)) spriteRenderer = visual.gameObject.AddComponent<SpriteRenderer>();
            if (!visual.TryGetComponent<BillboardSimples>(out _)) visual.gameObject.AddComponent<BillboardSimples>();

            if (sprite == null) return;
            spriteRenderer.sprite = sprite;

            float alturaSpriteEmMundo = sprite.rect.height / sprite.pixelsPerUnit;
            if (alturaSpriteEmMundo > 0f)
            {
                visual.localScale = Vector3.one * (altura / alturaSpriteEmMundo);
            }
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

        private static Transform ObterOuCriarCanvas()
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
            return canvasGO.transform;
        }

        private static void CriarHud(Vida vidaJogador, Inventario inventarioJogador, JogadorInteracao interacaoJogador)
        {
            var canvas = ObterOuCriarCanvas();

            var preenchimentoHp = CriarBarra(canvas, "BarraHp", new Vector2(24f, -24f),
                new Color(0.15f, 0.15f, 0.15f, 0.85f), new Color(0.8f, 0.15f, 0.15f));
            var preenchimentoMana = CriarBarra(canvas, "BarraMana", new Vector2(24f, -52f),
                new Color(0.15f, 0.15f, 0.15f, 0.85f), new Color(0.2f, 0.4f, 0.9f));

            if (!canvas.TryGetComponent(out HudVida hud)) hud = canvas.gameObject.AddComponent<HudVida>();
            hud.Vida = vidaJogador;
            hud.PreenchimentoHp = preenchimentoHp;
            hud.PreenchimentoMana = preenchimentoMana;

            var textoInventario = CriarTextoSimples(canvas, "TextoInventario", new Vector2(24f, -84f), new Vector2(280f, 140f), "(inventário vazio)");
            if (!canvas.TryGetComponent(out HudInventario hudInventario)) hudInventario = canvas.gameObject.AddComponent<HudInventario>();
            hudInventario.Inventario = inventarioJogador;
            hudInventario.Texto = textoInventario;

            var textoDica = CriarTextoSimples(canvas, "TextoDica", new Vector2(24f, -232f), new Vector2(320f, 26f), "Aperte E pra falar");
            textoDica.gameObject.SetActive(false);

            var (painelDialogo, textoNomeDialogo, textoFalaDialogo) = CriarPainelDialogo(canvas);
            if (!canvas.TryGetComponent(out HudDialogo hudDialogo)) hudDialogo = canvas.gameObject.AddComponent<HudDialogo>();
            hudDialogo.Painel = painelDialogo;
            hudDialogo.TextoNome = textoNomeDialogo;
            hudDialogo.TextoFala = textoFalaDialogo;

            interacaoJogador.Dialogo = hudDialogo;
            interacaoJogador.TextoDica = textoDica;

            var (painelLoja, textoLoja) = CriarPainelLoja(canvas);
            if (!canvas.TryGetComponent(out HudLoja hudLoja)) hudLoja = canvas.gameObject.AddComponent<HudLoja>();
            hudLoja.Painel = painelLoja;
            hudLoja.Texto = textoLoja;
            interacaoJogador.HudLoja = hudLoja;
        }

        /// <summary>Painel de compra centralizado na tela, escondido por
        /// padrão — HudLoja mostra/some e monta a lista com preços.</summary>
        private static (GameObject painel, Text texto) CriarPainelLoja(Transform pai)
        {
            var existente = pai.Find("PainelLoja");
            if (existente != null)
            {
                return (existente.gameObject, existente.Find("Texto")?.GetComponent<Text>());
            }

            var painelGO = new GameObject("PainelLoja", typeof(RectTransform), typeof(Image));
            painelGO.transform.SetParent(pai, false);
            var painelRect = (RectTransform)painelGO.transform;
            painelRect.anchorMin = new Vector2(0.5f, 0.5f);
            painelRect.anchorMax = new Vector2(0.5f, 0.5f);
            painelRect.pivot = new Vector2(0.5f, 0.5f);
            painelRect.anchoredPosition = Vector2.zero;
            painelRect.sizeDelta = new Vector2(420f, 280f);
            painelGO.GetComponent<Image>().color = new Color(0f, 0f, 0f, 0.9f);

            var textoGO = new GameObject("Texto", typeof(RectTransform), typeof(Text));
            textoGO.transform.SetParent(painelGO.transform, false);
            var textoRect = (RectTransform)textoGO.transform;
            textoRect.anchorMin = Vector2.zero;
            textoRect.anchorMax = Vector2.one;
            textoRect.offsetMin = new Vector2(20f, 16f);
            textoRect.offsetMax = new Vector2(-20f, -16f);
            var texto = textoGO.GetComponent<Text>();
            texto.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            texto.fontSize = 18;
            texto.color = Color.white;
            texto.alignment = TextAnchor.UpperLeft;

            painelGO.SetActive(false);
            return (painelGO, texto);
        }

        private static Text CriarTextoSimples(Transform pai, string nome, Vector2 posicaoAncorada, Vector2 tamanho, string textoInicial)
        {
            var existente = pai.Find(nome);
            if (existente != null) return existente.GetComponent<Text>();

            var textoGO = new GameObject(nome, typeof(RectTransform), typeof(Text));
            textoGO.transform.SetParent(pai, false);
            var rect = (RectTransform)textoGO.transform;
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = posicaoAncorada;
            rect.sizeDelta = tamanho;

            var texto = textoGO.GetComponent<Text>();
            texto.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            texto.fontSize = 16;
            texto.color = Color.white;
            texto.alignment = TextAnchor.UpperLeft;
            texto.text = textoInicial;
            return texto;
        }

        /// <summary>Caixa de diálogo (nome + fala) ancorada embaixo-centro
        /// da tela, escondida por padrão — HudDialogo mostra/some e troca
        /// o texto.</summary>
        private static (GameObject painel, Text nome, Text fala) CriarPainelDialogo(Transform pai)
        {
            var existente = pai.Find("PainelDialogo");
            if (existente != null)
            {
                var nomeExistente = existente.Find("TextoNome")?.GetComponent<Text>();
                var falaExistente = existente.Find("TextoFala")?.GetComponent<Text>();
                return (existente.gameObject, nomeExistente, falaExistente);
            }

            var painelGO = new GameObject("PainelDialogo", typeof(RectTransform), typeof(Image));
            painelGO.transform.SetParent(pai, false);
            var painelRect = (RectTransform)painelGO.transform;
            painelRect.anchorMin = new Vector2(0.5f, 0f);
            painelRect.anchorMax = new Vector2(0.5f, 0f);
            painelRect.pivot = new Vector2(0.5f, 0f);
            painelRect.anchoredPosition = new Vector2(0f, 40f);
            painelRect.sizeDelta = new Vector2(720f, 140f);
            painelGO.GetComponent<Image>().color = new Color(0f, 0f, 0f, 0.85f);

            var nomeGO = new GameObject("TextoNome", typeof(RectTransform), typeof(Text));
            nomeGO.transform.SetParent(painelGO.transform, false);
            var nomeRect = (RectTransform)nomeGO.transform;
            nomeRect.anchorMin = new Vector2(0f, 1f);
            nomeRect.anchorMax = new Vector2(1f, 1f);
            nomeRect.pivot = new Vector2(0f, 1f);
            nomeRect.anchoredPosition = new Vector2(20f, -12f);
            nomeRect.sizeDelta = new Vector2(-40f, 28f);
            var textoNome = nomeGO.GetComponent<Text>();
            textoNome.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            textoNome.fontSize = 20;
            textoNome.fontStyle = FontStyle.Bold;
            textoNome.color = new Color(1f, 0.85f, 0.4f);

            var falaGO = new GameObject("TextoFala", typeof(RectTransform), typeof(Text));
            falaGO.transform.SetParent(painelGO.transform, false);
            var falaRect = (RectTransform)falaGO.transform;
            falaRect.anchorMin = Vector2.zero;
            falaRect.anchorMax = Vector2.one;
            falaRect.offsetMin = new Vector2(20f, 16f);
            falaRect.offsetMax = new Vector2(-20f, -44f);
            var textoFala = falaGO.GetComponent<Text>();
            textoFala.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            textoFala.fontSize = 18;
            textoFala.color = Color.white;
            textoFala.alignment = TextAnchor.UpperLeft;

            painelGO.SetActive(false);
            return (painelGO, textoNome, textoFala);
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
