/* ===================================================================
   ESTRUTURA PREPARADA PRA COMBATE POR TURNOS (seção 19, item 27 da
   Vertical Slice) — ainda NÃO implementado nesta fatia. Existe aqui só
   pra provar que a arquitetura já separa "dados de combate" de "como o
   tempo passa": um `TurnBasedBattle` real receberia os MESMOS
   `player`, `mobs`, skills/magias de combat.js — troca só como as
   ações são disparadas (fila de turno em vez de cooldown de relógio).

   Não implementar isto de verdade agora seria inventar UI/fluxo sem um
   caso de uso real pra testar contra; o contrato abaixo é o que evita
   a app real ter que saber qual modo está ativo além de chamar
   `iniciar()`/`agirTurno()`. */
export class TurnBasedBattle {
  constructor({ aliados, inimigos }) {
    this.aliados = aliados; // mesmos objetos Player/aliado do modo tempo real
    this.inimigos = inimigos; // mesmos objetos Mob
    this.fila = [];
    this.ativo = false;
  }

  /** TODO(vertical slice futura): ordenar `fila` por destreza/velocidade
   *  e abrir o primeiro turno. Ainda não chamado por lugar nenhum. */
  iniciar() {
    throw new Error('TurnBasedBattle.iniciar() ainda não implementado — ver seção 19 do documento de projeto.');
  }

  /** TODO: receber uma ação (ataque/skill/magia/item) do ator da vez,
   *  aplicar com a MESMA `multiplicadorElemental` de core/elements.js
   *  usada no tempo real, e passar a vez. */
  agirTurno(_acao) {
    throw new Error('TurnBasedBattle.agirTurno() ainda não implementado — ver seção 19 do documento de projeto.');
  }
}
