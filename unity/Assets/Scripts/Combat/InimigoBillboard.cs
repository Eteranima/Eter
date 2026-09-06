using UnityEngine;

namespace EterAnima.Combat
{
    /// <summary>Sprite direcionado com ciclo de andar — pra mobs que se
    /// movem de verdade (diferente de BillboardSimples, que é só pose
    /// única parada). Mesma convenção de índice de PersonagemBillboard:
    /// 0=baixo, 1=esquerda, 2=direita, 3=cima. Quem decide a direção e se
    /// está se movendo é o Mob (não tem tecla aqui, é tudo perseguição).</summary>
    [RequireComponent(typeof(SpriteRenderer))]
    public class InimigoBillboard : MonoBehaviour
    {
        private static readonly int[] CicloDeAndar = { 1, 0, 1, 2 };
        private const float SegundosPorQuadro = 0.15f;

        [SerializeField] private Sprite[] quadrosAndar = new Sprite[12];

        private SpriteRenderer _renderer;
        private float _tempoAnimacao;

        public Sprite[] QuadrosAndar { set => quadrosAndar = value; }

        private void Awake()
        {
            _renderer = GetComponent<SpriteRenderer>();
        }

        private void LateUpdate()
        {
            var camera = Camera.main;
            if (camera != null) transform.rotation = camera.transform.rotation;
        }

        public void AtualizarQuadro(int direcaoCardinal, bool movendo)
        {
            int coluna;
            if (movendo)
            {
                _tempoAnimacao += Time.deltaTime;
                int indice = Mathf.FloorToInt(_tempoAnimacao / SegundosPorQuadro) % CicloDeAndar.Length;
                coluna = CicloDeAndar[indice];
            }
            else
            {
                _tempoAnimacao = 0f;
                coluna = 1;
            }

            if (quadrosAndar == null || quadrosAndar.Length < 12 || _renderer == null) return;
            var quadro = quadrosAndar[direcaoCardinal * 3 + coluna];
            if (quadro != null) _renderer.sprite = quadro;
        }
    }
}
