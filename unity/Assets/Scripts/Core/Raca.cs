namespace EterAnima.Core
{
    /// <summary>
    /// Raças da Aliança (seções 8-13 e 36 do documento de projeto).
    /// Cada raça dá bônus/afinidade de atributo, nunca uma classe — dois
    /// Humanos podem construir builds totalmente diferentes.
    /// </summary>
    public enum TipoRaca
    {
        Humano, Elfo, Lycan, Vampiro, MortoVivo,
    }

    /// <summary>Bônus fixo somado por cima dos atributos base (ver AtributosPersonagem).</summary>
    public struct BonusRaca
    {
        public int Forca, Destreza, Constituicao, Inteligencia, Sabedoria, Sorte;
        public TipoElemento? Afinidade;
        public float VidaAoAcertarPercentual; // 0 = sem lifesteal passivo (só Vampiro tem)

        public BonusRaca(int forca, int destreza, int constituicao, int inteligencia, int sabedoria, int sorte,
            TipoElemento? afinidade = null, float vidaAoAcertarPercentual = 0f)
        {
            Forca = forca; Destreza = destreza; Constituicao = constituicao;
            Inteligencia = inteligencia; Sabedoria = sabedoria; Sorte = sorte;
            Afinidade = afinidade;
            VidaAoAcertarPercentual = vidaAoAcertarPercentual;
        }
    }

    public static class InfoRaca
    {
        public static BonusRaca De(TipoRaca raca) => raca switch
        {
            TipoRaca.Humano => new BonusRaca(1, 1, 1, 1, 1, 1),
            TipoRaca.Elfo => new BonusRaca(-1, 1, -1, 2, 2, 1, TipoElemento.Vento),
            TipoRaca.Lycan => new BonusRaca(3, 2, 1, -2, -1, 0, TipoElemento.Terra),
            TipoRaca.Vampiro => new BonusRaca(1, 2, 0, 1, 0, 1, TipoElemento.Sangue, vidaAoAcertarPercentual: 0.08f),
            TipoRaca.MortoVivo => new BonusRaca(1, 0, 3, 0, 1, -1, TipoElemento.Trevas),
            _ => new BonusRaca(0, 0, 0, 0, 0, 0),
        };
    }
}
