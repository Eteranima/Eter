# AGENTS.md — ToolsForOffice (TFO)

Este documento define como qualquer agente (humano ou IA) deve trabalhar neste repositório. Leia também `docs/ARQUITETURA.md`, `docs/PLANO-DE-TRABALHO.md` e `tasks.md` antes de alterar qualquer coisa.

## Objetivo do projeto

O TFO é uma plataforma modular de ferramentas rápidas de escritório, com Shell (barra) em Desktop (Windows 10/11) e app equivalente em Mobile (Android), com módulos independentes que podem ser locais ou sincronizados via NecroServer. Ver `README.md` para a visão geral.

## Relação com o HelpTools

O TFO **não é** um item de `apps/` do HelpTools. É um projeto irmão, com regras próprias, porque assume coisas que o HelpTools proíbe deliberadamente (processo residente, rede, login opcional). Módulos que nascerem simples e sem rede podem eventualmente ser candidatos a virar utilitários do HelpTools também — mas a via oficial de desenvolvimento de módulos do TFO é este repositório (e os repositórios satélite de módulos que crescerem, como o AutoClick).

Nunca "silenciosamente" enfraqueça as regras do HelpTools para acomodar necessidade do TFO. Se um módulo do TFO precisar de algo que o HelpTools proíbe, a resposta é "este módulo vive no TFO", não "vamos abrir exceção no HelpTools".

## Regra universal de aceite de um módulo

Um módulo só está pronto quando:

1. Tem um `modulo.json` completo (nome, versão, hotkey padrão, se usa rede/IA/login, tipo de execução — embutido ou processo separado);
2. Declara corretamente sua categoria: **local** (padrão, sem rede/login) ou **exceção de rede** (documentada, com justificativa);
3. Funciona sem login, a menos que a própria função dependa inerentemente de conta externa (ex.: conectar Google Calendar exige OAuth por natureza);
4. Tem testes mínimos e smoke test manual documentado, no padrão de qualidade já usado no HelpTools (ver `AGENTS.md` do HelpTools como referência de rigor, não como regra a copiar literalmente);
5. Tem sua especificação em `modulos/<slug>/README.md` **antes** de começar a ser implementado — este projeto documenta antes de codificar.

## Modelo de login (referência: Microsoft Authenticator)

- Login é **sempre opcional** e nunca é solicitado na abertura do app.
- Login existe apenas em "Configurações → Conta", como uma ação deliberada do usuário.
- Sem login: módulos locais funcionam 100%; módulos com sync funcionam em modo local-only (sem espelhamento entre dispositivos).
- Com login: módulos com sync passam a sincronizar com o NecroServer; dados locais já existentes são enviados por merge, nunca substituídos.
- Logout nunca apaga dados locais — só interrompe a sincronização.
- É um login único do TFO (via Logto), não um login por módulo.

## Categorias de módulo

| Categoria | Regra | Exemplos |
|---|---|---|
| **Local** | 100% offline, sem login, sem dado saindo do dispositivo | Conversor Inteligente, QR Code, Captura+Editor, Clipboard Avançado, Consulta de Documentos, Cronômetro/Pomodoro, Central de Links, Extrator de Texto (OCR local), AutoClick |
| **Exceção de rede — sync** | Sincroniza com NecroServer, exige login para sync (funciona local-only sem login) | Tasks, Assistente de Reunião (ata/transcrição) |
| **Exceção de rede — IA** | Chama proxy de IA no NecroServer, exige login **sempre** (custo de terceiro precisa de identidade; sem cota anônima — decisão confirmada pelo usuário) | Chat Rápido IA |
| **Exceção de rede — externa** | Depende de conta de terceiro por natureza (OAuth) | Calendário (contas Google/Outlook) — o calendário corporativo `.ics` importado NÃO exige login |

Toda "Exceção de rede" precisa estar listada explicitamente na tabela de módulos de `docs/ARQUITETURA.md`, com a justificativa registrada. Não é permitido um módulo silenciosamente virar "exceção de rede" sem essa documentação.

## Como pensar e processar decisões neste projeto

