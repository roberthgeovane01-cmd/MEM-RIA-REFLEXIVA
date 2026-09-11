-- handle_new_user must only ever run via the on_auth_user_created trigger,
-- never as a directly callable RPC (Supabase security advisor: functions in
-- the public schema are auto-exposed via PostgREST unless revoked).
revoke execute on function public.handle_new_user() from public, anon, authenticated;