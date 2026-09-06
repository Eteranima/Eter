namespace EterAnima.PlayerCore
{
    /// <summary>
    /// Direção de exibição do sprite — mesma convenção do motor antigo
    /// (15-render.js: DIR_ROW) e do protótipo Three.js: down=0, left=1,
    /// right=2, up=3. Baixo/Cima aqui significam "andando em direção à
    /// câmera" / "se afastando dela", não N/S geográfico.
    /// </summary>
    public enum DirecaoPersonagem
    {
        Baixo = 0,
        Esquerda = 1,
        Direita = 2,
        Cima = 3,
    }
}
