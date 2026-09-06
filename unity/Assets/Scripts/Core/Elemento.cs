using System.Collections.Generic;

namespace EterAnima.Core
{
    /// <summary>
    /// Sistema elemental (seções 4 e 5 do documento de projeto).
    /// 4 elementos primários (Fogo/Água/Terra/Vento) + 5 especiais nascidos
    /// da corrupção do Éter pelos Demônios (Gelo/Areia/Sangue/Luz/Trevas).
    /// Mesma lógica já validada no protótipo (next/src/core/elements.js),
    /// portada pra C# como a fonte de verdade definitiva do projeto.
    /// </summary>
    public enum TipoElemento
    {
        Fogo, Agua, Terra, Vento,
        Gelo, Areia, Sangue, Luz, Trevas,
    }

    public static class TabelaElemental
    {
        public const float MultiplicadorForte = 1.5f;
        public const float MultiplicadorFraco = 0.65f;
        public const float MultiplicadorNeutro = 1f;

        /// <summary>
        /// Anel primário clássico (fogo&gt;vento&gt;terra&gt;água&gt;fogo) mais os
        /// cinco especiais encaixados como a corrupção de um elemento
        /// primário específico — cada especial é forte contra a origem que
        /// o corrompeu (rompe o ciclo natural) e fraco contra o oposto dela.
        /// Combinação nova? Adicione uma linha aqui, nunca um `if` espalhado
        /// pelo código de combate.
        /// </summary>
        private static readonly Dictionary<TipoElemento, Dictionary<TipoElemento, float>> Tabela =
            new()
            {
                [TipoElemento.Fogo] = new() { [TipoElemento.Vento] = MultiplicadorForte, [TipoElemento.Agua] = MultiplicadorFraco, [TipoElemento.Gelo] = MultiplicadorForte },
                [TipoElemento.Agua] = new() { [TipoElemento.Fogo] = MultiplicadorForte, [TipoElemento.Terra] = MultiplicadorFraco, [TipoElemento.Areia] = MultiplicadorForte },
                [TipoElemento.Terra] = new() { [TipoElemento.Agua] = MultiplicadorForte, [TipoElemento.Vento] = MultiplicadorFraco, [TipoElemento.Sangue] = MultiplicadorForte },
                [TipoElemento.Vento] = new() { [TipoElemento.Terra] = MultiplicadorForte, [TipoElemento.Fogo] = MultiplicadorFraco, [TipoElemento.Luz] = MultiplicadorForte },
                [TipoElemento.Gelo] = new() { [TipoElemento.Agua] = MultiplicadorForte, [TipoElemento.Fogo] = MultiplicadorFraco },
                [TipoElemento.Areia] = new() { [TipoElemento.Terra] = MultiplicadorForte, [TipoElemento.Agua] = MultiplicadorFraco },
                [TipoElemento.Sangue] = new() { [TipoElemento.Vento] = MultiplicadorForte, [TipoElemento.Terra] = MultiplicadorFraco },
                [TipoElemento.Luz] = new() { [TipoElemento.Trevas] = MultiplicadorForte, [TipoElemento.Vento] = MultiplicadorFraco },
                [TipoElemento.Trevas] = new() { [TipoElemento.Luz] = MultiplicadorForte },
            };

        public static float Multiplicador(TipoElemento atacante, TipoElemento defensor)
        {
            if (Tabela.TryGetValue(atacante, out var linha) && linha.TryGetValue(defensor, out var valor))
            {
                return valor;
            }
            return MultiplicadorNeutro;
        }
    }
}
