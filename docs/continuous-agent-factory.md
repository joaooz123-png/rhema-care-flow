# Rhema Care Flow — Fábrica Contínua de Código

Este documento define a arquitetura operacional para o Rhema Care Flow evoluir de forma contínua, com dois papéis complementares: um agente construtor e um agente auditor.

## Objetivo

Criar um fluxo permanente em que o código do app aumente, seja organizado e seja corrigido sem depender de intervenções manuais caóticas, mantendo qualidade mínima de produção.

A regra central é simples:

> O agente construtor propõe. O agente auditor bloqueia, corrige ou aprova. Nada entra direto no branch vivo sem passar pela esteira.

## Branches

- `mainn`: branch vivo do projeto e base de deploy.
- `agent/builder-*`: branches de implementação incremental.
- `agent/auditor-*`: branches de correção técnica, bugfix e hardening.
- `fix/*`: correções pontuais.
- `feat/*`: novas funcionalidades.

## Agente 1 — Builder Agent

Responsável por tecer o app continuamente.

### Funções

- Transformar ideias em pequenas unidades implementáveis.
- Criar ou editar componentes React.
- Adicionar hooks, páginas, rotas e integrações Supabase.
- Criar migrations quando necessário.
- Atualizar documentação técnica.
- Abrir PRs pequenos, com descrição clara.

### Regras

- Nunca commitar direto em `mainn`.
- Cada PR deve resolver uma unidade clara: uma tela, um bug, um hook ou uma melhoria.
- Não misturar feature nova com refatoração ampla.
- Toda feature clínica deve preservar privacidade, LGPD e mínimo de dados identificáveis.
- Toda tela nova precisa ter estado vazio, loading, erro e comportamento mobile.

## Agente 2 — Auditor Agent

Responsável por impedir que o projeto cresça torto.

### Funções

- Rodar TypeScript, ESLint, testes e build.
- Procurar regressões visuais e bugs primários de UX.
- Revisar overflow, rolagem, responsividade, botões ocultos, textos longos e formulários.
- Verificar se hooks mantêm estado corretamente.
- Auditar Supabase/RLS/migrations quando houver alteração de banco.
- Abrir issue ou PR de correção quando encontrar problema.

### Checklist mínimo de auditoria

- `npm ci`
- `npx tsc --noEmit`
- `npx eslint src --ext .ts,.tsx`
- `npm test -- --passWithNoTests`
- `npm run build`

Além disso, revisar manualmente:

- Texto longo com botão “Ver mais”.
- Scroll em cards, dialogs e chat.
- Formulários com rascunho/autosave.
- Prescrições: medicamento, dose, frequência, CID-10, observações, salvar rascunho, salvar e assinar.
- IA: resposta em streaming, JSON comum, erro de crédito, erro de sessão, resposta vazia.
- Mobile: abas, cabeçalhos, botões e listas.

## Esteira operacional

1. Usuário cria uma intenção: bug, melhoria ou nova feature.
2. Builder Agent quebra a intenção em PR pequeno.
3. CI roda automaticamente.
4. Auditor Agent revisa o PR.
5. Se houver erro, Auditor Agent abre comentários ou PR de correção.
6. Só depois o PR é mesclado em `mainn`.
7. Lovable/Supabase/deploy consomem o branch vivo.

## Integrações recomendadas

### GitHub

Fonte da verdade do código, issues, PRs, CI e histórico de decisões.

### Lovable

Camada rápida de prototipagem visual e edição assistida, sincronizada ao repositório.

### Supabase

Backend, autenticação, tabelas, RLS, storage, edge functions e banco vetorial quando usado.

### GitHub Actions

Auditoria automática mínima: typecheck, lint, testes e build.

### Assistente de código/IA

Deve atuar via branch e PR, nunca com escrita direta no branch vivo.

## Política de qualidade para o Rhema Care Flow

Toda entrega precisa respeitar quatro critérios:

1. Funciona para o usuário final.
2. Não quebra o build.
3. Não expõe dado clínico sensível.
4. Melhora o produto sem criar dívida técnica invisível.

## Roadmap da fábrica contínua

### Fase 1 — Base de segurança

- Corrigir CI para branch `mainn`.
- Criar workflow de auditoria programada.
- Documentar arquitetura de agentes.
- Criar labels de GitHub: `agent-builder`, `agent-auditor`, `bug`, `ux`, `supabase`, `ai`, `prescriptions`.

### Fase 2 — Correção de UX primária

- Corrigir scroll e overflow de textos longos.
- Padronizar “Ver mais / Ver menos”.
- Auditar prescriptions.
- Auditar IA.
- Auditar dialogs em mobile.

### Fase 3 — Expansão controlada

- Builder Agent passa a criar features por módulos.
- Auditor Agent bloqueia PRs com erro de build ou UX crítico.
- Issues viram backlog vivo.

### Fase 4 — Autonomia supervisionada

- Execução agendada de auditoria.
- Geração automática de relatório de bugs.
- PRs automáticos de correção simples.
- Revisão humana apenas para merges relevantes.

## Prompt operacional do Builder Agent

Você é o Builder Agent do Rhema Care Flow. Sua função é evoluir o app em incrementos pequenos e seguros. Trabalhe sempre em branch própria. Não faça mudanças amplas sem necessidade. Preserve privacidade clínica, Supabase/RLS, mobile-first e estados de loading/empty/error. Ao final, abra PR com resumo, arquivos alterados, riscos e checklist.

## Prompt operacional do Auditor Agent

Você é o Auditor Agent do Rhema Care Flow. Sua função é encontrar bugs antes do usuário. Revise TypeScript, ESLint, build, testes, UX, scroll, textos longos, formulários, prescriptions, IA, Supabase e responsividade. Se encontrar problema, descreva impacto, causa provável e correção sugerida. Se for simples, abra PR de correção. Nunca aprove algo que quebra build, privacidade ou uso básico.
