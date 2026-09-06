using UnityEngine;

namespace EterAnima.CameraSystem
{
    /// <summary>
    /// Câmera (seção 17) — segue o personagem, mostra profundidade,
    /// trabalha com diferentes alturas. Terceira pessoa fixa atrás do
    /// jogador com suavização exponencial (não linear, pra não "grudar"
    /// de forma robótica). Mesma abordagem já validada no protótipo
    /// Three.js (next/src/world/camera-rig.js) — sem órbita de mouse
    /// nem colisão contra parede ainda (ver limitações no relatório).
    /// </summary>
    public class CameraTerceiraPessoa : MonoBehaviour
    {
        [SerializeField] private Transform alvo;
        [SerializeField] private Vector3 offset = new(0f, 5.5f, 8.5f);
        [SerializeField] private Vector3 miraOffset = new(0f, 1.2f, 0f);
        [SerializeField] private float suavizacao = 4.5f;

        public Transform Alvo { set => alvo = value; }

        private void LateUpdate()
        {
            if (alvo == null) return;

            Vector3 destino = alvo.position + offset;
            float t = 1f - Mathf.Exp(-suavizacao * Time.deltaTime);
            transform.position = Vector3.Lerp(transform.position, destino, t);
            transform.LookAt(alvo.position + miraOffset);
        }
    }
}
