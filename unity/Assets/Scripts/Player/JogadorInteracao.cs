using EterAnima.Combat;
using EterAnima.Mundo;
using EterAnima.UI;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;

namespace EterAnima.PlayerCore
{
    /// <summary>Tecla E: conversa com o NPC mais próximo, entra na loja
    /// mais próxima, ou avança/fecha o que já estiver aberto. Enquanto
    /// diálogo/loja está aberto, teclas 1-4 compram (loja) e
    /// JogadorInventario para de reagir a 1-5 (ver Bloqueado).</summary>
    public class JogadorInteracao : MonoBehaviour
    {
        [SerializeField] private float raioInteracao = 2.2f;
        [SerializeField] private HudDialogo dialogo;
        [SerializeField] private HudLoja hudLoja;
        [SerializeField] private Text textoDica;
        [SerializeField] private Inventario inventario;

        private Loja _lojaAberta;

        public HudDialogo Dialogo { set => dialogo = value; }
        public HudLoja HudLoja { set => hudLoja = value; }
        public Text TextoDica { set => textoDica = value; }
        public Inventario Inventario { set => inventario = value; }

        /// <summary>Outros sistemas de input do jogador (JogadorInventario)
        /// checam isso pra não disparar ação junto com diálogo/compra.</summary>
        public bool Bloqueado => (dialogo != null && dialogo.Aberto) || _lojaAberta != null;

        private void Update()
        {
            var teclado = Keyboard.current;
            if (teclado == null) return;

            if (_lojaAberta != null)
            {
                AtualizarPainelLoja();
                if (teclado.digit1Key.wasPressedThisFrame) TentarComprar(0);
                if (teclado.digit2Key.wasPressedThisFrame) TentarComprar(1);
                if (teclado.digit3Key.wasPressedThisFrame) TentarComprar(2);
                if (teclado.digit4Key.wasPressedThisFrame) TentarComprar(3);
                if (teclado.eKey.wasPressedThisFrame) FecharLoja();
                return;
            }

            var npcProximo = EncontrarProximo<Npc>();
            var lojaProxima = EncontrarProximo<Loja>();

            if (textoDica != null)
            {
                bool mostrarDica = (npcProximo != null || lojaProxima != null) && (dialogo == null || !dialogo.Aberto);
                textoDica.gameObject.SetActive(mostrarDica);
            }

            if (!teclado.eKey.wasPressedThisFrame) return;

            if (dialogo != null && dialogo.Aberto)
            {
                dialogo.AvancarOuFechar();
            }
            else if (lojaProxima != null)
            {
                AbrirLoja(lojaProxima);
            }
            else if (npcProximo != null)
            {
                dialogo?.Iniciar(npcProximo.Nome, npcProximo.Falas);
            }
        }

        private void AbrirLoja(Loja loja)
        {
            _lojaAberta = loja;
            AtualizarPainelLoja();
        }

        private void FecharLoja()
        {
            _lojaAberta = null;
            hudLoja?.Esconder();
        }

        private void AtualizarPainelLoja()
        {
            if (_lojaAberta == null || hudLoja == null || inventario == null) return;
            hudLoja.Mostrar(_lojaAberta.NomeLoja, _lojaAberta.ItensAVenda, inventario.Ouro);
        }

        private void TentarComprar(int indice)
        {
            if (_lojaAberta == null || inventario == null) return;
            var itens = _lojaAberta.ItensAVenda;
            if (indice < 0 || indice >= itens.Length) return;

            var oferta = itens[indice];
            if (!inventario.TentarComprar(oferta.itemId, oferta.preco))
            {
                Debug.Log("[Éter Anima] Ouro insuficiente pra comprar isso.");
            }
        }

        private T EncontrarProximo<T>() where T : Component
        {
            var candidatos = Physics.OverlapSphere(transform.position, raioInteracao);
            T maisProximo = null;
            float menorDistancia = float.MaxValue;

            foreach (var candidato in candidatos)
            {
                var componente = candidato.GetComponentInParent<T>();
                if (componente == null) continue;

                float distancia = Vector3.Distance(transform.position, componente.transform.position);
                if (distancia < menorDistancia)
                {
                    menorDistancia = distancia;
                    maisProximo = componente;
                }
            }
            return maisProximo;
        }
    }
}
