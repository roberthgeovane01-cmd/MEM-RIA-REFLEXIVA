# Roadmap — Memória Reflexiva

> Fases conforme `docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md` §70–72. Não construir 50% de
> cada módulo — provar uma cadeia vertical completa antes de multiplicar recursos.

## Fases

- [x] **Fase 0 — Fundação**: projeto Lovable, GitHub, Supabase, Claude Code, documentação, CI,
      fundação de autenticação (`profiles` + RLS + trigger de signup).
- [x] **Fase 1 — Auth + App Shell**: login (e-mail/senha + criar conta + recuperar senha),
      sessão, proteção de rotas, navegação (sidebar/bottom bar), Home vazia (MR-02).
- [x] **Fase 2 — Biblioteca (MVP)**: `library_items`/`library_files`, Storage (`library-originals`),
      upload (.txt/.md/.pdf/.docx, até 20MB) ou texto colado, listagem com busca, Detalhe do
      Documento (MR-05, versão MVP). **Confirmada pelo dono do produto** no preview do Lovable em
      11/09/2026 — ver `docs/PROJECT_STATE.md`. Fora do MVP por escolha: PDF escaneado/OCR, filtros
      avançados combinados, coleções.
- [x] **Fase 3 — Ingestão**: `document_sections`, `document_chunks`, `processing_jobs`, estados
      explícitos de status (`uploaded → queued → extracting → structuring → chunking → completed`
      hoje; `embedding/extracting_memory/updating_profile` chegam com as fases que os usam).
      Estruturação e chunking rodam no cliente, não numa fila/Edge Function — ver
      `docs/DECISIONS.md`. **Confirmada pelo dono do produto** com dado real no preview do Lovable
      em 11/09/2026 — ver `docs/PROJECT_STATE.md`.
- [x] **Fase 4 — RAG**: embeddings (OpenAI, embutidos em `document_chunks`), full-text search
      (já existia desde a Fase 3), busca híbrida (RRF via RPC `search_document_chunks`),
      `EmbeddingProvider` abstraído. Primeiras Edge Functions do projeto
      (`generate-embeddings`, `search`) — ver `docs/DECISIONS.md`. Migration aplicada e Edge
      Functions deployadas, `OPENAI_API_KEY` cadastrado. Aguardando confirmação do dono do produto
      no preview do Lovable.
- [ ] **Fase 5 — Memória**: `memory_items`, `memory_evidence`, `memory_relations`.
- [ ] **Fase 6 — Meu Cérebro**: `author_traits`, `author_profile_versions`, evidências, feedback.
- [ ] **Fase 7 — Reflexões**: fluxo de 8–9 etapas, retrieval auditável, conflitos, plano, geração,
      revisão.
- [ ] **Fase 8 — Aprendizado**: comparação IA × usuário, feedback, atualização de perfil.
- [ ] **Fase 9 — Hardening**: testes, observabilidade, segurança, desempenho, recuperação de falhas.

## Primeiro vertical slice (prioridade imediata após a Fase 0)

```text
LOGIN → UPLOAD TXT → ARMAZENAR → PROCESSAR → CRIAR CHUNKS → BUSCAR → MOSTRAR RESULTADO COM FONTE
```

Cadeia completa implementada: ampliação de formatos (Fase 2), estrutura + chunks (Fase 3), busca
híbrida com resultado e fonte (Fase 4). Falta a confirmação do dono do produto no preview.

## Segundo vertical slice

```text
REFLEXÃO EXTERNA → COMENTÁRIO → BUSCA NA MEMÓRIA → GERAÇÃO → EDIÇÃO → APROVAÇÃO
```

## Documentos de produto ainda pendentes

MR-07 (Criar Reflexão) ainda não foi recebido do dono do produto — pedir antes de especificar esse
módulo em detalhe (ver `docs/specs/README.md`).

## Próximo passo concreto

1. Confirmar a Fase 4 no preview: criar um item, ver o embedding rodar, testar "Buscar no conteúdo".
2. Depois: Fase 5 — Memória, ou reforços da Fase 4 (reprocessar itens antigos sem embeddings,
   deep-link para o trecho exato dentro de `/library/$id`).
