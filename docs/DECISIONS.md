# Decisões Arquiteturais — Memória Reflexiva

Registro de decisões importantes. Formato: DECISION / CONTEXT / OPTIONS / CHOICE / WHY / CONSEQUENCES.

---

## 2026-09-11 — Rotas autenticadas renderizadas só no cliente (`ssr: false`)

**DECISION**: O layout `/_authenticated` (e tudo abaixo dele — Início, Biblioteca, Meu Cérebro,
Reflexões, Configurações) e `/login` usam a opção `ssr: false` do TanStack Router, em vez de SSR
completo.

**CONTEXT**: A sessão do Supabase é guardada pelo `@supabase/supabase-js` no `localStorage` do
navegador. No servidor (durante o SSR) não existe `localStorage`, então uma checagem de sessão no
servidor sempre veria "ninguém logado" — o que redirecionaria incorretamente para `/login` mesmo
usuários autenticados a cada navegação para uma página protegida. A forma correta de resolver isso
com SSR completo seria trocar para sessão baseada em cookie (pacote `@supabase/ssr`), o que é uma
mudança de arquitetura maior.

**OPTIONS**: (1) `ssr:false` nas rotas autenticadas e no login; (2) migrar para sessão via cookie
com `@supabase/ssr` agora; (3) aceitar o bug de redirecionamento incorreto.

**CHOICE**: Opção 1.

**WHY**: É uma opção nativa e documentada do TanStack Router (`ssr: false | 'data-only'`, cascata
automática para rotas filhas — verificado em `@tanstack/router-core`), não exige nova dependência,
e é apropriada para um app pessoal/privado sem necessidade de SEO nas páginas atrás do login. Opção
3 violaria "nunca confiar apenas na interface" de forma inversa (mostraria a tela errada a usuários
legítimos). Opção 2 é mais correta a longo prazo, mas overengineering para a Fase 1.

**CONSEQUENCES**: No primeiro carregamento de uma rota protegida (ou do login), o React acusa no
console um aviso de "hydration mismatch" — esperado e documentado no próprio código do
`@tanstack/react-router` (`Match.js`, `resolvedNoSsr` envolve a rota em `Suspense`); a árvore é
"regenerada no cliente" automaticamente, sem efeito visual ou funcional (verificado com captura de
tela e teste no navegador). Se o produto precisar de SSR real nessas páginas no futuro (ex.: PWA
com abertura offline, deep links compartilháveis), reavaliar com `@supabase/ssr`.

---

## 2026-09-11 — Autocadastro exposto no login (a revisar com o dono do produto)

**DECISION**: A tela de login inclui um link "Não tem conta? Criar conta" que chama
`supabase.auth.signUp` diretamente — sem convite, aprovação ou restrição de domínio.

**CONTEXT**: MR-01 §2 lista "Acesso para criação de conta, se o produto permitir auto cadastro"
como opcional ("se"). O Memória Reflexiva é um aplicativo pessoal de um único dono, e a Fase 1
precisava de alguma forma de criar a primeira conta — não havia ainda uma rota de convite/admin,
e as chaves com privilégio de administrador (`service_role`) não devem circular fora do backend.

**OPTIONS**: (1) Expor autocadastro público na tela de login (mais simples, permite qualquer
pessoa com o link criar conta); (2) omitir o link e provisionar a conta do dono do produto por
outro meio (ex.: SQL/admin API), deixando login **sem** autocadastro público; (3) autocadastro
com aprovação manual/lista de convidados.

**CHOICE**: Opção 1, por ora — sinalizada aqui para revisão explícita do dono do produto.

**WHY**: Desbloqueia o Phase 1 sem depender de uma etapa manual fora do app. RLS já isola os dados
de cada conta entre si, então autocadastro não expõe dados de ninguém — mas para um "diário
pessoal" pode não ser o comportamento desejado a longo prazo (qualquer pessoa com a URL pode criar
uma conta).

**CONSEQUENCES**: Se o dono do produto preferir um app fechado (sem autocadastro público), a
correção é simples: remover o link/modo `sign_up` de `src/routes/login.tsx` e desabilitar
"Enable email signups" nas configurações de Auth do Supabase. Registrado aqui para não ficar uma
decisão silenciosa.

---

## 2026-09-11 — Reset do backend Supabase herdado

**DECISION**: Apagar todo o schema (tabelas, policies, funções, trigger) de um projeto Supabase
que o Lovable conectou automaticamente ao habilitar o banco, antes de criar a fundação do Memória
Reflexiva.

