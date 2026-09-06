using System;

namespace EterAnima.Core
{
    /// <summary>
    /// Atributos (seção 20) e fórmulas derivadas. HP/Mana nascem de
    /// Constituição/Inteligência — não são digitados à mão por personagem,
    /// então balancear um atributo já reflete em tudo que depende dele.
    /// </summary>
    [Serializable]
    public struct AtributosPersonagem
    {
        public int Forca, Destreza, Constituicao, Inteligencia, Sabedoria, Sorte;

        public static AtributosPersonagem Base() => new()
        {
            Forca = 5, Destreza = 5, Constituicao = 5,
            Inteligencia = 5, Sabedoria = 5, Sorte = 5,
        };

        public AtributosPersonagem ComBonusDeRaca(TipoRaca raca)
        {
            var bonus = InfoRaca.De(raca);
            return new AtributosPersonagem
            {
                Forca = Forca + bonus.Forca,
                Destreza = Destreza + bonus.Destreza,
                Constituicao = Constituicao + bonus.Constituicao,
                Inteligencia = Inteligencia + bonus.Inteligencia,
                Sabedoria = Sabedoria + bonus.Sabedoria,
                Sorte = Sorte + bonus.Sorte,
            };
        }

        public int HpMaximo(int nivel) => Arredondar(30 + Constituicao * 6 + nivel * 8);
        public int ManaMaxima(int nivel) => Arredondar(15 + Inteligencia * 4 + Sabedoria * 2 + nivel * 4);
        public float DanoFisicoBase() => 3 + Forca * 1.2f;
        public float DanoMagicoBase() => 3 + Inteligencia * 1.3f;

        /// <summary>
        /// Destreza afeta pouco de propósito — corrida é o que muda o ritmo
        /// de exploração de verdade; destreza deveria decidir combate
        /// (crítico/esquiva), não virar corrida de atributo.
        /// </summary>
        public float VelocidadeMovimento() => 3.2f + Destreza * 0.02f;
        public float ChanceCritico() => System.Math.Min(0.35f, 0.03f + Sorte * 0.01f + Destreza * 0.005f);

        private static int Arredondar(float valor) => (int)System.Math.Round(valor, System.MidpointRounding.AwayFromZero);
    }

    [Serializable]
    public struct Progresso
    {
        public int Nivel;
        public int Xp;
        public int ProximoNivel;

        public static Progresso Inicial() => new() { Nivel = 1, Xp = 0, ProximoNivel = XpParaNivel(1) };

        public static int XpParaNivel(int nivel) => (int)System.Math.Round(40 * System.Math.Pow(nivel, 1.35));

        /// <summary>Aplica XP e retorna quantos níveis subiram (0 se nenhum).</summary>
        public int GanharXp(int quantidade)
        {
            Xp += quantidade;
            int subiu = 0;
            while (Xp >= ProximoNivel)
            {
                Xp -= ProximoNivel;
                Nivel += 1;
                ProximoNivel = XpParaNivel(Nivel);
                subiu += 1;
            }
            return subiu;
        }
    }
}
