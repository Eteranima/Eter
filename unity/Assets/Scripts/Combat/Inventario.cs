using System;
using System.Collections.Generic;
using EterAnima.Core;
using UnityEngine;

namespace EterAnima.Combat
{
    /// <summary>
    /// Inventário mínimo pra vertical slice: lista simples de itens, um
    /// equipamento ativo por vez (só bônus de dano por enquanto — mais
    /// slots/tipos entram quando o sistema de combate crescer). Sem UI de
    /// arrastar; HudInventario só lista e usa/equipa por número (ver
    /// JogadorInventario).
    /// </summary>
    public class Inventario : MonoBehaviour
    {
        private readonly List<Item> _itens = new();
        public IReadOnlyList<Item> Itens => _itens;
        public Item Equipado { get; private set; }
        public int Ouro { get; private set; }

        /// <summary>Disparado depois de qualquer mudança (adicionar, usar,
        /// equipar) pra quem estiver desenhando a lista (HudInventario)
        /// se atualizar sem precisar de polling todo frame.</summary>
        public event Action Mudou;

        public void Adicionar(Item item)
        {
            _itens.Add(item);
            Debug.Log($"[Éter Anima] Item adicionado ao inventário: {item.Nome}");
            Mudou?.Invoke();
        }

        public void UsarConsumivel(int indice, Vida vida)
        {
            if (indice < 0 || indice >= _itens.Count) return;
            var item = _itens[indice];
            if (item.Tipo != TipoItem.Consumivel) return;

            vida.Curar(item.CuraHp, item.CuraMana);
            _itens.RemoveAt(indice);
            Debug.Log($"[Éter Anima] Usou {item.Nome} (+{item.CuraHp} HP, +{item.CuraMana} mana)");
            Mudou?.Invoke();
        }

        public void Equipar(int indice)
        {
            if (indice < 0 || indice >= _itens.Count) return;
            var item = _itens[indice];
            if (item.Tipo != TipoItem.Equipamento) return;

            Equipado = item;
            Debug.Log($"[Éter Anima] Equipou {item.Nome}");
            Mudou?.Invoke();
        }

        public void AdicionarOuro(int quantidade)
        {
            Ouro += quantidade;
            Mudou?.Invoke();
        }

        /// <summary>Desconta o ouro e adiciona o item, atômico (ou as
        /// duas coisas acontecem, ou nenhuma). Devolve false se não tem
        /// ouro suficiente.</summary>
        public bool TentarComprar(string itemId, int preco)
        {
            if (Ouro < preco) return false;
            Ouro -= preco;
            Adicionar(ItensPredefinidos.Criar(itemId)); // já dispara Mudou
            return true;
        }

        /// <summary>Usado só pelo save/load — substitui o inventário
        /// inteiro pelo estado salvo (reconstrói os itens a partir dos
        /// IDs via ItensPredefinidos, já que Item não é persistido por
        /// referência).</summary>
        public void CarregarEstado(string[] itensIds, string itemEquipadoId, int ouro)
        {
            _itens.Clear();
            if (itensIds != null)
            {
                foreach (var id in itensIds) _itens.Add(ItensPredefinidos.Criar(id));
            }

            Equipado = string.IsNullOrEmpty(itemEquipadoId) ? null : _itens.Find(i => i.Id == itemEquipadoId);
            Ouro = ouro;
            Mudou?.Invoke();
        }
    }
}