- **Documentar antes de implementar.** Toda decisão de arquitetura ou de módulo nasce como documento (`modulos/<slug>/README.md` ou atualização de `docs/ARQUITETURA.md`) antes de qualquer código.
- **Modularidade real, não só de nome.** Um módulo deve poder ser removido sem quebrar outro. Se dois módulos parecem precisar compartilhar lógica, a resposta é extrair uma biblioteca comum explícita (ex.: parser de linguagem natural para datas), não acoplar um módulo ao outro.
- **Local-first sempre que possível.** Antes de propor que algo precise do NecroServer, pergunte: "isso pode ser resolvido inteiramente no dispositivo?". Só vira exceção de rede se a resposta for genuinamente não.
- **Custo de IA é um recurso finito.** Qualquer módulo que chame IA em nuvem deve justificar por que não pode ser resolvido com lógica determinística local primeiro (ex.: o Conversor Inteligente resolve por parser local, não por IA).
- **Português do Brasil** em toda interface e documentação, seguindo o padrão do HelpTools.
- **Registrar tudo em `tasks.md`**, no mesmo modelo de registro vitalício usado no HelpTools e na BibliotecaDenverso: decisões (com alternativas descartadas e o porquê), tarefas planejadas, problemas e resoluções, ações executadas. Tentativas interrompidas, falhas de validação e caminhos deliberadamente abandonados também são fatos do projeto e devem ser registrados com causa, impacto e resolução ou pendência.

## Tom e estilo de comunicação

- Direto, sem enrolação, mas nunca omitindo informação relevante de arquitetura ou risco.
- Quando uma decisão do usuário conflita com uma boa prática técnica ou com uma restrição legal/de segurança (ex.: consulta de CPF de terceiros), isso deve ser dito claramente, com a alternativa segura proposta — nunca implementado silenciosamente do jeito arriscado nem recusado sem explicação.
- Nomes de modelos de IA, preços e capacidades mudam rápido: nunca afirmar como fato algo não verificado numa fonte atual; pesquisar quando necessário.

## Agentes especializados de desenvolvimento

Este projeto usa subagentes de IA especializados por responsabilidade técnica (não um por módulo) para evitar sobrecarga de contexto: `tfo-engine`, `tfo-modulos`, `tfo-design`, `tfo-integracoes`, `tfo-registro`, definidos em `.claude/agents/`. A conversa principal atua como orquestrador, delegando tarefas com contexto mínimo e documentando o resultado — nunca repassando contexto de conversa bruto entre agentes. Ver `docs/AGENTES-DE-TRABALHO.md` para o modelo completo.

## Onde estão as fontes de verdade

| Assunto | Fonte |
|---|---|
| Arquitetura técnica completa | `docs/ARQUITETURA.md` |
| Ordem de execução e cronograma | `docs/PLANO-DE-TRABALHO.md` |
| Decisões, tarefas, problemas, ações | `tasks.md` |
| Especificação de cada módulo | `modulos/<slug>/README.md` |
| Infraestrutura real do NecroServer (Postgres, rede, domínios, Logto, Garage S3) | Repositório `BibliotecaDenverso`, pastas `inventario/` e `aplicacoes/` |
| Regras do repositório irmão (HelpTools) | Repositório `HelpTools`, `AGENTS.md`/`CLAUDE.md` |
| Retomar trabalho em um chat novo | `HANDOFF.md` |

## Fluxo mínimo por módulo (a partir da Fase 1)

1. Escrever/atualizar `modulos/<slug>/README.md` com objetivo, categoria, fluxo, modelo de dados, dependências e critérios de aceite mensuráveis.
2. Implementar com dependências mínimas, respeitando a categoria declarada (local vs. exceção de rede).
3. Testes automatizados + smoke test manual na(s) plataforma(s) alvo do módulo.
4. Build e (quando aplicável) assinatura, seguindo o mesmo padrão de segurança de release do HelpTools (Authenticode para desktop).
5. Registrar em `tasks.md`: decisão, ação executada, e qualquer problema encontrado — inclusive uma tentativa que não chegou à entrega. Quando o usuário autorizar a publicação, documentação, commit e push fazem parte da mesma entrega, depois da validação.

Não fazer commit ou push sem solicitação explícita do usuário.
