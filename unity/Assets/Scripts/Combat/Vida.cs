using EterAnima.Core;
using UnityEngine;

namespace EterAnima.Combat
{
    /// <summary>
    /// HP/Mana em tempo de execução de qualquer entidade que possa lutar
    /// (jogador ou mob) — separado de AtributosPersonagem (que só calcula
    /// os máximos) porque isso aqui é estado que muda a cada golpe.
    /// </summary>
    public class Vida : MonoBehaviour
    {
        [SerializeField] private TipoElemento elemento = TipoElemento.Fogo;

        public int HpMaximo { get; private set; }
        public int HpAtual { get; private set; }
        public int ManaMaximo { get; private set; }
        public int ManaAtual { get; private set; }
        public TipoElemento Elemento => elemento;
        public bool Morto => HpAtual <= 0;

        public void Inicializar(int hpMaximo, int manaMaximo, TipoElemento elementoDaEntidade)
        {
            elemento = elementoDaEntidade;
            HpMaximo = hpMaximo;
            HpAtual = hpMaximo;
            ManaMaximo = manaMaximo;
            ManaAtual = manaMaximo;
        }

        /// <summary>Aplica a tabela elemental (seção do documento de
        /// projeto sobre Fogo/Água/Terra/...) entre o elemento de quem
        /// ataca e o elemento de quem defende antes de descontar o HP.</summary>
        public void ReceberDano(int danoBase, TipoElemento elementoDoAtaque)
        {
            if (Morto) return;
            float multiplicador = TabelaElemental.Multiplicador(elementoDoAtaque, elemento);
            int dano = Mathf.Max(1, Mathf.RoundToInt(danoBase * multiplicador));
            HpAtual = Mathf.Max(0, HpAtual - dano);
            Debug.Log($"[Éter Anima] {gameObject.name} tomou {dano} de dano ({elementoDoAtaque} vs {elemento}, x{multiplicador:0.00}) — HP {HpAtual}/{HpMaximo}");
        }

        public bool TentarGastarMana(int custo)
        {
            if (ManaAtual < custo) return false;
            ManaAtual -= custo;
            return true;
        }
    }
}
