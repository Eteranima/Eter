using EterAnima.Combat;
using UnityEngine;
using UnityEngine.InputSystem;

namespace EterAnima.PlayerCore
{
    /// <summary>
    /// Combate em tempo real do jogador (seções de combate do documento de
    /// projeto — versão mínima da vertical slice: um ataque físico corpo a
    /// corpo, com variante aérea automática se estiver no ar, e uma magia
    /// que gasta mana). Detecção de acerto é um cone simples na frente do
    /// personagem, não colisão por frame de animação — suficiente pra
    /// provar o loop (dano real, elemento real, HP real).
    /// </summary>
    [RequireComponent(typeof(JogadorController))]
    [RequireComponent(typeof(Vida))]
    public class JogadorCombate : MonoBehaviour
    {
        [Header("Ataque físico")]
        [SerializeField] private int danoBaseAtaque = 10;
        [SerializeField] private float alcanceAtaque = 1.8f;
        [SerializeField] private float anguloAtaqueGraus = 100f;
        [SerializeField] private float duracaoPoseAtaque = 0.35f;

        [Header("Magia")]
        [SerializeField] private int danoBaseMagia = 16;
        [SerializeField] private int custoManaMagia = 15;
        [SerializeField] private float alcanceMagia = 3f;
        [SerializeField] private float anguloMagiaGraus = 60f;
        [SerializeField] private float duracaoPoseMagia = 0.5f;

        private JogadorController _jogador;
        private Vida _vida;
        private Inventario _inventario;
        private PersonagemBillboard _billboard;
        private float _cooldownRestante;

        private void Awake()
        {
            _jogador = GetComponent<JogadorController>();
            _vida = GetComponent<Vida>();
            _inventario = GetComponent<Inventario>();
            _billboard = GetComponentInChildren<PersonagemBillboard>();
        }

        private void Update()
        {
            if (_cooldownRestante > 0f)
            {
                _cooldownRestante -= Time.deltaTime;
                return;
            }

            var teclado = Keyboard.current;
            var mouse = Mouse.current;
            if (teclado == null) return;

            bool pediuAtaque = (mouse != null && mouse.leftButton.wasPressedThisFrame) || teclado.jKey.wasPressedThisFrame;
            bool pediuMagia = (mouse != null && mouse.rightButton.wasPressedThisFrame) || teclado.kKey.wasPressedThisFrame;

            if (pediuAtaque)
            {
                ExecutarAtaqueFisico();
            }
            else if (pediuMagia)
            {
                ExecutarMagia();
            }
        }

        private void ExecutarAtaqueFisico()
        {
            bool noAr = !_jogador.NoChao;
            var acao = noAr ? AcaoPersonagem.AtaqueAereo : AcaoPersonagem.Ataque;
            _billboard?.TocarAcao(acao, duracaoPoseAtaque);
            _cooldownRestante = duracaoPoseAtaque;

            int bonusFisico = _inventario?.Equipado?.BonusDanoFisico ?? 0;
            AcertarAlvosNoCone(alcanceAtaque, anguloAtaqueGraus, danoBaseAtaque + bonusFisico);
        }

        private void ExecutarMagia()
        {
            if (!_vida.TentarGastarMana(custoManaMagia))
            {
                Debug.Log("[Éter Anima] Mana insuficiente pra conjurar.");
                return;
            }

            _billboard?.TocarAcao(AcaoPersonagem.Magia, duracaoPoseMagia);
            _cooldownRestante = duracaoPoseMagia;

            int bonusMagico = _inventario?.Equipado?.BonusDanoMagico ?? 0;
            AcertarAlvosNoCone(alcanceMagia, anguloMagiaGraus, danoBaseMagia + bonusMagico);
        }

        /// <summary>Cone simples na frente do personagem (não precisa de
        /// LayerMask/física fina pra essa fatia — só Vida em qualquer
        /// Collider dentro do alcance e do ângulo).</summary>
        private void AcertarAlvosNoCone(float alcance, float anguloGraus, int danoBase)
        {
            var candidatos = Physics.OverlapSphere(transform.position, alcance);
            float cosMetadeAngulo = Mathf.Cos(anguloGraus * 0.5f * Mathf.Deg2Rad);

            foreach (var candidato in candidatos)
            {
                var vidaAlvo = candidato.GetComponentInParent<Vida>();
                if (vidaAlvo == null || vidaAlvo == _vida) continue;

                Vector3 paraAlvo = candidato.transform.position - transform.position;
                paraAlvo.y = 0f;
                if (paraAlvo.sqrMagnitude < 0.0001f) continue;
                if (Vector3.Dot(transform.forward, paraAlvo.normalized) < cosMetadeAngulo) continue;

                vidaAlvo.ReceberDano(danoBase, _vida.Elemento);
            }
        }
    }
}
