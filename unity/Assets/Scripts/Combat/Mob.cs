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
        [SerializeField] private int ouroRecompensa = 8;

        private Vida _vida;
        private Transform _alvo;
        private Vida _vidaAlvo;
        private Inventario _inventarioAlvo;
        private int _hpAnterior;
        private float _cooldownAtaque;
        private float _flashRestante;
        private SpriteRenderer _renderer;
        private Color _corOriginal = Color.white;
        private InimigoBillboard _billboard;
        private int _ultimaDirecao; // 0=baixo,1=esquerda,2=direita,3=cima — mesma convenção de PersonagemBillboard

        private void Awake()
        {
            _vida = GetComponent<Vida>();
            _vida.Inicializar(hpMaximo, 0, elemento);
            _hpAnterior = _vida.HpAtual;

            _renderer = GetComponentInChildren<SpriteRenderer>();
            if (_renderer != null) _corOriginal = _renderer.color;
            _billboard = GetComponentInChildren<InimigoBillboard>();

            var jogador = GameObject.FindWithTag("Player");
            if (jogador != null)
            {
                _alvo = jogador.transform;
                _vidaAlvo = jogador.GetComponent<Vida>();
                _inventarioAlvo = jogador.GetComponent<Inventario>();
            }
        }

        private void Update()
        {
            if (_vida.Morto)
            {
                Debug.Log($"[Éter Anima] {gameObject.name} derrotado! +{ouroRecompensa} de ouro.");
                _inventarioAlvo?.AdicionarOuro(ouroRecompensa);
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
            bool movendo = false;

            if (_alvo != null)
            {
                Vector3 paraAlvo = _alvo.position - transform.position;
                paraAlvo.y = 0f;
                float distancia = paraAlvo.magnitude;

                if (distancia > 0.0001f)
                {
                    if (distancia <= alcanceAtaque)
                    {
                        if (_cooldownAtaque <= 0f)
                        {
                            _vidaAlvo?.ReceberDano(danoContato, elemento);
                            _cooldownAtaque = intervaloAtaque;
                        }
                    }
                    else if (distancia <= raioDeteccao)
                    {
                        Vector3 direcao = paraAlvo.normalized;
                        transform.position += direcao * velocidadePerseguicao * Time.deltaTime;
                        transform.forward = direcao;
                        _ultimaDirecao = DirecaoCardinalDe(direcao);
                        movendo = true;
                    }
                }
            }

            _billboard?.AtualizarQuadro(_ultimaDirecao, movendo);
        }

        /// <summary>Mesma convenção de sinal já usada em JogadorController
        /// pra mapear eixo de mundo pra direção de sprite: +X é Esquerda,
        /// -X é Direita, -Z é Cima (longe da câmera), +Z é Baixo (perto
        /// da câmera) — a câmera terceira pessoa é um offset de mundo
        /// fixo, então essa relação vale pra qualquer objeto, não só o
        /// jogador.</summary>
        private static int DirecaoCardinalDe(Vector3 direcaoMundo)
        {
            if (Mathf.Abs(direcaoMundo.x) > Mathf.Abs(direcaoMundo.z))
            {
                return direcaoMundo.x > 0f ? 1 : 2; // esquerda : direita
            }
            return direcaoMundo.z < 0f ? 3 : 0; // cima : baixo
        }
    }
}
