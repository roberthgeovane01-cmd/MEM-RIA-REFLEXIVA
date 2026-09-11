# Arquitetura — Memória Reflexiva

> Resumo técnico operacional. A especificação completa e autoritativa vive em
> [`docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md`](./specs/MR-ARQ-arquitetura-tecnica-mestra.md) — leia-a antes de
> tomar decisões arquiteturais não cobertas aqui. Este arquivo é o resumo do dia a dia.

## Missão

Transformar um acervo pessoal (livros, cartas, relatos, reflexões, documentos) em uma memória
inteligente e pesquisável, e usar essa memória para apoiar a criação de novas reflexões — sempre
com o usuário como autoridade final. Não é "um chatbot com PDFs": é
`Biblioteca → memória rastreável → perfil autoral com evidências → reflexão assistida → revisão humana`.

## As seis camadas

```text
1. EXPERIÊNCIA DO USUÁRIO   Lovable / TanStack Start / React
2. APLICAÇÃO                rotas + componentes + serviços + estado
3. BACKEND                  Supabase Auth + Database + Storage + Edge Functions
4. PROCESSAMENTO            filas + extração + chunking + embeddings + análises
5. MEMÓRIA E IA              RAG + perfil autoral + recuperação + geração
6. GOVERNANÇA                GitHub + migrations + testes + Claude Code + documentação
```

## Responsabilidade de cada ferramenta

| Ferramenta      | Papel                                                                                                                | Nunca deve                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Lovable**     | Experiência visual e frontend: telas, componentes, navegação, UX.                                                    | Ser a fonte soberana do backend; criar estrutura de banco concorrente com as migrations do GitHub.                           |
| **GitHub**      | Fonte de verdade do código: frontend, migrations, funções, testes, prompts, documentação, decisões.                  | —                                                                                                                            |
| **Supabase**    | Núcleo operacional: Postgres, Auth, Storage, RLS, Edge Functions, pgvector, full-text search.                        | Ser alterado manualmente no Dashboard como atalho depois que o fluxo de migrations estiver estabelecido.                     |
| **Claude Code** | Engenheiro principal: planeja, implementa, escreve migrations, mantém documentação, preserva a coerência do sistema. | Criar estrutura de banco concorrente com o que o Lovable já gerencia; pular a revisão humana antes de operações destrutivas. |

Regra de ouro: **depois da fundação inicial, toda alteração estrutural do Supabase é uma migration
versionada no GitHub** (criar tabela, alterar coluna, RLS, policy, trigger, função, extensão).

## Stack real (verificada no repositório, não assumida)

- **Frontend**: TanStack Start (`@tanstack/react-start` + `@tanstack/react-router`), React 19, Vite 8, Tailwind CSS 4, shadcn/ui (Radix), TanStack Query. Roteamento por arquivo em `src/routes/` — ver `src/routes/README.md`.
- **Gerenciador de pacotes**: bun (`bun.lock`, `bunfig.toml`). `npm`/`node` também disponíveis.
- **Scaffold**: criado e sincronizado pelo Lovable (`.lovable/project.json`). Preservado como está — não migramos framework.
- **Backend**: Supabase via **Lovable Cloud** (integração gerenciada, não um projeto Supabase com
  referência externa estável — ver `docs/DECISIONS.md` de 11/09/2026 e `docs/PROJECT_STATE.md`
  para o fluxo de migrations adaptado a essa particularidade).
- **Cliente Supabase**: `src/integrations/supabase/client.ts` (tipado por `src/integrations/supabase/types.ts`, gerado a partir do schema remoto — não editar à mão).

## Estrutura do repositório (adaptada ao scaffold real)

O documento mestre descreve uma estrutura conceitual (`app/`, `prompts/`, `tests/`...). Não
reorganizamos o scaffold do TanStack Start/Lovable para replicá-la; adaptamos os mesmos princípios
à árvore real:

