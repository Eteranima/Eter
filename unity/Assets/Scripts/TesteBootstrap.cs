using EterAnima.Core;
using UnityEngine;

/// <summary>
/// Script de teste temporário — só pra confirmar que a base de dados
/// (Elemento/Raça/Atributos) compila e funciona de verdade dentro do
/// Editor. Anexa num GameObject vazio na cena, dá Play, olha o Console.
/// Pode ser apagado assim que a primeira prova real (player em campo)
/// estiver rodando.
/// </summary>
public class TesteBootstrap : MonoBehaviour
{
    private void Start()
    {
        var atributos = AtributosPersonagem.Base().ComBonusDeRaca(TipoRaca.Humano);
        var progresso = Progresso.Inicial();

        Debug.Log($"[Éter Anima] Atributos (Humano): Força {atributos.Forca}, Constituição {atributos.Constituicao}");
        Debug.Log($"[Éter Anima] HP máximo nível 1: {atributos.HpMaximo(progresso.Nivel)}");
        Debug.Log($"[Éter Anima] Mana máxima nível 1: {atributos.ManaMaxima(progresso.Nivel)}");

        float multiplicador = TabelaElemental.Multiplicador(TipoElemento.Fogo, TipoElemento.Vento);
        Debug.Log($"[Éter Anima] Fogo vs Vento (esperado 1.5): {multiplicador}");

        int subiu = progresso.GanharXp(50);
        Debug.Log($"[Éter Anima] Ganhou 50 XP, subiu {subiu} nível(is). Nível atual: {progresso.Nivel}, XP: {progresso.Xp}/{progresso.ProximoNivel}");
    }
}
