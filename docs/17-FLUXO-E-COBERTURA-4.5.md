# Fluxo do jogo 4.5.0 e cobertura de teste

Levantado em 18/08/2026 lendo o HTML e dirigindo o jogo publicado por teclado.
Existe porque a versão anterior partia de outro desenho, e testar por suposição
custou três erros seguidos antes de eu abrir o jogo.

## Fluxo real

```
TITLE ─ "Novo Jogo" ──────→ CHOOSE (Quem Começa) ─ z ─→ FIELD
      └ "Continuar" (só aparece se há save) ───────────→ FIELD
```

Cenas: `TITLE`, `CHOOSE`, `FIELD`, `MENU`, `BATTLE`, `DIALOGUE`, `SHOP`.

## Elenco: começa com um

A tela "Quem Começa" oferece os **seis** personagens como protagonista, mas o
jogo começa com **um**. A própria tela avisa: *"Você joga sozinho até a primeira
missão. O resto do elenco entra depois, um por missão entregue."*

O elenco se completa entregando cinco missões:

```
q_zelador · q_bibliotecaria · q_veterano · q_enfermeira · q_mercador
```

O mapa missão→personagem **não é fixo**: `montarRecrutas` sorteia no início e
guarda no save, senão o escolhido apareceria como recompensa de si mesmo.

Há uma regra de segurança de progressão: `CURANDEIROS = ['Ophelia', 'Eden']`.
Se o protagonista não for um deles, o primeiro recruta é — começar sem cura
trava o jogador na primeira região.

## Grupo: campo e reserva

Até **5 em campo**; o restante fica na reserva e ganha **50% do EXP**. Isso
substitui os dois grupos de três do 4.0.1. No menu Grupo: `Z` pega e troca,
`C` entra e sai do campo, `TAB` define o líder.

## Navegação, com uma armadilha

`navList` move com cima/baixo **e** com esquerda/direita numa lista de coluna
única — ficar surdo a metade do direcional passaria impressão de travamento no
D-pad do celular.

**Exceção:** a tela "Quem Começa" é horizontal e o rodapé diz `‹ › escolher`.
Cima e baixo não fazem nada ali. A loja usa `lr:false` porque esquerda e
direita já trocam de categoria.

## O que o teste cobre hoje

`tests/e2e/executar.sh` dirige o jogo publicado por teclado real e prova:

| Área | Prova |
|---|---|
| Título | oferece "Novo Jogo" |
| Escolha | os seis são ofertados; `‹ ›` movem o cursor |
| Início | o elenco começa com **um**, e é o escolhido |
| Movimento | as quatro direções movem um tile |
| Menu | abre por tecla e as 8 páginas desenham sem erro |
| Retorno | fechar o menu devolve o controle ao personagem |
| Troca | `TAB` com elenco de um não quebra nem tira do campo |
| Combate | o encontro abre e aceita comando |
| Higiene | zero erro de página ou console |

Sai com 15 screenshots como evidência.

## O que NÃO está coberto

- **Recrutamento** — nenhuma missão é entregue, então o elenco nunca cresce
- **Grupo e reserva** — impossível exercitar com um personagem
- **Loja e diálogo de NPC** — cenas `SHOP` e `DIALOGUE` intocadas
- **Transição de mapa** — nenhuma porta é atravessada
- **Combate além do primeiro comando** — sem ataque, habilidade, item, fuga,
  vitória, derrota nem subida de nível

## Armadilhas registradas

**Esperar a transição antes de fotografar.** A entrada em combate passa por um
efeito que cobre a tela; fotografar antes registra o efeito e parece tela
quebrada. Quase virou um defeito relatado que não existia.

**`G`, `Menu` e `Escolha` são `const` de script clássico.** Existem como
identificador global, não como propriedade de `globalThis`.

**Tecla é "apertada neste quadro" e some no fim dele.** Um toque solto logo
depois de troca de cena pode cair entre quadros. O teste insiste até o estado
mudar, que é o que um jogador faz.

## Autoteste embutido do jogo

O jogo traz o próprio autoteste, disparado por `?test` — `runSelfTests()` roda
sozinho 250 ms depois de carregar e desenha o relatório na página. São **273
asserções** de lógica pura e integridade de dados, escritas pelo autor. Valem
mais que suposição externa sobre o que deveria funcionar.

`tests/e2e/autoteste.spec.ts` abre a página com `?test` e lê o relatório.

**Não chame `runSelfTests()` de novo pela automação.** A página já o executou, e
a segunda passada acusa falso na asserção que confere a restauração do registro
de arte, porque a primeira já mexeu no estado.

### Resultado em 18/08/2026: 272/273

Duas observações, nenhuma delas afeta quem joga:

**1. Asserção de glifo com premissa vencida.** A asserção *"a fonte de pixel
realmente não tem ◄ ►"* falha com `ausentes:` vazio. A heurística mede a largura
do glifo e compara com a do `M`: numa fonte monoespaçada, glifo presente e
recurso de fallback monoespaçado medem igual, então ela não distingue os dois.
A premissa que ela existia para justificar não se sustenta mais.

**2. Erro de desenho durante o próprio autoteste.** O `?test` produz
`TypeError: Cannot read properties of undefined (reading 'sheet')` em
`drawField`. O autoteste esvazia `G.party` para exercitar a formação compacta e
o laço de desenho continua rodando por `requestAnimationFrame`, então um quadro
é desenhado com `leaderChar()` indefinido.

O jogo normal **não** produz erro nenhum — verificado à parte. A correção
natural seria o autoteste suspender o desenho enquanto mexe no elenco, ou
`drawField` tolerar elenco vazio.