```text
/
├── src/
│   ├── routes/                  # roteamento por arquivo (TanStack Start)
│   ├── components/ui/           # shadcn/ui
│   ├── hooks/
│   ├── lib/
│   ├── integrations/supabase/   # client.ts + types.ts (gerado)
│   ├── router.tsx, server.ts, start.ts
│   └── vite-env.d.ts
│
├── supabase/
│   ├── config.toml
│   └── migrations/              # única fonte de verdade do schema
│
├── docs/
│   ├── specs/                   # especificações funcionais MR-xx (ver docs/specs/README.md)
│   ├── ARCHITECTURE.md          # este arquivo
│   ├── DATA_MODEL.md
│   ├── SECURITY.md
│   ├── DECISIONS.md
│   ├── ROADMAP.md
│   └── PROJECT_STATE.md
│
├── CLAUDE.md
├── .env.example
└── package.json
```

`prompts/` (versionamento de prompts de IA) e `supabase/functions/` (Edge Functions) serão criados
quando a Fase de IA/processamento realmente começar — criá-los vazios agora seria estrutura sem uso.

## Módulos funcionais

Auth · Home · Library · Ingestion · Document Detail · Memory · Author Brain (Meu Cérebro) ·
Reflection Engine (Criar Reflexão) · Reflection Archive (Minhas Reflexões) · Settings · AI
Orchestration · Audit. Detalhes de cada um em `docs/specs/`.

## Multiusuário e RLS

O MVP tem um único usuário principal, mas o banco já é modelado multiusuário: toda tabela pessoal
tem `owner_id` (ou, no caso de `profiles`, `id` referenciando `auth.users.id`) e RLS ativo com a
regra predominante `owner_id = auth.uid()`. Nunca confiamos apenas na interface para restringir
acesso — a restrição vive no banco. Ver `docs/SECURITY.md`.

## Ambientes

- **Desenvolvimento local**: Claude Code trabalha diretamente no repositório; Supabase CLI (quando
  disponível no ambiente de execução) pode reproduzir banco/migrations/funções localmente.
- **Produção**: projeto Supabase dedicado + app publicado pelo Lovable. Push no GitHub **não**
  publica automaticamente no Lovable — publicação é um passo separado (snapshot).
- **Staging/preview**: adicionar quando necessário (Supabase branching por PR).

## Pipeline de documentos (visão geral)

```text
UPLOAD → VALIDATE → STORE ORIGINAL → QUEUE → EXTRACT → NORMALIZE → STRUCTURE
       → CHUNK → EMBED → EXTRACT MEMORIES → UPDATE AUTHOR PROFILE → COMPLETED
```

Assíncrono desde o início: o upload retorna sucesso sem esperar a análise completa. Chunking é
estruturalmente consciente (capítulo → seção → parágrafo → chunk), nunca uma divisão cega por
tamanho. Todo chunk mantém proveniência (`library_item_id`, `section_id`, posição, página quando
disponível). MVP de formatos: TXT, Markdown, DOCX textual, PDF com camada de texto — OCR fica para
depois.

## Busca e memória

Busca híbrida (full-text + vetorial + metadados + filtros + rank fusion), nunca vector-search puro.
Toda memória derivada carrega evidências rastreáveis até o chunk/documento de origem. RLS também
protege os resultados vetoriais (pgvector roda sobre o mesmo Postgres com as mesmas policies).

## Não contaminação (regra crítica)

Texto gerado pela IA **não é memória autoral** até ser revisado, aprovado e explicitamente
incorporado pelo usuário. Essa separação existe no modelo de dados (rascunho/versão gerada vs.
memória autoral aprovada), não apenas na interface.

## Camada de IA

Abstrações de provider (`TextGenerationProvider`/`AIProvider`, `EmbeddingProvider`) — nunca chamar
um fornecedor diretamente espalhado pelo código. Segredos de IA só em variáveis de ambiente do
backend (nunca `VITE_*`). Prompts relevantes versionados em `/prompts` quando essa fase começar,
com `prompt_version` registrado em cada geração. Nunca armazenar chain-of-thought privado do
modelo — apenas decisão, resumo, plano, evidências e resultado.

## Ordem de construção

Ver `docs/ROADMAP.md` para as fases completas e `docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md`
§70–72 para o detalhamento original (fases 0–9 + dois vertical slices).
