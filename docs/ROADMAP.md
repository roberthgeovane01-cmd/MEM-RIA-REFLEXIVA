# Roadmap — Memória Reflexiva

> Fases conforme `docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md` §70–72. Não construir 50% de
> cada módulo — provar uma cadeia vertical completa antes de multiplicar recursos.

## Fases

- [x] **Fase 0 — Fundação**: projeto Lovable, GitHub, Supabase, Claude Code, documentação, CI,
      fundação de autenticação (`profiles` + RLS + trigger de signup).
- [x] **Fase 1 — Auth + App Shell**: login (e-mail/senha + criar conta + recuperar senha),
      sessão, proteção de rotas, navegação (sidebar/bottom bar), Home vazia (MR-02).
- [ ] **Fase 2 — Biblioteca**: tabela `library_items`/`library_files`, Storage, upload, organização,
      busca simples, detalhe do documento.
- [ ] **Fase 3 — Ingestão**: extração, `document_sections`, `document_chunks`, `processing_jobs`,
      estados explícitos de status.
- [ ] **Fase 4 — RAG**: `chunk_embeddings`, full-text search, busca híbrida, evidências.
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

Só depois disso ampliar formatos (DOCX, PDF) e recursos.

## Segundo vertical slice

```text
REFLEXÃO EXTERNA → COMENTÁRIO → BUSCA NA MEMÓRIA → GERAÇÃO → EDIÇÃO → APROVAÇÃO
```

## Documentos de produto ainda pendentes

MR-03 (Biblioteca) e MR-07 (Criar Reflexão) ainda não foram recebidos do dono do produto — pedir
antes de especificar esses módulos em detalhe (ver `docs/specs/README.md`).

## Próximo passo concreto

Iniciar a **Fase 2 — Biblioteca**: modelar e migrar `library_items`/`library_files`, criar os
buckets de Storage, e construir upload + listagem + busca simples + Detalhe do Documento (MR-05).
Antes de especificar em detalhe, pedir ao dono do produto o documento MR-03 (Biblioteca), ainda
não recebido.
