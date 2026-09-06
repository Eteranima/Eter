using EterAnima.Combat;
using EterAnima.Core;
using UnityEngine;
using UnityEngine.InputSystem;

namespace EterAnima.PlayerCore
{
    /// <summary>Teclas 1-5 usam (se consumível) ou equipam (se
    /// equipamento) o item daquele slot do inventário — sem UI de
    /// clicar/arrastar, suficiente pra provar o loop na vertical slice.</summary>
    [RequireComponent(typeof(Inventario))]
    [RequireComponent(typeof(Vida))]
    public class JogadorInventario : MonoBehaviour
    {
        private Inventario _inventario;
        private Vida _vida;

        private void Awake()
        {
            _inventario = GetComponent<Inventario>();
            _vida = GetComponent<Vida>();
        }

        private void Update()
        {
            var teclado = Keyboard.current;
            if (teclado == null) return;

            if (teclado.digit1Key.wasPressedThisFrame) UsarOuEquipar(0);
            if (teclado.digit2Key.wasPressedThisFrame) UsarOuEquipar(1);
            if (teclado.digit3Key.wasPressedThisFrame) UsarOuEquipar(2);
            if (teclado.digit4Key.wasPressedThisFrame) UsarOuEquipar(3);
            if (teclado.digit5Key.wasPressedThisFrame) UsarOuEquipar(4);
        }

        private void UsarOuEquipar(int indice)
        {
            if (indice < 0 || indice >= _inventario.Itens.Count) return;
            var item = _inventario.Itens[indice];
            if (item.Tipo == TipoItem.Consumivel) _inventario.UsarConsumivel(indice, _vida);
            else _inventario.Equipar(indice);
        }
    }
}
