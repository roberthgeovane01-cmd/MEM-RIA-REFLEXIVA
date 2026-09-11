-- Foundation for authentication: one profile row per auth.users row.
-- This is intentionally the only table in Phase 0. The Library/Memory/
-- Reflection schema is designed and migrated separately once documented
-- in docs/DATA_MODEL.md (see docs/DECISIONS.md).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

comment on table public.profiles is 'One row per account, 1:1 with auth.users. Created by the on_auth_user_created trigger.';

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No insert/delete policy for the authenticated role on purpose: rows are
-- created only by the security-definer trigger below, and are never deleted
-- directly (they cascade from auth.users).

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function extensions.moddatetime(updated_at);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();