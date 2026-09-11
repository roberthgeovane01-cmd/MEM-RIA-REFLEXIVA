# Estado do Projeto — Memória Reflexiva

> Atualizar ao final de cada etapa significativa. Esta é a fonte de verdade sobre "onde paramos",
> não a memória da conversa.

**Fase atual**: Fase 1 — Auth + App Shell (concluída) → prestes a iniciar Fase 2 (Biblioteca).

## Concluído

**Fase 0 — Fundação**

- Investigação completa do repositório real (TanStack Start + React 19 + Vite 8 + Tailwind 4 +
  shadcn/ui, scaffold do Lovable, gerenciado com bun).
- Backend Supabase provisionado via integração nativa do Lovable (`enable_database`), projeto
  `rplriacrdebmepnmjpqt`.
- Schema legado herdado (de um projeto Supabase reaproveitado pelo Lovable, não relacionado a este
  produto) identificado e removido com autorização explícita do dono do produto — ver
  `docs/DECISIONS.md`.
- Migration de fundação aplicada: `public.profiles` (1:1 com `auth.users`), RLS (select/update do
  próprio dono), trigger `on_auth_user_created` criando o perfil automaticamente no signup,
  `EXECUTE` da função de trigger restrito (corrigido após aviso do advisor de segurança).
- Dependência `@supabase/supabase-js` adicionada; cliente tipado em
  `src/integrations/supabase/client.ts` + `src/integrations/supabase/types.ts` (gerado do schema
  remoto); `supabase/` local (`config.toml` + `migrations/`) espelhando o remoto.
- `.env.example` criado; `.gitignore` cobre `.env`/`.env.local`. CI mínimo
  (`.github/workflows/ci.yml`): install, typecheck, lint, build.
- Documentação fundacional (`CLAUDE.md`, `docs/*.md`) e especificações funcionais do produto em
  `docs/specs/` (MR-00, MR-01, MR-02, MR-04, MR-05, MR-06, MR-08, MR-09 + Arquitetura Técnica Mestra).

**Fase 1 — Auth + App Shell**

- Variáveis de ambiente reais do projeto Supabase confirmadas contra a convenção documentada do
  Lovable Cloud (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`)
  e gravadas em `.env.local` (não commitado).
- Camada de autenticação: `src/lib/auth.tsx` (`AuthProvider`/`useAuth`, reativo a
  sign-in/sign-out), `src/hooks/use-profile.ts` (perfil via TanStack Query).
- `src/routes/login.tsx` (MR-01): entrar, criar conta, recuperar senha, mostrar/ocultar senha,
  mensagens de erro neutras, estado de carregamento.
- `src/routes/_authenticated.tsx`: layout protegido (`beforeLoad` redireciona para `/login` sem
  sessão; `ssr:false` — decisão registrada em `docs/DECISIONS.md`), envolvendo todas as rotas
  privadas com `src/components/app-shell.tsx` (sidebar desktop / barra inferior mobile, os cinco
  destinos de MR-00 §9 + menu de perfil com Configurações e Sair).
- `src/routes/_authenticated/index.tsx` (Home, MR-02): saudação, ações rápidas, resumos vazios
  orientativos (Biblioteca/Cérebro/Reflexões), atividades recentes.
- Páginas-esqueleto protegidas e navegáveis para os módulos ainda não construídos: `/library`,
  `/brain`, `/reflections`, `/reflections/new` (via `PagePlaceholder`, sempre citando a fase do
  roadmap responsável) e `/settings` (funcional: mostra conta real + Sair).
- Antiga página de demonstração do scaffold Lovable (`src/routes/index.tsx`) removida — `/` agora é
  a Home real, protegida.
- Verificado em navegador real (Playwright/Chromium headless): `/` redireciona para `/login`
  quando deslogado; `/library` (e por extensão qualquer rota protegida) também redireciona;
  formulário de login renderiza corretamente com o tema visual existente; alternância
  mostrar/ocultar senha funciona; alternância login↔criar conta funciona; layout responsivo
  (390px) sem overflow. Screenshots gerados durante a verificação (não commitados).
- `typecheck`, `lint` e `build` de produção passam sem erros.

## Em andamento

- Nenhuma tarefa de código em andamento no momento — Fase 1 fechada, aguardando início da Fase 2.

## Próximo

1. **Fase 2 — Biblioteca** (MR-03 recebido, ver `docs/ROADMAP.md`): modelar e migrar
   `library_items`/`library_files`, criar buckets de Storage, construir upload + listagem + busca
   simples + Detalhe do Documento (MR-05).
2. Depois: pipeline de ingestão (Fase 3) e o primeiro vertical slice completo — login → upload TXT
   → armazenar → processar → chunks → buscar → mostrar resultado com fonte.

## Problemas conhecidos / dívida técnica

- **Login de verdade ainda não foi testado ponta a ponta com a API real do Supabase** — o ambiente
  de execução deste agente bloqueia conexões de saída diretas para `supabase.co` (política de
  egress do sandbox, confirmada via `/root/.ccr/README.md`; não é um problema do app). A parte de
  banco (schema, RLS, trigger) foi verificada diretamente via MCP do Supabase; a parte de UI foi
  verificada em navegador real. O que falta verificar é a chamada HTTP real de login/cadastro —
  recomendo testar isso assim que o app estiver rodando fora deste sandbox (preview do Lovable, ou
  ambiente local do dono do produto).
- **Decisão a revisar com o dono do produto**: a tela de login expõe autocadastro público ("Criar
  conta") sem convite — ver `docs/DECISIONS.md` (2026-09-11) para o raciocínio e como reverter se
  não for o comportamento desejado para um app pessoal.
- MR-07 (Criar Reflexão) ainda não foi recebido como documento funcional dedicado — pedir ao dono
  do produto antes de especificar esse módulo em detalhe.
- Aviso do Supabase Advisor **"Leaked Password Protection Disabled"** (nível WARN, categoria Auth)
  ainda não resolvido — é uma configuração do painel Supabase (Auth → Providers → Password), não
  uma migration SQL.
- `supabase` CLI não está disponível neste ambiente de execução — migrations foram aplicadas via
  MCP do Supabase e espelhadas manualmente como arquivos locais. Ao trabalhar num ambiente com a
  CLI disponível, rodar `supabase link` e conferir `supabase migration list`.
- O dev server local só sobe em IPv4 explícito neste sandbox (`vite dev --host 127.0.0.1 --port
8080`) porque o binding IPv6 padrão do scaffold Lovable (`host: "::"`) não é suportado aqui —
  não é um problema do código, apenas uma particularidade deste ambiente de execução.
- Mockups visuais (`ChatGPT Image *.png`) recebidos junto com a documentação funcional não foram
  versionados no repositório — ver `docs/specs/README.md`.

## Decisões pendentes

- Confirmar com o dono do produto se o autocadastro público em `/login` deve continuar ou ser
  restrito (ver `docs/DECISIONS.md`).
- Nenhuma outra decisão bloqueante pendente.
