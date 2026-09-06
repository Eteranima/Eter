using UnityEditor;
using UnityEngine;

namespace EterAnima.EditorTools
{
    /// <summary>
    /// Import automático pra sprite de pose única (mobs, props do mundo) —
    /// sem grade 3×4, sem slicing, só a imagem inteira como um Sprite
    /// pronto pra usar num SpriteRenderer. Ver ImportadorFolhaDePersonagem
    /// pro caso com direções/animação.
    /// </summary>
    public class ImportadorSpriteUnico : AssetPostprocessor
    {
        private bool EhSpriteUnico()
        {
            string caminho = assetPath.Replace('\\', '/');
            return caminho.Contains("/Art/Monsters/") || caminho.Contains("/Art/Props/");
        }

        private void OnPreprocessTexture()
        {
            if (!EhSpriteUnico()) return;

            var importador = (TextureImporter)assetImporter;
            importador.textureType = TextureImporterType.Sprite;
            importador.spriteImportMode = SpriteImportMode.Single;
            importador.filterMode = FilterMode.Point;
            importador.textureCompression = TextureImporterCompression.Uncompressed;
            importador.alphaIsTransparency = true;
            importador.mipmapEnabled = true;
            importador.wrapMode = TextureWrapMode.Clamp;
            importador.spritePixelsPerUnit = 128;
        }
    }
}
