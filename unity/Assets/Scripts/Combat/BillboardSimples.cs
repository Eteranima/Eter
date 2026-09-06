using UnityEngine;

namespace EterAnima.Combat
{
    /// <summary>Sprite de pose única (sem direção/animação) que só encara
    /// a câmera — versão simplificada de PersonagemBillboard pra mobs e
    /// NPCs parados.</summary>
    [RequireComponent(typeof(SpriteRenderer))]
    public class BillboardSimples : MonoBehaviour
    {
        private void LateUpdate()
        {
            var camera = Camera.main;
            if (camera != null) transform.rotation = camera.transform.rotation;
        }
    }
}
