-- Fase 4 — RAG. See docs/DATA_MODEL.md ("Fase 4 — RAG (embeddings + busca
-- híbrida)") and docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md §18/§31 for
-- the field list and the "never pure vector search" requirement these
-- objects implement.
--
-- Scope decision (see docs/DECISIONS.md, 11/09/2026 "Fase 4 — embeddings
-- embutidos em document_chunks + busca híbrida via RPC"): embeddings live
-- directly on document_chunks (allowed explicitly by DATA_MODEL.md) instead
-- of a separate chunk_embeddings table, since this project only ever
-- compares chunks against one embedding_model/version at a time — no join
-- gains anything here. This is also the first migration that needs
-- `pgvector`, already enabled by the Lovable agent (v0.8.2, `extensions`
-- schema) before this file was applied.

-- Already applied live (see supabase/migrations/README.md) — kept here so
-- this file is the complete, re-runnable source of truth.
create extension if not exists vector with schema extensions;

alter table public.document_chunks
  add column embedding extensions.vector(1536),
  add column embedding_model text,
  add column embedding_version text;

comment on column public.document_chunks.embedding is 'text-embedding-3-small (1536 dims) by default — see supabase/functions/_shared/embedding-provider.ts. Never compare embeddings across different embedding_model/embedding_version values (docs/DATA_MODEL.md).';

-- HNSW builds incrementally (unlike ivfflat, which wants data present
-- up front to train well) — the right choice for a library that starts
-- empty and grows one document at a time.
create index document_chunks_embedding_idx
  on public.document_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

-- Hybrid search: full-text (search_vector, already built in Fase 3) fused
-- with vector similarity via Reciprocal Rank Fusion (RRF) — never "apenas
-- top-K vector search" (docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md
-- §31). RRF avoids having to normalize ts_rank and cosine distance onto a
-- shared scale, which don't naturally compare.
--
-- SECURITY: this function is SECURITY INVOKER (the default — not declared
-- SECURITY DEFINER), so it runs as the calling role and every table it
-- touches keeps enforcing its own RLS (owner_id = auth.uid()). The
-- `owner_id = (select auth.uid())` filters below are redundant with RLS by
-- construction, but kept explicit for defense in depth and readability.
create or replace function public.search_document_chunks(
  search_query text,
  query_embedding extensions.vector(1536),
  match_count integer default 20
)
returns table (
  chunk_id uuid,
  library_item_id uuid,
  library_item_title text,
  section_title text,
  content text,
  combined_score double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with lexical as (
    select
      dc.id,
      row_number() over (
        order by ts_rank(dc.search_vector, websearch_to_tsquery('portuguese', search_query)) desc
      ) as rank
    from public.document_chunks dc
    where dc.owner_id = (select auth.uid())
      and dc.search_vector @@ websearch_to_tsquery('portuguese', search_query)
    order by rank
    limit least(match_count * 4, 200)
  ),
  semantic as (
    select
      dc.id,
      row_number() over (order by dc.embedding <=> query_embedding) as rank
    from public.document_chunks dc
    where dc.owner_id = (select auth.uid())
      and dc.embedding is not null
    order by dc.embedding <=> query_embedding
    limit least(match_count * 4, 200)
  ),
  fused as (
    select
      coalesce(lexical.id, semantic.id) as id,
      coalesce(1.0 / (60 + lexical.rank), 0) + coalesce(1.0 / (60 + semantic.rank), 0) as combined_score
    from lexical
    full outer join semantic on lexical.id = semantic.id
  )
  select
    dc.id as chunk_id,
    dc.library_item_id,
    li.title as library_item_title,
    ds.title as section_title,
    dc.content,
    fused.combined_score
  from fused
  join public.document_chunks dc on dc.id = fused.id
  join public.library_items li on li.id = dc.library_item_id
  left join public.document_sections ds on ds.id = dc.section_id
  where dc.owner_id = (select auth.uid())
  order by fused.combined_score desc
  limit match_count;
$$;

comment on function public.search_document_chunks is 'Hybrid search (full-text + vector, RRF-fused) over the caller''s own document_chunks. Called from the search Edge Function, which computes query_embedding first (docs/DECISIONS.md).';

grant execute on function public.search_document_chunks(text, extensions.vector, integer) to authenticated;