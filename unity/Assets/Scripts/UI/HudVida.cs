using EterAnima.Combat;
using UnityEngine;
using UnityEngine.UI;

namespace EterAnima.UI
{
    /// <summary>
    /// Barra de HP/Mana placeholder (UI padrão da Unity, sem arte própria
    /// ainda) só pra tornar visível o dano/mana que já funcionam por
    /// baixo — seção "HUD" da vertical slice.
    /// </summary>
    public class HudVida : MonoBehaviour
    {
        [SerializeField] private Vida vida;
        [SerializeField] private RectTransform preenchimentoHp;
        [SerializeField] private RectTransform preenchimentoMana;

        public Vida Vida { set => vida = value; }
        public RectTransform PreenchimentoHp { set => preenchimentoHp = value; }
        public RectTransform PreenchimentoMana { set => preenchimentoMana = value; }

        private void Update()
        {
            if (vida == null) return;

            if (preenchimentoHp != null)
            {
                float razaoHp = vida.HpMaximo > 0 ? (float)vida.HpAtual / vida.HpMaximo : 0f;
                preenchimentoHp.anchorMax = new Vector2(razaoHp, preenchimentoHp.anchorMax.y);
            }

            if (preenchimentoMana != null)
            {
                float razaoMana = vida.ManaMaximo > 0 ? (float)vida.ManaAtual / vida.ManaMaximo : 0f;
                preenchimentoMana.anchorMax = new Vector2(razaoMana, preenchimentoMana.anchorMax.y);
            }
        }
    }
}
