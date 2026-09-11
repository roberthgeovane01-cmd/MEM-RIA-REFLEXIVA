# Estado do Projeto — Memória Reflexiva

> Atualizar ao final de cada etapa significativa. Esta é a fonte de verdade sobre "onde paramos",
> não a memória da conversa.

**Fase atual**: Fase 3 — Ingestão (construída: `document_sections`/`document_chunks`/
`processing_jobs`, pipeline de estruturação + chunking rodando no cliente — ver
`docs/DECISIONS.md`). Aguardando confirmação visual do dono do produto no preview do Lovable. Fase
0, Fase 1 e Fase 2 confirmadas funcionando de ponta a ponta pelo dono do produto.

## Concluído

**Fase 0 — Fundação**

- Investigação completa do repositório real (TanStack Start + React 19 + Vite 8 + Tailwind 4 +
  shadcn/ui, scaffold do Lovable, gerenciado com bun).
- Backend Supabase provisionado via integração nativa do Lovable (`enable_database`, Lovable Cloud).
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
- PR #1 (Fase 0 + Fase 1) e PR #2 (hotfix abaixo) mesclados no `main` — é o branch que o Lovable
  sincroniza.

**Pós-merge — incidente e correção (11/09/2026, mesmo dia)**

- Ao abrir o preview no Lovable após o merge, o app quebrava inteiro ("This page didn't load") em
  qualquer rota. Causa: `src/integrations/supabase/client.ts` lançava exceção no carregamento do
  módulo quando `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` estavam ausentes, e esse
  arquivo é importado pelo layout raiz — o erro derrubava a árvore inteira. Corrigido: o cliente
  nunca mais lança erro; `isSupabaseConfigured` expõe o estado, e o layout raiz mostra uma tela
  clara de "Configuração pendente" em vez de deixar cada rota quebrar (PR #2).
- Investigando a causa raiz das variáveis ausentes, descobri algo importante sobre a arquitetura:
  **o Lovable Cloud não expõe uma referência de projeto Supabase estável.** O projeto que eu
  configurei manualmente na Fase 0 (usando a MCP do Supabase diretamente) deixou de ser o backend
  realmente conectado — o Lovable já havia rebindado o app para outro backend gerenciado, sem aviso
  visível para mim. Isso está documentado em detalhe em `docs/DECISIONS.md`.
- Resolvido pedindo ao próprio agente do Lovable (via `mcp__Lovable__send_message`) para aplicar a
  migration de `profiles` diretamente no backend que ele tem conectado (o único caminho que
  realmente alcança o projeto certo). Ele precisou de `GRANT`s adicionais que um projeto Supabase
  criado manualmente não precisaria — capturados de volta em `supabase/migrations/`. O Lovable
  também gerou (e commitou direto no GitHub) `src/integrations/supabase/client.server.ts` e
  `auth-middleware.ts` — scaffolding padrão dele para operações server-side, não usados ainda mas
  mantidos (ver nota em `CLAUDE.md`).
- **Fluxo de migrations adaptado**: daqui para frente, mudanças de schema são autoradas em
  `supabase/migrations/` (fonte de verdade continua sendo o GitHub) e aplicadas pedindo ao agente
  do Lovable para executá-las no backend que ele tem conectado — ver `CLAUDE.md` § "Como aplicar
  migrations".

**Fase 2 — Biblioteca (MVP)**

- Migration aplicada (pelo agente do Lovable, fluxo já estabelecido): `library_items`,
  `library_files`, bucket privado `library-originals` (criado pela ferramenta de Storage do
  Lovable, não por SQL — ver `supabase/migrations/README.md`), RLS por dono em tudo, policies de
  Storage por pasta (`{owner_id}/{library_item_id}/{arquivo}`).
- `src/hooks/use-library.ts`: listar, buscar um item + seus arquivos, criar (com validação —
  título obrigatório, arquivo suportado ou texto colado, até 20MB — e limpeza automática se o
  upload falhar no meio do caminho), excluir (remove do Storage e do banco).
- `/library` (MR-03): lista real com busca por título/categoria/tag, estado vazio orientativo,
  badges de tipo/autoria/categoria, status de processamento.
- `/library/new` (MR-04): formulário completo (título, tipo, autoria/origem, categoria, tags, data)
  - colar texto ou enviar arquivo. Extração de texto é imediata e síncrona no navegador — sem
    fila/job ainda, isso é Fase 3.
- `/library/$id` (MR-05, versão MVP): cabeçalho com metadados, conteúdo extraído, exclusão com
  confirmação. Abas de Resumo/Memórias/Anotações ficam para quando existir IA analítica (Fase 5+).
- **Escopo definido como fora desta fase** (filtros avançados por autoria/ano/status/formato
  combinados, ordenação, paginação, seleção múltipla, coleções) — MVP MR-03/MR-04 primeiro,
  ampliar depois, conforme `docs/ROADMAP.md`.
- Build/typecheck/lint passam. Verificado neste sandbox que rotas protegidas continuam redirecionando
  corretamente para `/login`. **Confirmado com dados reais pelo dono do produto** no preview do
  Lovable em 11/09/2026 (criar item, listar, ver detalhe).

**Fase 2 — ampliação de formatos de upload (PDF/DOCX)**

- Pedido do dono do produto: tentativa de upload de PDF falhou porque só .txt/.md eram aceitos.
- `src/lib/document-extraction.ts` (novo): `detectExtension` por sufixo do nome do arquivo,
  `extractText` despachando para cada formato — `.txt`/`.md` via `file.text()`, `.pdf` via
  `pdfjs-dist` (`getDocument` + `getTextContent` por página, worker carregado por `?url`), `.docx`
  via `mammoth` (`extractRawText`). Mensagens de erro em português, incluindo aviso específico para
  PDF escaneado (sem camada de texto — OCR fica para depois).
- `use-library.ts` atualizado para usar `detectExtension`/`extractText` em vez do check fixo
  .txt/.md; limite de tamanho subiu de 5MB para 20MB (`MAX_FILE_SIZE_BYTES`).
- `/library/new`: `accept` do input de arquivo ampliado (extensões + MIME types de PDF/DOCX), texto
  de ajuda e placeholder atualizados.
- Dependências novas: `pdfjs-dist@6.3.289`, `mammoth@1.12.2` — ambas importadas dinamicamente
  (`import()`) dentro de `document-extraction.ts`, confirmadas em chunks separados no
  `bun run build` (não engordam o bundle principal para quem só usa texto colado/.txt/.md).
  `bun run typecheck`/`lint`/`build` passam; checagem no navegador (Playwright, servidor local)
  sem erros de página e com o redirecionamento de rota protegida ainda correto.
- **Confirmado pelo dono do produto** no preview do Lovable em 11/09/2026 — upload de PDF/DOCX
  testado e aprovado.

**Fase 3 — Ingestão**

- Migration `20260911200000_create_ingestion_pipeline.sql`: `document_sections` (livro → parte →
  capítulo → seção → subtítulo → página, auto-referência para hierarquia), `document_chunks`
  (com `search_vector` gerado já pronto para a Fase 4, `unique (library_item_id, chunk_index)`),
  `processing_jobs` (enum completo de status do `docs/DATA_MODEL.md`). RLS por dono em tudo.
  `library_items.processing_status` ganhou o enum completo (`processed` virou `completed` nos
  dados existentes).
- `src/lib/document-structuring.ts`: `buildSections` (detecta headings `#`/`##`/`###`… estilo
  Markdown; sem heading nenhum, o documento inteiro vira uma seção só — nunca dividido às cegas) e
  `buildChunks` (agrupa parágrafos até ~1200 caracteres, respeitando seção e parágrafo; só quebra
  um parágrafo isolado se ele sozinho passar do limite). Nenhuma IA envolvida — determinístico.
- `src/lib/document-processing.ts`: cria a `processing_jobs` row e roda o pipeline
  (`extracting → structuring → chunking → completed`/`failed`), atualizando
  `processing_jobs.status` e `library_items.processing_status` juntos a cada passo. Chamado sem
  `await` (fire-and-forget) logo depois do upload — ver `docs/DECISIONS.md` para por que isso roda
  no cliente nesta fase, e não numa fila/Edge Function.
- `use-library.ts`: `useLibraryItem` agora também busca seções, contagem de chunks e o job mais
  recente, com `refetchInterval` enquanto o status não for terminal (`completed`/`failed`);
  `useLibraryItems` também repolling enquanto algum item está processando. Exclusão agora também
  remove a `processing_jobs` row (sem FK — referência solta por design, ver a migration).
- `/library`, `/library/$id`: rótulos em português para todos os estados do pipeline (não só
  "Carregando..."); `/library/$id` ganhou um selo de status no cabeçalho, alerta com a mensagem de
  erro quando `failed`, e uma seção "Estrutura e indexação" (lista de seções detectadas + contagem
  de trechos) quando `completed`.
- Migration aplicada pelo agente do Lovable na terceira tentativa: as duas primeiras falharam por
  erro de ordenação entre o `update` que renomeia `processed → completed` e o `alter table` que
  alarga a constraint (`check` é validado imediatamente, não no commit) — corrigido no próprio
  arquivo `20260911200000_create_ingestion_pipeline.sql`, sem versões antigas mantidas por não
  terem chegado a ser aplicadas de verdade. Desta vez o Lovable não commitou um arquivo UUID
  espelho (só regenerou `types.ts`) — ver `supabase/migrations/README.md`.
- Confirmado pelo próprio agente do Lovable: as 3 tabelas existem com RLS ativo e 4 policies cada,
  a constraint aceita os 10 estados, nenhum `GRANT` extra foi necessário, nenhum bucket criado,
  advisor/linter sem avisos novos.
- `types.ts` sincronizado de volta e formatado; `bun run typecheck`/`lint`/`build` passam limpos.

## Em andamento

- Aguardando o dono do produto testar `/library/new` (criar um item) e `/library/$id` (ver o status
  avançar, abrir o detalhe e conferir a "Estrutura e indexação") no preview do Lovable, antes de
  declarar a Fase 3 concluída.

## Próximo

1. Confirmar a Fase 3 com o dono do produto.
2. **Fase 4 — RAG**: `chunk_embeddings` (ou embutido em `document_chunks`), full-text search sobre
   `document_chunks.search_vector` (já existe), busca híbrida, `EmbeddingProvider` — primeiro passo
   que precisa de segredo de IA, logo primeiro passo que precisa mesmo de backend real (Edge
   Function), fechando o primeiro vertical slice completo — login → upload → armazenar → processar
   → chunks → buscar → mostrar resultado com fonte.

## Problemas conhecidos / dívida técnica

- ~~Login de verdade ainda não testado ponta a ponta~~ **Resolvido**: o dono do produto confirmou
  em 11/09/2026 que login e cadastro funcionam no preview real do Lovable. No caminho, também foi
  necessário habilitar "Email signups" no Auth do Supabase (estava desativado por padrão) — feito
  pelo agente do Lovable. Confirmação por e-mail continua exigida por padrão antes do primeiro
  login (comportamento padrão do Supabase Auth, não alterado).
- **`supabase/migrations/` agora tem duas "gerações"**: `20260911171930`/`20260911172057` foram
  aplicadas a um projeto Supabase (`rplriacrdebmepnmjpqt`) que o Lovable Cloud não usa mais como
  backend conectado — ficam como registro histórico, não como schema vigente.
  `20260911181444`/`20260911181504`/`20260911181518` (nomes UUID, geradas pelo próprio Lovable)
  são as que refletem o backend realmente conectado hoje. Mantidas as duas por transparência — ver
  `docs/DECISIONS.md`.
- **Decisão a revisar com o dono do produto**: a tela de login expõe autocadastro público ("Criar
  conta") sem convite — ver `docs/DECISIONS.md` (2026-09-11) para o raciocínio e como reverter se
  não for o comportamento desejado para um app pessoal.
- MR-07 (Criar Reflexão) ainda não foi recebido como documento funcional dedicado — pedir ao dono
  do produto antes de especificar esse módulo em detalhe.
- Aviso do Supabase Advisor **"Leaked Password Protection Disabled"** (nível WARN, categoria Auth)
  — não confirmado se ainda se aplica ao backend atual (o advisor foi rodado contra o projeto
  antigo). Verificar de novo quando houver acesso ao projeto realmente conectado.
- O dev server local só sobe em IPv4 explícito neste sandbox (`vite dev --host 127.0.0.1 --port
8080`) porque o binding IPv6 padrão do scaffold Lovable (`host: "::"`) não é suportado aqui —
  não é um problema do código, apenas uma particularidade deste ambiente de execução.
- Mockups visuais (`ChatGPT Image *.png`) recebidos junto com a documentação funcional não foram
  versionados no repositório — ver `docs/specs/README.md`.

## Decisões pendentes

- Confirmar com o dono do produto se o autocadastro público em `/login` deve continuar ou ser
  restrito (ver `docs/DECISIONS.md`).
- Avaliar se vale a pena migrar de "Lovable Cloud" (backend gerenciado, sem referência estável)
  para a integração "Supabase" separada do Lovable (conectar um projeto Supabase explícito e
  estável) — ganharia previsibilidade, ao custo de um passo de configuração manual. Ver
  `docs/DECISIONS.md`.