**CONTEXT**: Ao chamar `enable_database` no projeto Lovable "MEMÓRIA REFLEXIVA" (criado em
11/09/2026), o Supabase anexado (`rplriacrdebmepnmjpqt`) não veio vazio — já continha tabelas
(`profiles`, `reflection_sessions`, `daily_sources`, `reflection_comments`), políticas de RLS,
funções e um trigger, com migrations datadas de 08/09/2026 (3 dias antes da criação deste projeto
Lovable/GitHub). O schema era conceitualmente parecido com um fluxo de "reflexão diária", mas
tecnicamente não correspondia ao modelo de dados planejado para este produto.

Havia também, na mesma conta Supabase, um projeto totalmente separado ("App Geovane 01", criado em
04/09/2026) com um schema muito mais extenso e também parecido conceitualmente (`author_profiles`,
`historical_reflections`, aprovação editorial). O dono do produto confirmou que esse projeto
separado **não** tem relação com o Memória Reflexiva e deve ser ignorado.

Sobre o banco efetivamente anexado (`rplriacrdebmepnmjpqt`), o dono do produto confirmou
explicitamente: _"estou usando um banco antigo quero que vc resete e limpe todo banco do supabase
para construirmos esse app"_.

**OPTIONS**:

1. Manter o schema herdado e adaptá-lo ao modelo de dados planejado.
2. Apagar todo o schema herdado e recomeçar do zero sobre o mesmo projeto Supabase.
3. Provisionar um projeto Supabase totalmente novo (fora do fluxo padrão de `enable_database` do
   Lovable).

**CHOICE**: Opção 2 — reset completo do schema dentro do mesmo projeto Supabase já anexado ao
Lovable.

**WHY**: O dono do produto autorizou explicitamente o reset. O schema herdado não correspondia ao
modelo de dados documentado (`docs/DATA_MODEL.md`) e não trazia dados reais de valor (a única linha
existente era um registro de teste em `profiles`, as demais tabelas estavam vazias). Manter o
projeto Supabase (em vez de criar um terceiro projeto) preserva a integração automática já feita
pelo Lovable (`get_database_status` → `enabled: true`), evitando duas estruturas concorrentes.

**CONSEQUENCES**: O schema anterior (incluindo a extensão `pgvector` não instalada, mas
`moddatetime`, `pgcrypto` e `uuid-ossp` instaladas) foi apagado via migration `reset_legacy_schema`
antes da fundação. Nenhum dado de produção real foi perdido. A partir daqui, toda estrutura nova
segue exclusivamente `docs/DATA_MODEL.md` e é criada via migration versionada neste repositório.

---

## 2026-09-11 — Provisionar o Supabase via `enable_database` do Lovable, não via um projeto avulso

**DECISION**: Usar a integração nativa Lovable → Supabase (`mcp__Lovable__enable_database`) para
anexar o backend ao projeto, em vez de criar um projeto Supabase manualmente e conectá-lo à mão.

**CONTEXT**: O mestre arquitetural determina que Lovable e Claude Code nunca devem criar estruturas
de banco concorrentes. Um projeto Supabase criado fora do fluxo do Lovable exigiria configuração
manual de variáveis de ambiente no editor Lovable e poderia divergir do que o Lovable espera.

**OPTIONS**: (1) `enable_database` do Lovable; (2) criar projeto via `mcp__Supabase__create_project`
e configurar manualmente.

**CHOICE**: Opção 1.

**WHY**: É o caminho suportado nativamente pela integração Lovable↔Supabase, evitando divergência
futura entre o que o editor Lovable "acha" que é o backend do projeto e o que realmente é.

**CONSEQUENCES**: Isso foi o que revelou o schema herdado descrito na decisão acima — o
provisionamento do Lovable, nesta conta, reaproveitou um projeto Supabase já existente em vez de
criar um novo projeto do zero. Ficou documentado como um comportamento observado, não assumido, e
tratado explicitamente (reset).

---

## 2026-09-11 — Escopo da migration de fundação (Fase 0)

**DECISION**: A primeira migration real do produto cria **apenas** `public.profiles` (+ trigger de
auto-criação no signup + RLS), não o modelo de dados completo (Biblioteca, Memória, Reflexões).

**CONTEXT**: `docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md` e o prompt fundacional definem um
modelo de dados extenso (~24 tabelas), mas também instruem explicitamente a não criar essas
tabelas mecanicamente e a seguir as fases do roadmap (Fase 0 = fundação/auth; Biblioteca só na
Fase 2; Memória só na Fase 5; etc.).

**OPTIONS**: (1) Migrar só a fundação de auth agora; (2) migrar o modelo completo de uma vez.

**CHOICE**: Opção 1.

**WHY**: Evita over-engineering e tabelas sem uso antes da funcionalidade correspondente existir;
seguir o roadmap fase a fase mantém cada migration pequena, revisável e ligada a uma funcionalidade
real (definição de pronto em `CLAUDE.md`).

**CONSEQUENCES**: O modelo completo está documentado em `docs/DATA_MODEL.md` como referência para
as próximas fases, mas cada tabela só ganha migration quando sua fase começa.
