using EterAnima.Combat;
using EterAnima.Core;
using EterAnima.Mundo;
using UnityEngine;
using UnityEngine.InputSystem;

namespace EterAnima.PlayerCore
{
    /// <summary>Save básico da vertical slice: F5 salva, F9 carrega — um
    /// arquivo só, sem slots múltiplos nem menu ainda (isso é próxima
    /// fatia). Guarda posição, nível/XP, HP/mana atuais, ouro e
    /// inventário/equipamento.</summary>
    [RequireComponent(typeof(JogadorController))]
    [RequireComponent(typeof(Vida))]
    [RequireComponent(typeof(Inventario))]
    [RequireComponent(typeof(CharacterController))]
    public class JogadorSave : MonoBehaviour
    {
        private JogadorController _jogador;
        private Vida _vida;
        private Inventario _inventario;
        private CharacterController _controlador;

        private void Awake()
        {
            _jogador = GetComponent<JogadorController>();
            _vida = GetComponent<Vida>();
            _inventario = GetComponent<Inventario>();
            _controlador = GetComponent<CharacterController>();
        }

        private void Update()
        {
            var teclado = Keyboard.current;
            if (teclado == null) return;

            if (teclado.f5Key.wasPressedThisFrame) Salvar();
            if (teclado.f9Key.wasPressedThisFrame) Carregar();
        }

        private void Salvar()
        {
            var estado = new EstadoSalvo
            {
                posX = transform.position.x,
                posY = transform.position.y,
                posZ = transform.position.z,
                nivel = _jogador.Progresso.Nivel,
                xp = _jogador.Progresso.Xp,
                hpAtual = _vida.HpAtual,
                manaAtual = _vida.ManaAtual,
                ouro = _inventario.Ouro,
                itensIds = ObterIdsDoInventario(),
                itemEquipadoId = _inventario.Equipado?.Id ?? "",
            };
            SistemaDeSave.Salvar(estado);
        }

        private void Carregar()
        {
            if (!SistemaDeSave.TentarCarregar(out var estado))
            {
                Debug.Log("[Éter Anima] Nenhum save encontrado ainda — aperta F5 primeiro.");
                return;
            }

            // CharacterController briga com escrita direta em
            // transform.position enquanto ativo — desliga, teleporta,
            // religa.
            _controlador.enabled = false;
            transform.position = new Vector3(estado.posX, estado.posY, estado.posZ);
            _controlador.enabled = true;

            _jogador.CarregarProgresso(estado.nivel, estado.xp);
            _vida.CarregarPontos(estado.hpAtual, estado.manaAtual);
            _inventario.CarregarEstado(estado.itensIds, estado.itemEquipadoId, estado.ouro);

            Debug.Log("[Éter Anima] Jogo carregado.");
        }

        private string[] ObterIdsDoInventario()
        {
            var ids = new string[_inventario.Itens.Count];
            for (int i = 0; i < ids.Length; i++) ids[i] = _inventario.Itens[i].Id;
            return ids;
        }
    }
}
