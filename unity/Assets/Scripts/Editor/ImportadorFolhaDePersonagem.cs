using UnityEditor;
using UnityEngine;

namespace EterAnima.EditorTools
{
    /// <summary>
    /// Fatia automaticamente toda textura importada de Assets/Art/Characters
    /// (ou Assets/Art/Npcs) em 3 colunas × 4 linhas — a MESMA convenção do
    /// motor antigo (down/left/right/up, coluna do meio = pose parada) já
    /// reaproveitada no protótipo Three.js. Sem isto, cada folha nova exigiria
    /// abrir o Sprite Editor manualmente e arrastar 12 retângulos à mão.
    /// </summary>
    public class ImportadorFolhaDePersonagem : AssetPostprocessor
    {
        private const int Colunas = 3;
        private const int Linhas = 4;

        private bool EhFolhaDePersonagem()
        {
            string caminho = assetPath.Replace('\\', '/');
            return caminho.Contains("/Art/Characters/") || caminho.Contains("/Art/Npcs/");
        }

        private void OnPreprocessTexture()
        {
            if (!EhFolhaDePersonagem()) return;

            var importador = (TextureImporter)assetImporter;
            importador.textureType = TextureImporterType.Sprite;
            importador.spriteImportMode = SpriteImportMode.Multiple;
            importador.filterMode = FilterMode.Point; // pixel art nítido, sem borrão
            importador.textureCompression = TextureImporterCompression.Uncompressed;
            importador.alphaIsTransparency = true;
            importador.mipmapEnabled = false;
            importador.wrapMode = TextureWrapMode.Clamp;
            importador.spritePixelsPerUnit = 128; // 1 unidade Unity ≈ 1 tile de personagem
        }

        private void OnPostprocessTexture(Texture2D textura)
        {
            if (!EhFolhaDePersonagem()) return;

            var importador = (TextureImporter)assetImporter;
            int frameW = textura.width / Colunas;
            int frameH = textura.height / Linhas;

            var metas = new SpriteMetaData[Colunas * Linhas];
            for (int linha = 0; linha < Linhas; linha++)
            {
                for (int coluna = 0; coluna < Colunas; coluna++)
                {
                    int indice = linha * Colunas + coluna;
                    // Y da textura cresce de baixo pra cima; linha 0 (down) é a
                    // de CIMA na imagem, então inverte aqui.
                    int yNaImagem = Linhas - 1 - linha;
                    metas[indice] = new SpriteMetaData
                    {
                        name = $"{textura.name}_{indice}",
                        rect = new Rect(coluna * frameW, yNaImagem * frameH, frameW, frameH),
                        alignment = (int)SpriteAlignment.Custom,
                        pivot = new Vector2(0.5f, 0f), // âncora no PÉ, mesma ideia de sempre no projeto
                    };
                }
            }
            importador.spritesheet = metas;
        }
    }
}
