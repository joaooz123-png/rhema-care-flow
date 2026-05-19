# Rhema Care Flow — Biblioteca Viva

A Biblioteca Viva é a camada de conhecimento permanente do Rhema Care Flow.

Ela não é apenas uma pasta de documentos. É um sistema de crescimento contínuo que transforma decisões clínicas, bugs, aprendizados de produto, integrações, protocolos e hipóteses técnicas em conhecimento reutilizável.

## Princípio central

> Cada bug corrigido, cada feature criada, cada decisão clínica e cada integração validada deve virar conhecimento versionado.

A biblioteca cresce por ciclos curtos:

1. Capturar.
2. Classificar.
3. Escrever.
4. Validar.
5. Publicar.
6. Conectar ao app.
7. Auditar.
8. Repetir.

## Camadas da biblioteca

### 1. Produto

Registra como o Rhema Care Flow funciona para o usuário final.

Exemplos:

- Prescrições.
- IA clínica/configuracional.
- Prontuário integrado.
- Biblioteca pública.
- Timeline longitudinal.
- Teleconsulta.
- Analytics.

### 2. Técnica

Registra decisões de arquitetura, hooks, componentes, Supabase, RLS, Edge Functions, GitHub Actions e integrações.

Exemplos:

- Como criar migration segura.
- Como estruturar RLS.
- Como criar componente mobile-first.
- Como testar uma Edge Function.
- Como evitar loop de renderização.

### 3. Clínica

Registra conhecimento clínico e operacional de saúde, sempre com revisão humana antes de uso assistencial.

Exemplos:

- Jornada do paciente reumatológico.
- Scores e monitoramento.
- Segurança medicamentosa.
- Educação do paciente.
- Red flags.
- Continuidade do cuidado.

### 4. Estratégica

Registra tese, posicionamento, pitch, PD&I, Finep, ENISA, UHS Health OS, Protocolo Vida e visão de mercado.

Exemplos:

- Camada operacional clínica.
- Hybrid Trust Architecture.
- URV clínica.
- Interoperabilidade FHIR.
- Validação B2B/B2G.

## Fontes de crescimento

A biblioteca deve crescer a partir de:

- Issues abertas.
- Pull requests mesclados.
- Bugs recorrentes.
- Conversas de produto.
- Testes de usuário.
- Protocolos clínicos.
- Migrations Supabase.
- Edge Functions.
- Documentos estratégicos.
- Perguntas frequentes dos usuários.

## Regra de ouro

Nenhuma expansão deve virar ruído.

Cada item precisa ter:

- Título claro.
- Categoria.
- Status.
- Fonte.
- Aplicação prática.
- Próximo passo.
- Critério de validação.

## Estrutura

- `growth-protocol.md`: regras de crescimento contínuo.
- `catalog.json`: catálogo inicial de sementes de conhecimento.
- `seeds/`: artigos-base que podem ser convertidos em conteúdo do app.
- `templates/`: modelos para novos artigos, decisões e auditorias.

## Como usar

O Builder Agent consulta esta biblioteca antes de criar uma feature.

O Auditor Agent consulta esta biblioteca antes de aprovar uma alteração.

O app pode consumir parte dessa biblioteca no futuro via Supabase, RAG, embeddings ou artigos públicos em `/biblioteca`.

## Estados de um item

- `seed`: ideia inicial ainda não validada.
- `draft`: texto em elaboração.
- `review`: aguardando revisão humana/técnica.
- `published`: pronto para uso.
- `deprecated`: substituído ou obsoleto.

## Política clínica

Conteúdo clínico pode apoiar educação, produto e organização do raciocínio, mas não deve substituir avaliação médica. Qualquer material clínico precisa ser revisado antes de ser apresentado como orientação assistencial.
