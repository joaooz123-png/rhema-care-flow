# Protocolo de Crescimento da Biblioteca Viva

Este protocolo define como a Biblioteca Viva cresce sem parar, mas sem perder qualidade.

## Loop de crescimento

A cada ciclo, o Builder Agent deve procurar conhecimento novo em uma destas fontes:

1. PRs recentes.
2. Issues abertas.
3. Bugs relatados pelo usuário.
4. Falhas do CI.
5. Componentes ou hooks recém-criados.
6. Migrations Supabase.
7. Edge Functions.
8. Conversas estratégicas sobre o produto.
9. Necessidades clínicas e operacionais.

Depois deve transformar isso em um item versionado da biblioteca.

## Unidade mínima de conhecimento

Cada item deve responder:

- O que é?
- Por que existe?
- Onde aparece no app?
- Qual problema resolve?
- Como testar?
- Qual risco tem?
- Qual próximo passo?

## Formato recomendado

```md
# Título

Status: seed | draft | review | published | deprecated  
Categoria: produto | técnica | clínica | estratégica  
Fonte: issue | PR | bug | conversa | protocolo | migration | edge-function  
Última revisão: AAAA-MM-DD

## Resumo

## Aplicação no Rhema Care Flow

## Como validar

## Riscos

## Próximo passo
```

## Critérios para publicar

Um item só vira `published` quando:

- Está tecnicamente correto.
- Não contradiz o produto atual.
- Não expõe dado sensível.
- Tem aplicação prática.
- Foi revisado pelo Auditor Agent ou por humano responsável.

## Critérios para virar backlog

Um item deve virar issue quando:

- Exige código novo.
- Corrige bug reproduzível.
- Altera Supabase/RLS.
- Altera fluxo clínico.
- Impacta UX primária.

## Como a biblioteca alimenta o app

A Biblioteca Viva pode alimentar:

- `/biblioteca` pública.
- IA interna.
- RAG com Supabase/pgvector.
- Documentação para Lovable.
- Prompts operacionais dos agentes.
- Checklist de auditoria.

## Frequência

- Auditoria leve: diária em dias úteis.
- Consolidação de conhecimento: semanal.
- Revisão clínica/estratégica: mensal.

## Regra anti-lixo

Não adicionar artigo apenas para “encher”.

A biblioteca não deve crescer por volume. Deve crescer por utilidade acumulada.

## Regra de rastreabilidade

Todo item deve apontar sua origem sempre que possível:

- PR número.
- Issue número.
- Arquivo.
- Módulo.
- Data.
- Decisão tomada.

## Relação com os agentes

### Builder Agent

Antes de implementar, deve consultar:

- Decisões existentes.
- Bugs conhecidos.
- Padrões de componente.
- Padrões Supabase.
- Regras de UX.

Depois de implementar, deve adicionar ou atualizar conhecimento.

### Auditor Agent

Antes de aprovar, deve verificar:

- Se o PR atualiza conhecimento quando necessário.
- Se há documentação mínima.
- Se a alteração respeita padrões existentes.
- Se a alteração cria dívida técnica oculta.
