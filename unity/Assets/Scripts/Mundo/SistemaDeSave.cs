using System.IO;
using EterAnima.Core;
using UnityEngine;

namespace EterAnima.Mundo
{
    /// <summary>Save básico da vertical slice: um arquivo JSON só, sem
    /// slots múltiplos — grava em Application.persistentDataPath, que
    /// sobrevive a builds e é o local padrão recomendado pela Unity pra
    /// dado de save (não é a pasta do projeto).</summary>
    public static class SistemaDeSave
    {
        private const string NomeArquivo = "save_eter_anima.json";
        private static string Caminho => Path.Combine(Application.persistentDataPath, NomeArquivo);

        public static void Salvar(EstadoSalvo estado)
        {
            string json = JsonUtility.ToJson(estado, true);
            File.WriteAllText(Caminho, json);
            Debug.Log($"[Éter Anima] Jogo salvo em {Caminho}");
        }

        public static bool TentarCarregar(out EstadoSalvo estado)
        {
            if (!File.Exists(Caminho))
            {
                estado = null;
                return false;
            }

            string json = File.ReadAllText(Caminho);
            estado = JsonUtility.FromJson<EstadoSalvo>(json);
            return estado != null;
        }
    }
}
