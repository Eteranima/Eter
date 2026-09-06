using UnityEngine;
using UnityEngine.UI;

namespace EterAnima.UI
{
    /// <summary>Caixa de diálogo simples (nome + fala, avança linha por
    /// linha) — UI padrão da Unity, sem moldura/arte própria ainda.</summary>
    public class HudDialogo : MonoBehaviour
    {
        [SerializeField] private GameObject painel;
        [SerializeField] private Text textoNome;
        [SerializeField] private Text textoFala;

        private string[] _falas;
        private int _indice;

        public GameObject Painel { set => painel = value; }
        public Text TextoNome { set => textoNome = value; }
        public Text TextoFala { set => textoFala = value; }
        public bool Aberto => painel != null && painel.activeSelf;

        public void Iniciar(string nome, string[] falas)
        {
            _falas = falas;
            _indice = 0;
            if (textoNome != null) textoNome.text = nome;
            AtualizarTextoDaFala();
            if (painel != null) painel.SetActive(true);
        }

        /// <summary>Chamado a cada aperto de tecla de interação enquanto o
        /// diálogo está aberto — avança pra próxima fala ou fecha se já
        /// era a última.</summary>
        public void AvancarOuFechar()
        {
            _indice++;
            if (_falas == null || _indice >= _falas.Length)
            {
                Fechar();
                return;
            }
            AtualizarTextoDaFala();
        }

        public void Fechar()
        {
            if (painel != null) painel.SetActive(false);
        }

        private void AtualizarTextoDaFala()
        {
            if (textoFala != null && _falas != null && _indice < _falas.Length)
            {
                textoFala.text = _falas[_indice];
            }
        }
    }
}
