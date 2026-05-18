# Knowledge Library — UHS / Rhema Care Flow

Esta documentação descreve como alimentar a Biblioteca de Conhecimento do projeto sem depender de prompts longos no Lovable.

## Objetivo

Transformar o site em um núcleo vivo de conhecimento com:

- artigos públicos;
- conteúdos restritos para usuários logados;
- documentos técnicos internos;
- preparação para busca semântica com IA/RAG;
- versionamento pelo GitHub;
- edição operacional pelo Supabase/Lovable.

## Modelo de dados

A migration `supabase/migrations/20260517190000_create_knowledge_library.sql` cria três camadas:

### `knowledge_articles`

Tabela principal para artigos, protocolos, glossário e materiais educativos.

Campos principais:

- `title`
- `slug`
- `category`
- `summary`
- `content`
- `tags`
- `visibility`: `public`, `authenticated` ou `admin`
- `status`: `draft`, `published` ou `archived`

### `knowledge_documents`

Representa documentos-fonte ligados a artigos, como PDF, Markdown, URL ou nota interna.

### `knowledge_chunks`

Trechos menores usados futuramente para busca semântica e RAG.

Contém campo `embedding vector(1536)` para compatibilidade inicial com embeddings de 1536 dimensões.

## Alimentação de conteúdo

### Via Supabase

1. Abra o Supabase do projeto.
2. Rode a migration.
3. Insira artigos em `knowledge_articles`.
4. Marque `status = 'published'` para aparecerem publicamente.
5. Use `visibility = 'authenticated'` para conteúdo restrito a usuários logados.

### Via Lovable

Prompt sugerido:

```txt
Crie uma área admin para a Biblioteca de Conhecimento usando a tabela knowledge_articles.
Permita criar, editar, publicar, arquivar e filtrar artigos por categoria, tags e visibilidade.
Use Markdown para renderizar o campo content.
Proteja a área admin para usuários autenticados.
```

## Próxima etapa: RAG

Fluxo recomendado:

1. Upload de PDF/Markdown para Supabase Storage.
2. Registro em `knowledge_documents`.
3. Quebra do documento em chunks.
4. Geração de embeddings.
5. Salvamento em `knowledge_chunks`.
6. Busca via função `match_knowledge_chunks`.
7. Resposta da IA usando apenas os trechos recuperados.

## Regra de segurança

Não colocar dados sensíveis de pacientes, CPF, RG, endereços ou documentos pessoais em artigos públicos.

Conteúdo sensível deve ficar com `visibility = 'admin'` ou em storage privado com políticas específicas.

## Prompt para criar a interface pública

```txt
Crie uma página /biblioteca usando a tabela knowledge_articles.
Ela deve listar apenas artigos published e visíveis para o usuário atual.
Inclua busca textual, filtro por categoria, filtro por tags, cards com resumo e página individual por slug.
Renderize o conteúdo em Markdown com aparência editorial.
```

## Prompt para criar busca inteligente

```txt
Adicione uma busca semântica à Biblioteca.
Quando o usuário perguntar algo, gere embedding da pergunta, chame match_knowledge_chunks e mostre uma resposta baseada somente nos trechos retornados.
Sempre exiba as fontes usadas e diga quando a biblioteca não tiver evidência suficiente.
```
