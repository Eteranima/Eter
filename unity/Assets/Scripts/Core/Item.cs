namespace EterAnima.Core
{
    public enum TipoItem { Equipamento, Consumivel }

    /// <summary>Dado puro de item — sem ScriptableObject de propósito
    /// (mesmo padrão de Elemento/Raca: tudo em código, nada de asset pra
    /// configurar na mão no Editor).</summary>
    [System.Serializable]
    public class Item
    {
        public string Id;
        public string Nome;
        public TipoItem Tipo;

        // Equipamento
        public int BonusDanoFisico;
        public int BonusDanoMagico;

        // Consumível
        public int CuraHp;
        public int CuraMana;
    }

    public static class ItensPredefinidos
    {
        public static Item Criar(string id) => id switch
        {
            "espada_treino" => new Item { Id = id, Nome = "Espada de Treino", Tipo = TipoItem.Equipamento, BonusDanoFisico = 6 },
            "anel_do_fogo" => new Item { Id = id, Nome = "Anel do Fogo", Tipo = TipoItem.Equipamento, BonusDanoMagico = 8 },
            "pocao_vida" => new Item { Id = id, Nome = "Poção de Vida", Tipo = TipoItem.Consumivel, CuraHp = 30 },
            "pocao_mana" => new Item { Id = id, Nome = "Poção de Mana", Tipo = TipoItem.Consumivel, CuraMana = 25 },
            _ => new Item { Id = id, Nome = $"Item desconhecido ({id})", Tipo = TipoItem.Consumivel },
        };
    }
}
