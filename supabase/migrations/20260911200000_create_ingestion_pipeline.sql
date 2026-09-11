-- Fase 3 — Ingestão. See docs/DATA_MODEL.md ("Fase 3 — Ingestão / estrutura
-- documental") and docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md §41-43 for
-- the pipeline/status spec these tables implement.
--
-- Scope decision (see docs/DECISIONS.md, 11/09/2026 "Fase 3 — pipeline
-- síncrono no cliente"): structuring + chunking are deterministic, need no
-- AI/secrets, and run client-side right after upload (same pattern already
-- used for text extraction in Fase 2) instead of a real Supabase
-- Queues/pgmq + Edge Function worker. The processing_jobs table and the
-- full documented status enum exist now so the UI and data model don't
-- change when embedding/memory-extraction/profile-update steps (which DO
-- need a backend, since they call an AI provider with secrets) move
-- execution server-side in later phases.

-- library_items.processing_status only ever reached 'uploaded' | 'processed'
-- | 'failed' before this migration (Fase 2 comment on the original
-- constraint). Rename 'processed' -> 'completed' to match the full pipeline
-- vocabulary below, then widen the constraint.
update public.library_items set processing_status = 'completed' where processing_status = 'processed';

alter table public.library_items drop constraint library_items_processing_status_check;

alter table public.library_items add constraint library_items_processing_status_check check (
  processing_status in (
    'uploaded', 'queued', 'extracting', 'structuring', 'chunking',
    'embedding', 'extracting_memory', 'updating_profile', 'completed', 'failed'
  )
);

-- Preserves book -> part -> chapter -> section -> subtitle -> page structure
-- detected in a document. One item with no detectable heading structure
-- still gets exactly one section (section_type = 'section') holding the
-- whole text, so every processed item has >=1 section once ingestion
-- reaches 'structuring'.
create table public.document_sections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  library_item_id uuid not null references public.library_items (id) on delete cascade,
  parent_section_id uuid references public.document_sections (id) on delete cascade,
  section_type text not null,
  title text,
  sequence integer not null default 0,
  start_page integer,
  end_page integer,
  text_content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint document_sections_section_type_check check (
    section_type in ('book', 'part', 'chapter', 'section', 'subtitle', 'page')
  )
);

comment on table public.document_sections is 'Structural breakdown of a library_item (docs/DATA_MODEL.md Fase 3). Built client-side from the already-extracted text — no AI involved.';

grant select, insert, update, delete on public.document_sections to authenticated;
grant all on public.document_sections to service_role;

alter table public.document_sections enable row level security;

create policy "document_sections_select_own"
  on public.document_sections for select
  using ((select auth.uid()) = owner_id);

create policy "document_sections_insert_own"
  on public.document_sections for insert
  with check ((select auth.uid()) = owner_id);

create policy "document_sections_update_own"
  on public.document_sections for update
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "document_sections_delete_own"
  on public.document_sections for delete
  using ((select auth.uid()) = owner_id);

create index document_sections_owner_id_idx on public.document_sections (owner_id);
create index document_sections_library_item_id_idx on public.document_sections (library_item_id);
create index document_sections_parent_section_id_idx on public.document_sections (parent_section_id);

-- Search unit. Chunking is structurally aware (chapter -> section ->
-- paragraph, then a size limit as last resort) — never a blind character
-- split. search_vector exists now (Fase 3, per docs/DATA_MODEL.md) so
-- Fase 4 can build full-text search directly on it without another
-- migration; no search query uses it yet.
create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  library_item_id uuid not null references public.library_items (id) on delete cascade,
  section_id uuid references public.document_sections (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_count integer,
  page_start integer,
  page_end integer,
  search_vector tsvector generated always as (to_tsvector('portuguese', coalesce(content, ''))) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (library_item_id, chunk_index)
);

comment on table public.document_chunks is 'Chunks used by search (Fase 4+). token_count is a rough length/4 estimate until Fase 4 picks a real embedding model/tokenizer — see docs/DECISIONS.md.';

grant select, insert, update, delete on public.document_chunks to authenticated;
grant all on public.document_chunks to service_role;

alter table public.document_chunks enable row level security;

create policy "document_chunks_select_own"
  on public.document_chunks for select
  using ((select auth.uid()) = owner_id);

create policy "document_chunks_insert_own"
  on public.document_chunks for insert
  with check ((select auth.uid()) = owner_id);

create policy "document_chunks_update_own"
  on public.document_chunks for update
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "document_chunks_delete_own"
  on public.document_chunks for delete
  using ((select auth.uid()) = owner_id);

create index document_chunks_owner_id_idx on public.document_chunks (owner_id);
create index document_chunks_library_item_id_idx on public.document_chunks (library_item_id);
create index document_chunks_section_id_idx on public.document_chunks (section_id);
create index document_chunks_search_vector_idx on public.document_chunks using gin (search_vector);

-- Tracks each async pipeline run (docs/DATA_MODEL.md Fase 3). entity_id is a
-- loose reference (no FK) on purpose: job_type/entity_type already cover
-- more than library_item ingestion (embedding_generation,
-- memory_extraction, author_profile_update — Fase 4+), so this table will
-- outlive any single entity table. Deleting a library_item does NOT cascade
-- here; the app deletes its jobs explicitly (see use-library.ts).
create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  job_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  status text not null default 'uploaded',
  progress integer not null default 0,
  attempt_count integer not null default 0,
  error_code text,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint processing_jobs_job_type_check check (
    job_type in ('document_ingestion', 'embedding_generation', 'memory_extraction', 'author_profile_update')
  ),
  constraint processing_jobs_status_check check (
    status in (
      'uploaded', 'queued', 'extracting', 'structuring', 'chunking',
      'embedding', 'extracting_memory', 'updating_profile', 'completed', 'failed'
    )
  ),
  constraint processing_jobs_progress_check check (progress between 0 and 100)
);

comment on table public.processing_jobs is 'One row per pipeline run. status here mirrors library_items.processing_status while entity_type = library_item (see docs/DATA_MODEL.md, docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md §43).';

grant select, insert, update, delete on public.processing_jobs to authenticated;
grant all on public.processing_jobs to service_role;

alter table public.processing_jobs enable row level security;

create policy "processing_jobs_select_own"
  on public.processing_jobs for select
  using ((select auth.uid()) = owner_id);

create policy "processing_jobs_insert_own"
  on public.processing_jobs for insert
  with check ((select auth.uid()) = owner_id);

create policy "processing_jobs_update_own"
  on public.processing_jobs for update
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "processing_jobs_delete_own"
  on public.processing_jobs for delete
  using ((select auth.uid()) = owner_id);

create trigger set_processing_jobs_updated_at
  before update on public.processing_jobs
  for each row execute function extensions.moddatetime(updated_at);

create index processing_jobs_owner_id_idx on public.processing_jobs (owner_id);
create index processing_jobs_entity_idx on public.processing_jobs (entity_type, entity_id);
