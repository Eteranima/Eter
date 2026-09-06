using UnityEngine;

namespace EterAnima.Mundo
{
    /// <summary>NPC parado com falas fixas — sem rotina/patrulha ainda
    /// (isso é próxima fatia). JogadorInteracao encontra e conversa com
    /// qualquer objeto que tenha este componente.</summary>
    public class Npc : MonoBehaviour
    {
        [SerializeField] private string nome = "Anciã";
        [TextArea]
        [SerializeField]
        private string[] falas =
        {
            "Seja bem-vindo(a) a Éter Anima, viajante.",
            "Os ventos sussurram sobre uma nova era se aproximando.",
            "Volte sempre que precisar de um conselho.",
        };

        public string Nome => nome;
        public string[] Falas => falas;
    }
}
