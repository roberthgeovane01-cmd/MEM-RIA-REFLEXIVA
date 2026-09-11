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

- `20260911210000_create_hybrid_search.sql` (meu, Fase 4 — RAG) e
  `20260911200926_ee251dcc-*.sql` (UUID, gerado pelo Lovable) são o mesmo par — byte-idênticos
  (só uma newline final de diferença). `20260911195649_c82c90d5-*.sql` e
  `20260911195702_587b1481-*.sql` (UUID, também do Lovable, sem contraparte minha) são os dois
  passos que habilitaram a extensão `pgvector` ad hoc, antes deste arquivo existir (pedido
  separado, para confirmar disponibilidade antes de desenhar o resto) — meu arquivo repete o
  `create extension if not exists` de forma idempotente só para ficar completo e re-executável.
  Aplicada com sucesso; as Edge Functions `generate-embeddings` e `search` foram deployadas no
  mesmo momento, e `OPENAI_API_KEY` já estava cadastrado — confirmado pelo agente do Lovable
  (colunas de embedding, índice HNSW e função `search_document_chunks` verificados via SQL; ambas
  as funções responderam a uma checagem não destrutiva; advisor sem avisos novos).

Daqui para frente: continue escrevendo migrations aqui normalmente (é a fonte de verdade), mas
aplique-as pedindo ao agente do Lovable para executá-las — ver `CLAUDE.md` § "Como aplicar
migrations". Não presuma que um `project_id` específico do Supabase é estável, e não presuma que
`insert into storage.buckets` vai funcionar — pode ser necessário pedir ao Lovable para criar o
bucket por fora da migration.
