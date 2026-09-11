create table public.library_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  item_type text not null default 'document',
  authorship_type text not null default 'unknown',
  description text,
  category text,
  language text,
  original_date date,
  year integer,
  tags text[] not null default '{}',
  processing_status text not null default 'uploaded',
  memory_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint library_items_item_type_check check (
    item_type in ('book', 'reflection', 'letter', 'report', 'message', 'note', 'document', 'other')
  ),
  constraint library_items_authorship_type_check check (
    authorship_type in ('self_authored', 'external', 'mixed', 'unknown')
  ),
  constraint library_items_processing_status_check check (
    processing_status in ('uploaded', 'processed', 'failed')
  )
);

comment on table public.library_items is 'A source in the user''s Library — the intellectual record of an item (see docs/specs/MR-03-biblioteca.md). Original file lives in library_files/Storage, never here.';
comment on column public.library_items.authorship_type is 'self_authored | external | mixed | unknown. Critical distinction: only self_authored (and later, approved reflections) may ever feed the author profile — see docs/SECURITY.md anti-contamination rule.';

grant select, insert, update, delete on public.library_items to authenticated;
grant all on public.library_items to service_role;

alter table public.library_items enable row level security;

create policy "library_items_select_own"
  on public.library_items for select
  using ((select auth.uid()) = owner_id);

create policy "library_items_insert_own"
  on public.library_items for insert
  with check ((select auth.uid()) = owner_id);

create policy "library_items_update_own"
  on public.library_items for update
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "library_items_delete_own"
  on public.library_items for delete
  using ((select auth.uid()) = owner_id);

create trigger set_library_items_updated_at
  before update on public.library_items
  for each row execute function extensions.moddatetime(updated_at);

create index library_items_owner_id_idx on public.library_items (owner_id);
create index library_items_tags_idx on public.library_items using gin (tags);

create table public.library_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  library_item_id uuid not null references public.library_items (id) on delete cascade,
  storage_bucket text not null default 'library-originals',
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  file_size bigint not null,
  checksum text,
  version integer not null default 1,
  extracted_text text,
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

comment on table public.library_files is 'A stored file version for a library_item. Preserved as-is — never overwritten by processing or metadata edits.';

grant select, insert, update, delete on public.library_files to authenticated;
grant all on public.library_files to service_role;

alter table public.library_files enable row level security;

create policy "library_files_select_own"
  on public.library_files for select
  using ((select auth.uid()) = owner_id);

create policy "library_files_insert_own"
  on public.library_files for insert
  with check ((select auth.uid()) = owner_id);

create policy "library_files_delete_own"
  on public.library_files for delete
  using ((select auth.uid()) = owner_id);

create index library_files_owner_id_idx on public.library_files (owner_id);
create index library_files_library_item_id_idx on public.library_files (library_item_id);

create policy "library_originals_select_own"
  on storage.objects for select
  using (
    bucket_id = 'library-originals'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "library_originals_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'library-originals'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "library_originals_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'library-originals'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );