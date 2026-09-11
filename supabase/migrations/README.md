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

- `20260911190000_create_library.sql` (meu, Fase 2 — Biblioteca) e
  `20260911183240_e0ebcba7-*.sql` (UUID, gerado pelo Lovable) são o mesmo par: o meu tem comentários
  completos e é a versão canônica para leitura; o do Lovable é o que ele realmente executou. Uma
  diferença real desta vez: `insert into storage.buckets` foi rejeitado pela migration gerenciada
  do Lovable — o bucket `library-originals` foi criado por uma ferramenta própria dele
  (`supabase--storage_create_bucket`), não por SQL. O meu arquivo documenta isso em comentário e
  mantém o `insert` comentado, para quem rodar via Supabase CLI num projeto comum.

- `20260911200000_create_ingestion_pipeline.sql` (meu, Fase 3 — Ingestão): `document_sections`,
  `document_chunks`, `processing_jobs` + alargamento do enum de `library_items.processing_status`.
  As duas primeiras tentativas de aplicação falharam por erro de ordenação entre o `UPDATE` que
  renomeia `processed` → `completed` e o `ALTER TABLE` que alarga a constraint (`CHECK` é validado
  imediatamente, não no commit) — corrigidas neste mesmo arquivo, sem versões antigas mantidas por
  não terem sido aplicadas de verdade. Aplicada com sucesso na terceira tentativa. **Desta vez o
  Lovable não commitou um arquivo UUID espelho** — só regenerou `types.ts` diretamente; este arquivo
  é a única versão e é byte-idêntica ao que foi lido e executado (confirmado na resposta do agente).

- `20260911210000_create_hybrid_search.sql` (meu, Fase 4 — RAG): extensão `pgvector`, colunas de
  embedding em `document_chunks`, índice HNSW, função `search_document_chunks`. A extensão
  `pgvector` em si já foi habilitada ad hoc pelo Lovable antes deste arquivo existir (pedido
  separado, para confirmar disponibilidade antes de desenhar o resto) — o `create extension if not
exists` aqui é idempotente e só documenta isso como fonte de verdade. Pendente de aplicação do
  restante (colunas/índice/função) e do deploy das Edge Functions
  (`supabase/functions/generate-embeddings`, `supabase/functions/search`) no momento em que este
  arquivo foi commitado — depende do dono do produto cadastrar `OPENAI_API_KEY` primeiro.

Daqui para frente: continue escrevendo migrations aqui normalmente (é a fonte de verdade), mas
aplique-as pedindo ao agente do Lovable para executá-las — ver `CLAUDE.md` § "Como aplicar
migrations". Não presuma que um `project_id` específico do Supabase é estável, e não presuma que
`insert into storage.buckets` vai funcionar — pode ser necessário pedir ao Lovable para criar o
bucket por fora da migration.
