using System.Text;
using EterAnima.Core;
using EterAnima.Mundo;
using UnityEngine;
using UnityEngine.UI;

namespace EterAnima.UI
{
    /// <summary>Painel de compra simples — lista com preço, tecla
    /// numérica compra, sem carrinho/confirmação. JogadorInteracao chama
    /// Mostrar() a cada frame enquanto a loja está aberta (o ouro muda a
    /// cada compra, precisa refletir na hora).</summary>
    public class HudLoja : MonoBehaviour
    {
        [SerializeField] private GameObject painel;
        [SerializeField] private Text texto;

        public GameObject Painel { set => painel = value; }
        public Text Texto { set => texto = value; }

        public void Mostrar(string nomeLoja, ItemDeLoja[] itens, int ouroAtual)
        {
            if (texto != null)
            {
                var linhas = new StringBuilder();
                linhas.AppendLine($"{nomeLoja} — seu ouro: {ouroAtual}");
                linhas.AppendLine();
                for (int i = 0; i < itens.Length; i++)
                {
                    var item = ItensPredefinidos.Criar(itens[i].itemId);
                    linhas.AppendLine($"{i + 1}: {item.Nome} — {itens[i].preco} de ouro");
                }
                linhas.AppendLine();
                linhas.AppendLine("(E fecha)");
                texto.text = linhas.ToString();
            }
            if (painel != null) painel.SetActive(true);
        }

        public void Esconder()
        {
            if (painel != null) painel.SetActive(false);
        }
    }
}
