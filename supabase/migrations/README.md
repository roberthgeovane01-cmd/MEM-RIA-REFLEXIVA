# Nota sobre esta pasta

Esta pasta tem duas "gerações" de migrations, por uma razão específica — ver `docs/DECISIONS.md`
(11/09/2026, "Lovable Cloud não tem referência de projeto Supabase estável"):

- `20260911171930_create_profiles_foundation.sql` e
  `20260911172057_restrict_handle_new_user_execute.sql` (nomes descritivos, meus) foram aplicadas a
  um projeto Supabase que o Lovable Cloud **não usa mais** como backend conectado. Mantidas como
  registro histórico, não como schema vigente.
- `20260911181444_*.sql`, `20260911181504_*.sql` e `20260911181518_*.sql` (nomes UUID, gerados pelo
  Lovable) foram aplicadas pelo próprio agente do Lovable ao backend **realmente conectado hoje** —
  são as que refletem o schema em produção. Contêm o mesmo SQL das duas primeiras, mais `GRANT`s
  extras que o Postgres gerenciado do Lovable exige.

Daqui para frente: continue escrevendo migrations aqui normalmente (é a fonte de verdade), mas
aplique-as pedindo ao agente do Lovable para executá-las — ver `CLAUDE.md` § "Como aplicar
migrations". Não presuma que um `project_id` específico do Supabase é estável.
