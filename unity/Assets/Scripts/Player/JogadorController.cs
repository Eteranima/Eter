using EterAnima.Core;
using UnityEngine;
using UnityEngine.InputSystem;

namespace EterAnima.PlayerCore
{
    /// <summary>
    /// Movimento/pulo/gravidade de verdade (seções 15-18 do documento de
    /// projeto) usando o CharacterController nativo da Unity — física real,
    /// nada de heightmap calculado à mão como no protótipo Three.js.
    /// Usa o Input System novo (pacote já vem no template "Universal 3D")
    /// direto via Keyboard.current, sem precisar de um asset de Input
    /// Actions só pra WASD/Espaço/Shift.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class JogadorController : MonoBehaviour
    {
        [Header("Identidade (seções 8-13, 36)")]
        [SerializeField] private TipoRaca raca = TipoRaca.Humano;
        [SerializeField] private TipoElemento elemento = TipoElemento.Fogo;

        [Header("Física")]
        [SerializeField] private float gravidade = -18f;
        [SerializeField] private float velocidadePulo = 7f;
        [SerializeField] private float multiplicadorCorrida = 1.7f;

        private CharacterController _controlador;
        private float _velocidadeVertical;

        public AtributosPersonagem Atributos { get; private set; }
        public Progresso Progresso { get; private set; }
        public bool NoChao => _controlador.isGrounded;
        public bool Movendo { get; private set; }
        public Vector3 DirecaoAtual { get; private set; } = Vector3.forward;

        private void Awake()
        {
            _controlador = GetComponent<CharacterController>();
            Atributos = AtributosPersonagem.Base().ComBonusDeRaca(raca);
            Progresso = Progresso.Inicial();
        }

        private void Update()
        {
            var teclado = Keyboard.current;
            if (teclado == null) return;

            /* X invertido de propósito: a câmera fica atrás do personagem
               em +Z olhando pra -Z (ver CameraTerceiraPessoa) — isso
               equivale a girar 180° em Y a partir da identidade, o que
               inverte transform.right da câmera pra -X. Sem esta inversão,
               D (que devia ir pra direita NA TELA) andava +X no mundo, que
               a câmera via como esquerda — exatamente o bug relatado ao
               vivo ("A e D estão trocados"). */
            Vector3 direcao = Vector3.zero;
            if (teclado.wKey.isPressed || teclado.upArrowKey.isPressed) direcao.z -= 1;
            if (teclado.sKey.isPressed || teclado.downArrowKey.isPressed) direcao.z += 1;
            if (teclado.aKey.isPressed || teclado.leftArrowKey.isPressed) direcao.x += 1;
            if (teclado.dKey.isPressed || teclado.rightArrowKey.isPressed) direcao.x -= 1;

            Movendo = direcao.sqrMagnitude > 0.001f;
            bool correndo = Movendo && teclado.leftShiftKey.isPressed;
            float velocidade = Atributos.VelocidadeMovimento() * (correndo ? multiplicadorCorrida : 1f);

            if (Movendo)
            {
                direcao.Normalize();
                DirecaoAtual = direcao;
                _controlador.Move(direcao * velocidade * Time.deltaTime);
                transform.forward = direcao;
            }

            // Pulo/gravidade — só sai do chão se já estava apoiado.
            if (_controlador.isGrounded)
            {
                _velocidadeVertical = -1f; // pequena força pra manter grudado na rampa/degrau
                if (teclado.spaceKey.wasPressedThisFrame)
                {
                    _velocidadeVertical = velocidadePulo;
                }
            }
            else
            {
                _velocidadeVertical += gravidade * Time.deltaTime;
            }
            _controlador.Move(Vector3.up * _velocidadeVertical * Time.deltaTime);
        }

        public void ReceberXp(int quantidade)
        {
            int niveisSubiram = Progresso.GanharXp(quantidade);
            if (niveisSubiram > 0)
            {
                Debug.Log($"[Éter Anima] {gameObject.name} subiu pro nível {Progresso.Nivel}!");
            }
        }
    }
}
