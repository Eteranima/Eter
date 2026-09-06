using UnityEngine;

namespace EterAnima.PlayerCore
{
    /// <summary>
    /// Sprite 2D dentro do mundo 3D (decisão da vertical slice, já
    /// aprovada e validada no protótipo Three.js: mundo/câmera/altura são
    /// 3D de verdade, personagem continua arte 2D pixelada — technique
    /// tipo HD-2D/Octopath). Fica como FILHO do objeto com o
    /// CharacterController de propósito: o pai gira de verdade pra
    /// indicar direção (transform.forward, usado por mira/combate depois),
    /// mas o sprite em si NUNCA deve girar fisicamente — só troca de
    /// pose/quadro. Este componente sobrescreve a rotação herdada todo
    /// frame pra sempre encarar a câmera.
    ///
    /// Cada folha (`quadrosAndar`, `quadrosCorrida`, `quadrosPulo`, ...) precisa ter
    /// exatamente 12 sprites, na ordem gerada por
    /// ImportadorFolhaDePersonagem: índice = linha*3 + coluna, linha
    /// 0=baixo, 1=esquerda, 2=direita, 3=cima (mesma convenção do motor
    /// antigo, DIR_ROW). Ataque/ataque aéreo/magia entram via TocarAcao,
    /// chamado pelo JogadorCombate — essa pose tem prioridade sobre
    /// andar/correr/pular enquanto está tocando.
    /// </summary>
    [RequireComponent(typeof(SpriteRenderer))]
    public class PersonagemBillboard : MonoBehaviour
    {
        private static readonly int[] CicloDeAndar = { 1, 0, 1, 2 }; // coluna do meio = pose parada
        private const float SegundosPorQuadro = 0.13f;
        private const int ColunaPuloNoAr = 1; // meio da folha de pulo = "no ar" (ver protagonista_pulo_sheet)

        [SerializeField] private Sprite[] quadrosAndar = new Sprite[12];
        [SerializeField] private Sprite[] quadrosCorrida = new Sprite[12];
        [SerializeField] private Sprite[] quadrosPulo = new Sprite[12];
        [SerializeField] private Sprite[] quadrosAtaque = new Sprite[12];
        [SerializeField] private Sprite[] quadrosAtaqueAereo = new Sprite[12];
        [SerializeField] private Sprite[] quadrosMagia = new Sprite[12];

        private SpriteRenderer _renderer;
        private JogadorController _jogador;
        private float _tempoAnimacao;
        private AcaoPersonagem _acaoAtual;
        private float _acaoTempoRestante;
        private float _acaoDuracaoTotal;

        public Sprite[] QuadrosAndar { set => quadrosAndar = value; }
        public Sprite[] QuadrosCorrida { set => quadrosCorrida = value; }
        public Sprite[] QuadrosPulo { set => quadrosPulo = value; }
        public Sprite[] QuadrosAtaque { set => quadrosAtaque = value; }
        public Sprite[] QuadrosAtaqueAereo { set => quadrosAtaqueAereo = value; }
        public Sprite[] QuadrosMagia { set => quadrosMagia = value; }

        /// <summary>Chamado pelo JogadorCombate quando um ataque/magia
        /// começa — a pose de ação toca do quadro 0 (preparação) ao 2
        /// (recuperação) ao longo de `duracao` segundos, sobrepondo
        /// qualquer outra pose até acabar.</summary>
        public void TocarAcao(AcaoPersonagem acao, float duracao)
        {
            _acaoAtual = acao;
            _acaoDuracaoTotal = Mathf.Max(0.01f, duracao);
            _acaoTempoRestante = _acaoDuracaoTotal;
        }

        private void Awake()
        {
            _renderer = GetComponent<SpriteRenderer>();
            _jogador = GetComponentInParent<JogadorController>();
        }

        private void LateUpdate()
        {
            var camera = Camera.main;
            if (camera != null)
            {
                transform.rotation = camera.transform.rotation;
            }
            AtualizarQuadro();
        }

        private void AtualizarQuadro()
        {
            if (_jogador == null) return;
            int linha = (int)_jogador.DirecaoCardinal;

            if (_acaoTempoRestante > 0f)
            {
                _acaoTempoRestante -= Time.deltaTime;
                float progresso = 1f - Mathf.Clamp01(_acaoTempoRestante / _acaoDuracaoTotal);
                int colunaAcao = Mathf.Clamp(Mathf.FloorToInt(progresso * 3f), 0, 2);
                var folhaAcao = _acaoAtual switch
                {
                    AcaoPersonagem.Ataque => quadrosAtaque,
                    AcaoPersonagem.AtaqueAereo => quadrosAtaqueAereo,
                    AcaoPersonagem.Magia => quadrosMagia,
                    _ => quadrosAtaque,
                };
                AplicarQuadro(folhaAcao, linha, colunaAcao);
                _tempoAnimacao = 0f;
                return;
            }

            if (!_jogador.NoChao)
            {
                AplicarQuadro(quadrosPulo, linha, ColunaPuloNoAr);
                _tempoAnimacao = 0f;
                return;
            }

            int coluna;
            if (_jogador.Movendo)
            {
                _tempoAnimacao += Time.deltaTime;
                int indiceCiclo = Mathf.FloorToInt(_tempoAnimacao / SegundosPorQuadro) % CicloDeAndar.Length;
                coluna = CicloDeAndar[indiceCiclo];
            }
            else
            {
                _tempoAnimacao = 0f;
                coluna = 1; // pose parada
            }
            var folha = _jogador.Correndo ? quadrosCorrida : quadrosAndar;
            AplicarQuadro(folha, linha, coluna);
        }

        private void AplicarQuadro(Sprite[] folha, int linha, int coluna)
        {
            if (folha == null || folha.Length < 12) return;
            var quadro = folha[linha * 3 + coluna];
            if (quadro != null) _renderer.sprite = quadro;
        }
    }
}
