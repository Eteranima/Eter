using System.Text;
using EterAnima.Combat;
using UnityEngine;
using UnityEngine.UI;

namespace EterAnima.UI
{
    /// <summary>Lista de texto simples (sem ícones ainda) com os itens do
    /// inventário e qual está equipado — placeholder de UI, igual ao HudVida.</summary>
    public class HudInventario : MonoBehaviour
    {
        [SerializeField] private Inventario inventario;
        [SerializeField] private Text texto;

        public Inventario Inventario { set => inventario = value; }
        public Text Texto { set => texto = value; }

        private void OnEnable()
        {
            if (inventario != null) inventario.Mudou += Atualizar;
            Atualizar();
        }

        private void OnDisable()
        {
            if (inventario != null) inventario.Mudou -= Atualizar;
        }

        private void Atualizar()
        {
            if (texto == null || inventario == null) return;

            var linhas = new StringBuilder();
            for (int i = 0; i < inventario.Itens.Count; i++)
            {
                var item = inventario.Itens[i];
                string marcador = ReferenceEquals(inventario.Equipado, item) ? " (equipado)" : "";
                linhas.AppendLine($"{i + 1}: {item.Nome}{marcador}");
            }
            texto.text = linhas.Length > 0 ? linhas.ToString() : "(inventário vazio)";
        }
    }
}
