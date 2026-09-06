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
    /// `quadros` precisa ter exatamente 12 sprites, na ordem gerada por
    /// ImportadorFolhaDePersonagem: índice = linha*3 + coluna, linha
    /// 0=baixo, 1=esquerda, 2=direita, 3=cima (mesma convenção do motor
    /// antigo, DIR_ROW).
    /// </summary>
    [RequireComponent(typeof(SpriteRenderer))]
    public class PersonagemBillboard : MonoBehaviour
    {
        private static readonly int[] CicloDeAndar = { 1, 0, 1, 2 }; // coluna do meio = pose parada
        private const float SegundosPorQuadro = 0.13f;

        [SerializeField] private Sprite[] quadros = new Sprite[12];

        private SpriteRenderer _renderer;
        private JogadorController _jogador;
        private float _tempoAnimacao;

        public Sprite[] Quadros { set => quadros = value; }

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
            if (_jogador == null || quadros == null || quadros.Length < 12) return;

            int linha = (int)_jogador.DirecaoCardinal;
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

            int indice = linha * 3 + coluna;
            var quadro = quadros[indice];
            if (quadro != null) _renderer.sprite = quadro;
        }
    }
}
