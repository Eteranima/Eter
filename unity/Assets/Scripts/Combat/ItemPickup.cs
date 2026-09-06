using EterAnima.Core;
using UnityEngine;

namespace EterAnima.Combat
{
    /// <summary>Objeto no mundo que entra no inventário ao ser tocado —
    /// primeira interação ambiental da vertical slice. O CharacterController
    /// do jogador gera evento de trigger normalmente, não precisa de
    /// Rigidbody em nenhum dos dois lados.</summary>
    [RequireComponent(typeof(Collider))]
    public class ItemPickup : MonoBehaviour
    {
        [SerializeField] private string itemId = "pocao_vida";

        private void Reset()
        {
            GetComponent<Collider>().isTrigger = true;
        }

        private void OnTriggerEnter(Collider other)
        {
            var inventario = other.GetComponentInParent<Inventario>();
            if (inventario == null) return;

            inventario.Adicionar(ItensPredefinidos.Criar(itemId));
            Destroy(gameObject);
        }
    }
}
