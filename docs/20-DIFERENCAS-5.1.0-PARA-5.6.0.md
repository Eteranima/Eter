# O que mudou de 5.1.0 para 5.6.0

A fonte 5.6.0 acrescenta 889 linhas e remove 52 em relação à 5.1.0.

- Madao amplia o elenco para nove personagens e recebe árvore própria;
- `q_batedora` amplia as missões de recrutamento para oito;
- o pátio inicia a cena `abertura_patio` e a narrativa ganha novas cenas;
- a cobertura interna vigente executa 753 asserções;
- a jornada E2E percorre os nove protagonistas, recrutamento, árvore, menu,
  movimento e combate.

O HTML recebido foi preservado no histórico pelo SHA-256
`29b8058424cbc1f56995f6e41712981d61dd081ecae679a49cfc6fda72279c9b`.
O ajuste posterior do autoteste não altera mecânica: remove uma hipótese
obsoleta sobre a cobertura de dois glifos da fonte e mantém a validação das
larguras e dos fallbacks.
