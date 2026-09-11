# Modelo de Dados — Memória Reflexiva

> Fonte funcional: `docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md` §13–37 (campo a campo) e
> §14 do prompt fundacional. Este documento é o modelo **planejado**; nem todas as tabelas abaixo
> existem no banco ainda — ver a coluna "Status" e `docs/PROJECT_STATE.md`/`docs/ROADMAP.md` para o
> que já foi migrado. Regra do projeto: **nunca criar estas tabelas mecanicamente antes de a fase
> correspondente do roadmap chegar** — o modelo é documentado primeiro, migrado quando a fase
> realmente começa.

## Convenções

- Toda tabela pessoal tem `owner_id uuid references auth.users(id)` (ou, no caso de `profiles`, `id`
  é a própria FK) e RLS ativo com policy predominante `owner_id = auth.uid()`.
- Toda tabela `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`,
  e `updated_at timestamptz default now()` mantido por trigger (`extensions.moddatetime`), salvo
  indicação contrária.
- Vetores de embedding só são comparáveis entre si quando gerados pelo **mesmo modelo** — nunca
  misturar `embedding_model`/`embedding_version` diferentes numa mesma busca.

## Status atual

| Tabela                                                    | Status                                                                                                         |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `profiles`                                                | ✅ Migrada (Fase 0 — fundação de autenticação)                                                                 |
| `library_items`, `library_files`                          | ✅ Migradas (Fase 2 — Biblioteca)                                                                              |
| `document_sections`, `document_chunks`, `processing_jobs` | ✅ Migradas (Fase 3 — Ingestão). Execução do pipeline roda no cliente por enquanto — ver `docs/DECISIONS.md`.  |
| `document_chunks.embedding` (+ busca híbrida via RPC)     | ✅ Migrada (Fase 4 — RAG). Embutido em `document_chunks`, não em `chunk_embeddings` — ver `docs/DECISIONS.md`. |
| Todas as demais abaixo                                    | 📋 Planejada — serão migradas fase a fase (Memória → Meu Cérebro → Reflexões), nunca todas de uma vez          |

---

## Fase 0 — Fundação (auth)

### `profiles`

Representa o usuário. `id` referencia `auth.users.id`.

```text
id                uuid, PK, references auth.users(id) on delete cascade
display_name      text, default ''
avatar_path       text, nullable            -- planejado; ainda não migrado
locale            text, nullable            -- planejado; ainda não migrado
timezone          text, nullable            -- planejado; ainda não migrado
created_at        timestamptz
updated_at        timestamptz
```

Criada automaticamente por um trigger `on_auth_user_created` (`security definer`, sem `EXECUTE`
público) ao inserir em `auth.users`. RLS: usuário só enxerga/edita a própria linha.

---

## Fase 2 — Biblioteca

### `library_items`

Representa intelectualmente cada item da Biblioteca.

```text
id, owner_id, title, item_type, authorship_type, description, category, language,
original_date, year, processing_status, memory_status, created_at, updated_at, deleted_at
```

- `item_type`: `book | reflection | letter | report | message | note | document | other`
- `authorship_type` (**distinção fundamental, ver "Anti-contaminação" em `docs/SECURITY.md`**):
  `self_authored | external | mixed | unknown`

### `library_files`

```text
id, owner_id, library_item_id, storage_bucket, storage_path, original_filename,
mime_type, file_size, checksum, version, created_at
```

Um item pode ter múltiplas versões de arquivo sem perder o original.

---

## Fase 3 — Ingestão / estrutura documental

> Migrada e com pipeline funcionando (estruturação + chunking), mas a **execução** hoje é
> client-side e síncrona, não uma fila/Edge Function real — ver `docs/DECISIONS.md` (11/09/2026,
> "Fase 3: pipeline síncrono no cliente") para o raciocínio e quando isso muda.

### `document_sections`

Preserva livro → parte → capítulo → seção → subtítulo → página.

```text
id, owner_id, library_item_id, parent_section_id, section_type, title,
sequence, start_page, end_page, text_content, metadata
```

### `document_chunks`

Unidades usadas pela busca. Chunking é **estruturalmente consciente**: primeiro respeita
capítulo → seção → parágrafo, depois aplica limite de tamanho. Nunca dividir documentos cegamente.

```text
id, owner_id, library_item_id, section_id, chunk_index, content, token_count,
page_start, page_end, search_vector, metadata, created_at
```

### `processing_jobs`

Acompanhamento de cada job assíncrono do pipeline (além da fila em si).

```text
id, owner_id, job_type, entity_type, entity_id, status, progress,
attempt_count, error_code, error_message, started_at, finished_at
```

Estados de processamento (usar sempre, nunca só "Carregando..."):
`uploaded → queued → extracting → structuring → chunking → embedding → extracting_memory
→ updating_profile → completed` (ou `failed`).

---

## Fase 4 — RAG (embeddings + busca híbrida)

