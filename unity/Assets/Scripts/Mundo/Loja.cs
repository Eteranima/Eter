using UnityEngine;

namespace EterAnima.Mundo
{
    /// <summary>Catálogo fixo de uma loja — sem estoque/reposição ainda
    /// (próxima fatia). JogadorInteracao é quem decide abrir/fechar e
    /// processa a compra de verdade (via Inventario.TentarComprar).</summary>
    public class Loja : MonoBehaviour
    {
        [SerializeField] private string nomeLoja = "Mercador";
        [SerializeField]
        private ItemDeLoja[] itensAVenda =
        {
            new() { itemId = "pocao_vida", preco = 15 },
            new() { itemId = "pocao_mana", preco = 15 },
            new() { itemId = "espada_treino", preco = 40 },
            new() { itemId = "anel_do_fogo", preco = 60 },
        };

        public string NomeLoja => nomeLoja;
        public ItemDeLoja[] ItensAVenda => itensAVenda;
    }
}
