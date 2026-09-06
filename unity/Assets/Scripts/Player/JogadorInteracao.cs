using EterAnima.Mundo;
using EterAnima.UI;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;

namespace EterAnima.PlayerCore
{
    /// <summary>Tecla E: conversa com o NPC mais próximo dentro do raio,
    /// ou avança/fecha o diálogo já aberto. Interação ambiental #2 da
    /// vertical slice (a #1 foi ItemPickup, automático por trigger).</summary>
    public class JogadorInteracao : MonoBehaviour
    {
        [SerializeField] private float raioInteracao = 2.2f;
        [SerializeField] private HudDialogo dialogo;
        [SerializeField] private Text textoDica;

        public HudDialogo Dialogo { set => dialogo = value; }
        public Text TextoDica { set => textoDica = value; }

        private void Update()
        {
            var npcProximo = EncontrarNpcProximo();

            if (textoDica != null)
            {
                bool mostrarDica = npcProximo != null && (dialogo == null || !dialogo.Aberto);
                textoDica.gameObject.SetActive(mostrarDica);
            }

            var teclado = Keyboard.current;
            if (teclado == null || !teclado.eKey.wasPressedThisFrame) return;

            if (dialogo != null && dialogo.Aberto)
            {
                dialogo.AvancarOuFechar();
            }
            else if (npcProximo != null)
            {
                dialogo?.Iniciar(npcProximo.Nome, npcProximo.Falas);
            }
        }

        private Npc EncontrarNpcProximo()
        {
            var candidatos = Physics.OverlapSphere(transform.position, raioInteracao);
            Npc maisProximo = null;
            float menorDistancia = float.MaxValue;

            foreach (var candidato in candidatos)
            {
                var npc = candidato.GetComponentInParent<Npc>();
                if (npc == null) continue;

                float distancia = Vector3.Distance(transform.position, npc.transform.position);
                if (distancia < menorDistancia)
                {
                    menorDistancia = distancia;
                    maisProximo = npc;
                }
            }
            return maisProximo;
        }
    }
}
