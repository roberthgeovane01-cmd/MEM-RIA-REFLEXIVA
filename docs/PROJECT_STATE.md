# Estado do Projeto — Memória Reflexiva

> Atualizar ao final de cada etapa significativa. Esta é a fonte de verdade sobre "onde paramos",
> não a memória da conversa.

**Fase atual**: Fase 0 — Fundação técnica (concluindo) → prestes a iniciar Fase 1 (Auth + App Shell).

## Concluído

- Investigação completa do repositório real (TanStack Start + React 19 + Vite 8 + Tailwind 4 +
  shadcn/ui, scaffold do Lovable, gerenciado com bun).
- Backend Supabase provisionado via integração nativa do Lovable (`enable_database`), projeto
  `rplriacrdebmepnmjpqt` (região a confirmar no dashboard).
- Schema legado herdado (de um projeto Supabase reaproveitado pelo Lovable, não relacionado a este
  produto) identificado e removido com autorização explícita do dono do produto — ver
  `docs/DECISIONS.md`.
- Migration de fundação aplicada: `public.profiles` (1:1 com `auth.users`), RLS (select/update do
  próprio dono), trigger `on_auth_user_created` criando o perfil automaticamente no signup,
  `EXECUTE` da função de trigger restrito (corrigido após aviso do advisor de segurança).
- Dependência `@supabase/supabase-js` adicionada; cliente tipado criado em
  `src/integrations/supabase/client.ts` + `src/integrations/supabase/types.ts` (gerado do schema
  remoto); tipos de `import.meta.env` declarados em `src/vite-env.d.ts`.
- `supabase/` local inicializado (`config.toml` + `migrations/`) espelhando o que está aplicado no
  projeto remoto — GitHub como fonte de verdade do schema.
- `.env.example` criado (só nomes de variáveis); `.gitignore` atualizado para nunca versionar
  `.env`/`.env.local`.
- CI mínimo (`.github/workflows/ci.yml`): install, typecheck, lint, build.
- Documentação fundacional criada: `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`,
  `docs/SECURITY.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, este arquivo.
- Documentação funcional do produto (fornecida pelo dono do produto) versionada em `docs/specs/`
  (MR-00, MR-01, MR-02, MR-04, MR-05, MR-06, MR-08, MR-09 + a Arquitetura Técnica Mestra).

## Em andamento

- Nenhuma tarefa de código em andamento no momento — Fase 0 fechada, aguardando início da Fase 1.

## Próximo

1. **Fase 1 — Auth + App Shell** (ver `docs/ROADMAP.md`): tela de login (e-mail/senha, conforme
   MR-01), proteção de rotas no TanStack Router, navegação global (Início, Biblioteca, Criar
   Reflexão, Meu Cérebro, Minhas Reflexões), Home mínima com estado vazio orientativo (MR-02).
2. Depois: primeiro vertical slice completo — login → upload TXT → armazenar → processar → chunks
   → buscar → mostrar resultado com fonte.

## Problemas conhecidos / dívida técnica

- MR-03 (Biblioteca) e MR-07 (Criar Reflexão) ainda não foram recebidos como documento funcional
  dedicado — pedir ao dono do produto antes de especificar esses módulos em detalhe.
- Aviso do Supabase Advisor **"Leaked Password Protection Disabled"** (nível WARN, categoria Auth)
  ainda não resolvido — é uma configuração do painel Supabase (Auth → Providers → Password), não
  uma migration SQL. Ação recomendada: habilitar no dashboard quando o dono do produto validar.
- `supabase` CLI não está disponível neste ambiente de execução — migrations foram aplicadas via
  MCP do Supabase e espelhadas manualmente como arquivos locais. Ao trabalhar num ambiente com a
  CLI disponível, rodar `supabase link` e conferir `supabase migration list` para confirmar que
  local e remoto continuam idênticos.
- Mockups visuais (`ChatGPT Image *.png`) recebidos junto com a documentação funcional não foram
  versionados no repositório (arquivos binários pesados, sem associação clara a uma tela
  específica) — ver `docs/specs/README.md`.

## Decisões pendentes

- Nenhuma decisão bloqueante pendente no momento. Decisões relevantes já tomadas estão registradas
  em `docs/DECISIONS.md`.
