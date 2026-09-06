using UnityEngine;
using EterAnima.Core;

namespace EterAnima.Combat
{
    /// <summary>
    /// Inimigo mínimo pra ter algo pra bater na vertical slice — sem IA,
    /// só fica parado com HP. Visual é placeholder (primitiva colorida),
    /// igual já foi pedido antes pro protótipo Three.js; arte de mob de
    /// verdade entra depois.
    /// </summary>
    [RequireComponent(typeof(Vida))]
    public class Mob : MonoBehaviour
    {
        [SerializeField] private TipoElemento elemento = TipoElemento.Terra;
        [SerializeField] private int hpMaximo = 40;

        private Vida _vida;

        private void Awake()
        {
            _vida = GetComponent<Vida>();
            _vida.Inicializar(hpMaximo, 0, elemento);
        }

        private void Update()
        {
            if (_vida.Morto)
            {
                Debug.Log($"[Éter Anima] {gameObject.name} derrotado!");
                Destroy(gameObject, 0.4f);
                enabled = false;
            }
        }
    }
}
