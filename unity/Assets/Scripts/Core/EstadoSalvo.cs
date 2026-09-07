using System;

namespace EterAnima.Core
{
    /// <summary>Dado puro persistido em disco (JSON via JsonUtility) —
    /// sem lógica, só os campos que o save precisa gravar/restaurar.</summary>
    [Serializable]
    public class EstadoSalvo
    {
        public float posX;
        public float posY;
        public float posZ;
        public int nivel;
        public int xp;
        public int hpAtual;
        public int manaAtual;
        public int ouro;
        public string[] itensIds;
        public string itemEquipadoId; // "" se nenhum equipado
    }
}
