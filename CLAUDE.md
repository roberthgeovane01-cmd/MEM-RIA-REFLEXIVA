# CLAUDE.md — Memória Reflexiva

Memória operacional deste projeto para o Claude Code. Curto e prático — para o detalhe completo,
siga os links.

## Missão

App pessoal de IA que transforma um acervo (livros, cartas, reflexões, documentos) em memória
inteligente e pesquisável, usada para apoiar novas reflexões. `Biblioteca → memória rastreável →
perfil autoral com evidências → reflexão assistida → revisão humana`. **Sempre consulte
`docs/specs/` antes de projetar ou construir um módulo** — é a especificação funcional canônica
fornecida pelo dono do produto. Comece por `docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md`.

## Stack (verificada, não assumida)

TanStack Start + React 19 + Vite 8 + Tailwind 4 + shadcn/ui, scaffold do Lovable, bun como
gerenciador de pacotes. Backend: Supabase (projeto `rplriacrdebmepnmjpqt`, anexado via integração
nativa do Lovable). Roteamento por arquivo em `src/routes/` (ver `src/routes/README.md` — não criar
`src/pages/` nem convenções de Next.js/Remix).

## Comandos

```bash
bun install        # instalar dependências (lockfile: bun.lock)
bun run dev         # servidor de desenvolvimento
bun run build        # build de produção
bun run lint          # eslint
bun run format         # prettier --write
```

Supabase: sem CLI local neste ambiente — mudanças de schema são aplicadas via MCP do Supabase
(`apply_migration`) e espelhadas como arquivo em `supabase/migrations/`. Em ambiente com CLI:
`supabase link --project-ref rplriacrdebmepnmjpqt` e `supabase db push`.

## Regras de banco (não negociáveis)

- Depois da fundação, **toda** alteração estrutural do Supabase é uma migration em
  `supabase/migrations/`, aplicada e commitada — nunca só no Dashboard.
- Toda tabela pessoal tem `owner_id` (ou `id` referenciando `auth.users.id`) e **RLS ativo** desde a
  migration que a cria. Rodar o advisor de segurança do Supabase depois de qualquer DDL.
- Nunca misturar embeddings de modelos/versões diferentes na mesma busca.
- Ver `docs/DATA_MODEL.md` para o modelo completo planejado e `docs/SECURITY.md` para as regras de
  segurança.

## Regra de não contaminação (crítica)

Texto gerado pela IA nunca é memória autoral automaticamente. Só entra após revisão humana +
aprovação explícita + ação explícita de incorporar. Conteúdo `authorship_type = external` nunca
alimenta o perfil autoral como evidência de estilo.

## Responsabilidades por ferramenta

Lovable → UX/UI. GitHub → fonte do código e das migrations. Supabase → backend e dados. Claude Code
→ engenharia e implementação. Nunca criar estrutura de banco concorrente entre Lovable e Claude
Code — ver `docs/ARCHITECTURE.md`.

## Segurança operacional

- Nunca commitar `.env`/`.env.local` (só `.env.example`, com nomes de variáveis).
- Segredos de IA/backend só como variáveis de ambiente de servidor — nunca `VITE_*`.
- Operações destrutivas (drop table, reset de banco, limpar Storage, force push, apagar branch
  compartilhada) exigem confirmação explícita do dono do produto antes de executar.
- Nunca `git push --force` ou `--no-verify` sem autorização explícita.

## Definição de pronto

Uma funcionalidade só está concluída quando: comportamento principal funciona + persistência
funciona + RLS protege + loading existe + empty state existe + erro é tratado + tipos corretos +
testes relevantes passam + build passa + documentação (`docs/PROJECT_STATE.md` e o que mais se
aplicar) está atualizada. "Renderiza na tela" não é "concluído".

## Documentação do projeto

- `docs/specs/` — especificação funcional canônica (MR-xx), fornecida pelo dono do produto.
- `docs/ARCHITECTURE.md` — arquitetura técnica resumida.
- `docs/DATA_MODEL.md` — modelo de dados completo planejado, fase a fase.
- `docs/SECURITY.md` — RLS, segredos, anti-contaminação.
- `docs/ROADMAP.md` — fases e vertical slices.
- `docs/PROJECT_STATE.md` — **estado atual real do projeto**, atualizar a cada etapa concluída.
- `docs/DECISIONS.md` — decisões arquiteturais registradas (DECISION/CONTEXT/OPTIONS/CHOICE/WHY/CONSEQUENCES).

## Convenções de commit

Commits pequenos e coerentes, um assunto por commit. Branches `feature/*`, `fix/*`, `chore/*`
quando fizer sentido. Nunca reunir dezenas de funcionalidades não relacionadas num único commit.
