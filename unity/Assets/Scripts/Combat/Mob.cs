using UnityEngine;
using EterAnima.Core;

namespace EterAnima.Combat
{
    /// <summary>
    /// Inimigo mínimo pra vertical slice: sem pathfinding (mundo de teste é
    /// um plano só), mas já reage de verdade — pisca ao tomar dano, persegue
    /// o jogador dentro do raio de detecção e bate de volta por contato.
    /// </summary>
    [RequireComponent(typeof(Vida))]
    public class Mob : MonoBehaviour
    {
        [SerializeField] private TipoElemento elemento = TipoElemento.Terra;
        [SerializeField] private int hpMaximo = 40;
        [SerializeField] private float raioDeteccao = 5f;
        [SerializeField] private float velocidadePerseguicao = 2.2f;
        [SerializeField] private float alcanceAtaque = 1.3f;
        [SerializeField] private int danoContato = 6;
        [SerializeField] private float intervaloAtaque = 1.2f;
        [SerializeField] private float duracaoFlash = 0.15f;

        private Vida _vida;
        private Transform _alvo;
        private Vida _vidaAlvo;
        private int _hpAnterior;
        private float _cooldownAtaque;
        private float _flashRestante;
        private SpriteRenderer _renderer;
        private Color _corOriginal = Color.white;

        private void Awake()
        {
            _vida = GetComponent<Vida>();
            _vida.Inicializar(hpMaximo, 0, elemento);
            _hpAnterior = _vida.HpAtual;

            _renderer = GetComponentInChildren<SpriteRenderer>();
            if (_renderer != null) _corOriginal = _renderer.color;

            var jogador = GameObject.FindWithTag("Player");
            if (jogador != null)
            {
                _alvo = jogador.transform;
                _vidaAlvo = jogador.GetComponent<Vida>();
            }
        }

        private void Update()
        {
            if (_vida.Morto)
            {
                Debug.Log($"[Éter Anima] {gameObject.name} derrotado!");
                Destroy(gameObject, 0.4f);
                enabled = false;
                return;
            }

            if (_vida.HpAtual < _hpAnterior) _flashRestante = duracaoFlash;
            _hpAnterior = _vida.HpAtual;
            AtualizarFlash();

            if (_cooldownAtaque > 0f) _cooldownAtaque -= Time.deltaTime;
            PerseguirEAtacar();
        }

        private void AtualizarFlash()
        {
            if (_renderer == null) return;
            if (_flashRestante > 0f)
            {
                _flashRestante -= Time.deltaTime;
                _renderer.color = Color.red;
            }
            else
            {
                _renderer.color = _corOriginal;
            }
        }

        private void PerseguirEAtacar()
        {
            if (_alvo == null) return;

            Vector3 paraAlvo = _alvo.position - transform.position;
            paraAlvo.y = 0f;
            float distancia = paraAlvo.magnitude;
            if (distancia < 0.0001f) return;

            if (distancia <= alcanceAtaque)
            {
                if (_cooldownAtaque <= 0f)
                {
                    _vidaAlvo?.ReceberDano(danoContato, elemento);
                    _cooldownAtaque = intervaloAtaque;
                }
                return;
            }

            if (distancia <= raioDeteccao)
            {
                Vector3 direcao = paraAlvo.normalized;
                transform.position += direcao * velocidadePerseguicao * Time.deltaTime;
                transform.forward = direcao;
            }
        }
    }
}
