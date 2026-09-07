using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace EterAnima.UI
{
    /// <summary>
    /// Minimapa em espaço de UI, não câmera-em-cima-com-RenderTexture —
    /// decisão deliberada: os billboards do jogo (PersonagemBillboard,
    /// InimigoBillboard, BillboardSimples) sempre encaram Camera.main, então
    /// vistos de cima por uma segunda câmera eles ficariam de perfil,
    /// praticamente invisíveis. Em vez disso, cada alvo registrado vira um
    /// "blip" (Image) cuja posição no painel é a projeção XZ da posição de
    /// mundo relativa ao jogador — sempre centralizado nele.
    /// </summary>
    public class HudMinimapa : MonoBehaviour
    {
        [SerializeField] private RectTransform area;
        [SerializeField] private Transform jogador;
        [SerializeField] private float alcanceMundo = 12f; // metade da largura do painel, em unidades de mundo

        private readonly List<(Transform alvo, RectTransform blip)> _rastreados = new();

        public RectTransform Area { set => area = value; }
        public Transform Jogador { set => jogador = value; }

        /// <summary>Cria um blip novo pro alvo — chamar só uma vez por
        /// alvo (CriarCenaDeTeste já guarda isso via childCount==0).</summary>
        public void Registrar(Transform alvo, Color cor, float tamanho = 8f)
        {
            if (area == null || alvo == null) return;

            var blipGO = new GameObject("Blip", typeof(RectTransform), typeof(Image));
            blipGO.transform.SetParent(area, false);
            var rect = (RectTransform)blipGO.transform;
            rect.anchorMin = new Vector2(0.5f, 0.5f);
            rect.anchorMax = new Vector2(0.5f, 0.5f);
            rect.pivot = new Vector2(0.5f, 0.5f);
            rect.sizeDelta = new Vector2(tamanho, tamanho);
            blipGO.GetComponent<Image>().color = cor;

            _rastreados.Add((alvo, rect));
        }

        private void LateUpdate()
        {
            if (area == null || jogador == null) return;
            float metadeArea = area.rect.width * 0.5f;

            foreach (var (alvo, blip) in _rastreados)
            {
                if (alvo == null)
                {
                    blip.gameObject.SetActive(false);
                    continue;
                }

                Vector3 delta = alvo.position - jogador.position;
                float x = Mathf.Clamp(delta.x / alcanceMundo, -1f, 1f) * metadeArea;
                float z = Mathf.Clamp(delta.z / alcanceMundo, -1f, 1f) * metadeArea;

                // Mesma convenção de eixo-de-mundo já usada em
                // JogadorController/Mob: +X é Esquerda, +Z é Baixo (perto
                // da câmera) — no painel (Y positivo = "cima" da UI),
                // ambos precisam de sinal invertido.
                blip.gameObject.SetActive(true);
                blip.anchoredPosition = new Vector2(-x, -z);
            }
        }
    }
}