> Implementada — ver `docs/DECISIONS.md` (11/09/2026, "Fase 4: OpenAI para embeddings, embutidos em
> document_chunks, busca híbrida via RPC SECURITY INVOKER") para o raciocínio completo.

### `document_chunks.embedding` (em vez de `chunk_embeddings` separada)

```text
document_chunks.embedding           vector(1536) — text-embedding-3-small (OpenAI)
document_chunks.embedding_model     text
document_chunks.embedding_version   text
```

Decisão tomada na implementação (opção já prevista aqui): embutir diretamente em `document_chunks`
em vez de uma tabela `chunk_embeddings` separada, já que este projeto nunca compara embeddings de
mais de um modelo ao mesmo tempo. `supabase/functions/generate-embeddings` preenche essas colunas
depois que a Fase 3 termina; `supabase/functions/_shared/embedding-provider.ts` é o
`EmbeddingProvider` (trocar de provedor = reimplementar só esse arquivo).

Busca híbrida = full-text search (`document_chunks.search_vector`, já existe desde a Fase 3) +
vector search (`document_chunks.embedding`, pgvector/HNSW) fundidos por Reciprocal Rank Fusion —
função SQL `search_document_chunks` (`SECURITY INVOKER`, então RLS de `document_chunks`/
`library_items`/`document_sections` continua valendo normalmente), chamada pela Edge Function
`search`. Nunca "apenas top-K vector search". Toda busca respeita RLS (pgvector roda sobre o mesmo
Postgres, com as mesmas policies) — nenhuma das duas Edge Functions usa `service_role`.

---

## Fase 5 — Memória inteligente

### `memory_items`

Não é apenas um chunk — é conhecimento extraído.

```text
id, owner_id, memory_type, title, canonical_text, summary, importance,
confidence, temporal_start, temporal_end, status, created_at, updated_at
```

`memory_type`: `idea | theme | concept | event | experience | person | place | metaphor | value |
writing_pattern | argument_pattern | story | quote_reference | belief | question`

### `memory_evidence`

Relaciona cada conclusão às fontes — toda memória derivada pode voltar à fonte.

```text
id, owner_id, memory_item_id, library_item_id, section_id, chunk_id,
evidence_type, relevance_score, created_at
```

### `memory_relations`

```text
id, owner_id, source_memory_id, target_memory_id, relation_type, confidence, created_at
```

`relation_type`: `supports | contradicts | evolves_from | related_to | caused_by | example_of | part_of`

---

## Fase 6 — Meu Cérebro (perfil autoral)

Estruturado, nunca um campo de texto livre gigante.

### `author_profile_versions`

```text
id, owner_id, version, summary, generated_at, approved_at, status
```

### `author_traits`

```text
id, owner_id, profile_version_id, trait_type, title, description, confidence, status, created_at
```

`trait_type`: `writing_style | reasoning_pattern | narrative_pattern | tone | recurring_theme |
metaphor_pattern | argument_pattern | structural_pattern`

### `author_trait_evidence`

```text
id, owner_id, author_trait_id, chunk_id, memory_item_id, weight, explanation
```

### `author_feedback`

```text
id, owner_id, target_type, target_id, feedback_type, user_comment, created_at
```

`feedback_type`: `agree | partially_agree | disagree | correct | hide`

**Regra crítica**: só fontes elegíveis (`authorship_type = self_authored` + reflexões finais
aprovadas) alimentam o perfil autoral. Conteúdo externo é referência de conhecimento, nunca
evidência de estilo ou crença do usuário.

---

## Fase 7 — Motor de Reflexões

Fluxo obrigatório em 8–9 etapas: reflexão externa → comentário pessoal → busca de memórias →
conflitos → plano → geração → revisão humana → aprovação → incorporação opcional. Nunca pular da
reflexão externa direto para o texto final.

### `reflections`

```text
id, owner_id, title, status, theme, created_at, updated_at, approved_at, incorporated_at
```

### `reflection_inputs`

```text
id, owner_id, reflection_id, input_type, content, source_metadata, created_at
```

`input_type`: `external_reflection | personal_comment | additional_instruction`

### `reflection_source_selections`

```text
id, owner_id, reflection_id, library_item_id, selection_mode, created_at
```

Permite: memória global, livros selecionados, documentos selecionados, ou sem memória.

### `reflection_retrieval_runs` / `reflection_retrieval_items`

Torna o RAG auditável — cada investigação de memória fica registrada.

```text
reflection_retrieval_runs: id, owner_id, reflection_id, query, strategy, created_at
reflection_retrieval_items: id, retrieval_run_id, chunk_id, memory_item_id,
  semantic_score, lexical_score, combined_score, rank, selected
```

### `reflection_conflicts`

Nunca concluir automaticamente que o pensamento atual está errado — apresentar como possível
divergência.

```text
id, owner_id, reflection_id, current_statement, memory_statement, evidence_chunk_id,
conflict_type, confidence, user_resolution, created_at
```

### `reflection_plans`

A IA planeja antes de gerar.

```text
id, owner_id, reflection_id, version, plan_json, user_status, created_at
```

### `reflection_versions`

```text
id, owner_id, reflection_id, version_number, content, created_by, model, prompt_version, created_at
```

`created_by`: `ai | user | mixed`

### `reflection_approvals`

```text
reflection_version_id, approved_by, approved_at, incorporate_into_memory
```

**Princípio de não autocontaminação** (crítico — ver `docs/SECURITY.md`): conteúdo escrito pela IA
não é memória autoral. Só uma versão revisada + aprovada + explicitamente incorporada pode entrar
na memória autoral.

---

## Transversal — Auditoria

### `audit_events`

```text
id, owner_id, event_type, entity_type, entity_id, metadata, created_at
```

Exemplos de `event_type`: `document_uploaded`, `document_processed`, `document_deleted`,
`memory_corrected`, `reflection_generated`, `reflection_approved`, `reflection_incorporated`.

---

## Storage (buckets)

```text
library-originals     -- arquivo original preservado, nunca sobrescrito
library-previews
reflection-exports
avatars
```

Todos privados por padrão. Documentos pessoais nunca têm URL pública permanente — acesso via
download autenticado ou URL assinada temporária. Nunca editar diretamente as tabelas internas do
schema `storage`; usar sempre a API de Storage.
