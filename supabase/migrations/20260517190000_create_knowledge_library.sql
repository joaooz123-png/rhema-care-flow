-- Knowledge Library foundation for UHS / Rhema Care Flow
-- Creates a public/private article library and prepares the project for future RAG with pgvector.

create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'general',
  summary text,
  content text not null,
  tags text[] not null default '{}',
  source_url text,
  visibility text not null default 'public' check (visibility in ('public', 'authenticated', 'admin')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.knowledge_articles(id) on delete cascade,
  title text not null,
  source_type text not null default 'article' check (source_type in ('article', 'pdf', 'markdown', 'url', 'note')),
  source_url text,
  storage_path text,
  metadata jsonb not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.knowledge_documents(id) on delete cascade,
  article_id uuid references public.knowledge_articles(id) on delete cascade,
  chunk_index integer not null default 0,
  chunk_text text not null,
  token_count integer,
  embedding vector(1536),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_knowledge_articles_status_visibility on public.knowledge_articles(status, visibility);
create index if not exists idx_knowledge_articles_category on public.knowledge_articles(category);
create index if not exists idx_knowledge_articles_tags on public.knowledge_articles using gin(tags);
create index if not exists idx_knowledge_articles_search on public.knowledge_articles using gin(to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(content,'')));
create index if not exists idx_knowledge_chunks_article_id on public.knowledge_chunks(article_id);
create index if not exists idx_knowledge_chunks_document_id on public.knowledge_chunks(document_id);
create index if not exists idx_knowledge_chunks_embedding on public.knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table public.knowledge_articles enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_articles'
      and policyname = 'Read published public articles'
  ) then
    create policy "Read published public articles"
      on public.knowledge_articles
      for select
      using (status = 'published' and visibility = 'public');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_articles'
      and policyname = 'Read authenticated published articles'
  ) then
    create policy "Read authenticated published articles"
      on public.knowledge_articles
      for select
      using (status = 'published' and visibility in ('public', 'authenticated') and auth.uid() is not null);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_articles'
      and policyname = 'Users manage own knowledge articles'
  ) then
    create policy "Users manage own knowledge articles"
      on public.knowledge_articles
      for all
      using (auth.uid() = created_by)
      with check (auth.uid() = created_by);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_chunks'
      and policyname = 'Read chunks for visible articles'
  ) then
    create policy "Read chunks for visible articles"
      on public.knowledge_chunks
      for select
      using (
        exists (
          select 1 from public.knowledge_articles a
          where a.id = knowledge_chunks.article_id
          and a.status = 'published'
          and (a.visibility = 'public' or auth.uid() is not null)
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_documents'
      and policyname = 'Users manage own documents'
  ) then
    create policy "Users manage own documents"
      on public.knowledge_documents
      for all
      using (auth.uid() = created_by)
      with check (auth.uid() = created_by);
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_knowledge_articles_updated_at on public.knowledge_articles;
create trigger trg_knowledge_articles_updated_at
before update on public.knowledge_articles
for each row execute function public.set_updated_at();

create or replace function public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float default 0.78,
  match_count int default 8
)
returns table (
  id uuid,
  article_id uuid,
  document_id uuid,
  chunk_text text,
  similarity float,
  metadata jsonb
)
language sql stable
as $$
  select
    kc.id,
    kc.article_id,
    kc.document_id,
    kc.chunk_text,
    1 - (kc.embedding <=> query_embedding) as similarity,
    kc.metadata
  from public.knowledge_chunks kc
  join public.knowledge_articles ka on ka.id = kc.article_id
  where kc.embedding is not null
    and ka.status = 'published'
    and (ka.visibility = 'public' or auth.uid() is not null)
    and 1 - (kc.embedding <=> query_embedding) > match_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;

insert into public.knowledge_articles (title, slug, category, summary, content, tags, visibility, status)
values
(
  'UHS Health OS — Fundamentos da Biblioteca',
  'uhs-health-os-fundamentos',
  'UHS Health OS',
  'Camada inicial de conhecimento para organizar protocolos, glossário, documentos técnicos e futuras respostas com IA baseada em fontes.',
  '# UHS Health OS — Fundamentos\n\nEsta biblioteca organiza conhecimento clínico, operacional e estratégico em artigos versionáveis.\n\n## Estrutura sugerida\n\n- Protocolos clínicos\n- Glossário técnico\n- Documentos institucionais\n- Evidências e estudos\n- Materiais educativos para pacientes\n\n## Próxima etapa\n\nConectar artigos e documentos a chunks vetoriais para permitir busca semântica e respostas com fontes.',
  array['uhs','protocolo-vida','biblioteca','rag'],
  'public',
  'published'
)
on conflict (slug) do nothing;
