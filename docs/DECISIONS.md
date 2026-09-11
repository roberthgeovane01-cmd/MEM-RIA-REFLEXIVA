# Decisões Arquiteturais — Memória Reflexiva

Registro de decisões importantes. Formato: DECISION / CONTEXT / OPTIONS / CHOICE / WHY / CONSEQUENCES.

---

## 2026-09-11 — Lovable Cloud não tem referência de projeto Supabase estável; fluxo de migrations adaptado

**DECISION**: Parar de tratar o backend do Lovable Cloud como um projeto Supabase com `project_id`
fixo e endereçável via `mcp__Supabase__*`. Daqui para frente, migrations continuam sendo autoradas
em `supabase/migrations/` (fonte de verdade no GitHub), mas são **aplicadas pedindo ao próprio
agente do Lovable** para executá-las no backend que ele tem conectado no momento.

**CONTEXT**: Depois do merge do PR #1, o preview do Lovable quebrou inteiro ("This page didn't
load") em toda rota. Investigando, a causa imediata era `src/integrations/supabase/client.ts`
lançando exceção quando `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` estavam ausentes — e
esse arquivo é importado pelo layout raiz, então o erro derrubava a aplicação inteira (corrigido
separadamente, ver a decisão de resiliência abaixo/PR #2).

Investigando por que as variáveis estavam ausentes, pedi ao agente do Lovable
(`mcp__Lovable__send_message`) para verificar. Ele usou uma ferramenta interna chamada
`supabase--rebind_secrets` e, ao perguntar diretamente, confirmou: **o backend gerenciado do
Lovable Cloud não é mais o projeto `rplriacrdebmepnmjpqt`** que eu havia configurado manualmente
na Fase 0 via `mcp__Supabase__*` (usando o ref que o próprio dono do produto colou no chat,
copiado da URL do projeto naquele momento). O agente do Lovable explicitamente recusou revelar
qual é o novo projeto ("Its identifier and URL can't be exposed here") e também recusou vincular a
um ref específico que eu pedi ("I can't rebind this Lovable Cloud project to a specific external
project reference — the available rebind only refreshes its existing managed backend").

Verifiquei que o projeto `rplriacrdebmepnmjpqt` continua intacto (tabela `profiles` ainda lá,
inalterada) — ele não foi apagado, simplesmente deixou de ser o backend que o app usa. E o projeto
que o Lovable Cloud agora usa também não tinha a extensão `moddatetime` nem a tabela `profiles`
(confirmado ao tentar aplicar a migration original e o Lovable reportar
`function extensions.moddatetime() does not exist`).

**OPTIONS**:

1. Continuar gerenciando o schema diretamente via `mcp__Supabase__*` contra um `project_id` fixo,
   assumindo que ele permanece estável.
2. Aceitar que o Lovable Cloud é uma caixa-preta sem ref estável, e sempre que precisar de uma
   mudança de schema, pedir ao próprio agente do Lovable para aplicá-la (ele tem acesso interno que
   nós não temos, mesmo sem revelar qual projeto é).
3. Trocar de integração: desconectar o Lovable Cloud e usar a integração separada "Supabase"
   (conectar um projeto Supabase explícito, com ref estável e conhecido).

**CHOICE**: Opção 2 para agora — documentar e seguir em frente; Opção 3 registrada como decisão
pendente para o dono do produto avaliar (ver `docs/PROJECT_STATE.md`).

**WHY**: A opção 1 já se mostrou factualmente errada — o `project_id` não é estável. A opção 3
seria a mais alinhada ao princípio "GitHub/migrations como fonte de verdade" do documento
arquitetural mestre, mas é uma mudança de infraestrutura maior (desconectar Lovable Cloud, conectar
Supabase externo, possivelmente perder o que já está no backend atual) que não deveria ser feita
sem o dono do produto decidir conscientemente. A opção 2 desbloqueia o app agora, sem mudança de
infraestrutura, e ainda preserva GitHub como fonte de verdade do **conteúdo** das migrations — só
muda quem efetivamente as executa.

**CONSEQUENCES**:

- `supabase/config.toml` não tem mais um `project_id` real — é só um placeholder para
  `supabase start` local.
- `supabase/migrations/` agora contém duas gerações de arquivos: os meus
  (`20260911171930`/`20260911172057`, aplicados ao projeto antigo, mantidos como histórico) e os
  do Lovable (`20260911181444`/`20260911181504`/`20260911181518`, nomes UUID, aplicados ao backend
  realmente conectado — incluem `GRANT`s extras que o Postgres gerenciado do Lovable exige e que um
  projeto Supabase criado manualmente não precisaria).
- O Lovable também gerou e commitou direto no GitHub `src/integrations/supabase/client.server.ts`
  (cliente admin com `service_role`, atrás de um Proxy para carregamento preguiçoso) e
  `auth-middleware.ts` (middleware de validação de Bearer token para server functions do TanStack
  Start) — scaffolding padrão dele, ainda não usada pelo app, mas mantida (marcada
  "automatically generated. Do not edit it directly").
- O aviso do Supabase Advisor sobre "Leaked Password Protection" registrado na Fase 0 foi contra o
  projeto antigo — precisa ser reconferido quando houver visibilidade do projeto atual.
- Documentado em `CLAUDE.md` § "Como aplicar migrations" como o novo procedimento operacional
  padrão para mudanças de schema neste projeto.

---

## 2026-09-11 — Resiliência: app não pode quebrar inteiro por falta de configuração do Supabase

**DECISION**: `src/integrations/supabase/client.ts` nunca lança exceção no carregamento do módulo.
Em vez disso exporta `isSupabaseConfigured: boolean`, e o layout raiz (`src/routes/__root.tsx`)
mostra uma tela explicativa "Configuração pendente" quando `false`, em vez de renderizar a árvore
de rotas (que não funcionaria mesmo).

**CONTEXT**: A versão anterior lançava `throw new Error(...)` quando as variáveis de ambiente
estavam ausentes. Como `client.ts` é importado por `src/lib/auth.tsx`, que é importado por
`src/routes/__root.tsx` (o layout raiz, usado por toda rota), essa exceção derrubava a aplicação
inteira com um erro genérico do TanStack Start ("This page didn't load") — foi exatamente o que
aconteceu no preview do Lovable logo após o merge do PR #1, quando as variáveis de ambiente ainda
não estavam configuradas do lado do Lovable.

**OPTIONS**: (1) Manter o `throw` (falha rápida, mas derruba tudo); (2) nunca lançar, expor um
estado `isSupabaseConfigured` e tratar graciosamente na camada mais alta que realmente decide o que
renderizar.

**CHOICE**: Opção 2.

**WHY**: Uma configuração ausente é um estado esperado e recuperável (acontece em previews recém-
criados, ambientes de CI, forks), não deveria ter o mesmo tratamento que um bug real. Mostrar uma
mensagem clara e específica ("Configuração pendente", com os nomes exatos das variáveis faltando) é
mais útil — para o dono do produto e para qualquer engenheiro depois — do que um crash genérico.

**CONSEQUENCES**: Todo consumidor do cliente Supabase deve, em princípio, lidar com a possibilidade
de `isSupabaseConfigured` ser `false` — hoje isso é tratado uma única vez, no layout raiz, então o
resto do app pode assumir que, se está renderizando, a configuração existe.

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

---

## 2026-09-11 — Fase 3 (Ingestão): pipeline síncrono no cliente, não fila/Edge Function

**DECISION**: `document_sections`/`document_chunks` são construídos por funções puras e
determinísticas (`src/lib/document-structuring.ts`) rodando no navegador logo após o upload
(`src/lib/document-processing.ts`, chamado de forma "fire-and-forget" por `use-library.ts`), e não
por uma Supabase Edge Function disparada via fila (`pgmq`)/worker, como o desenho geral do §39-46
de `docs/specs/MR-ARQ-arquitetura-tecnica-mestra.md` descreve para o pipeline de processamento
assíncrono. A tabela `processing_jobs` e o enum completo de status (`uploaded → queued → extracting
→ structuring → chunking → embedding → extracting_memory → updating_profile → completed/failed`)
já existem desde já, exatamente como documentados em `docs/DATA_MODEL.md` — só a **execução** dos
passos desta fase é que roda no cliente.

**CONTEXT**: Estruturação (detectar capítulo/seção/subtítulo por heading) e chunking (agrupar
parágrafos respeitando a estrutura, só quebrar por tamanho como último recurso) são operações
determinísticas sobre texto já extraído — não chamam nenhum provedor de IA e não usam nenhum
segredo. Montar fila real (`pgmq` + `pg_cron` + Edge Function worker) exigiria pedir ao agente do
Lovable para provisionar e testar Edge Functions, um passo com atrito nesta sessão (ver a seção
"Como aplicar migrations" em `CLAUDE.md`) e sem precedente ainda estabelecido, para um ganho que só
importa quando o processamento realmente precisar rodar fora do navegador.

**OPTIONS**: (1) Edge Function `ingest-document` + fila `pgmq`, disparada de forma assíncrona real,
como o desenho arquitetural completo descreve; (2) função client-side, chamada sem `await` logo
após o upload, atualizando `processing_jobs`/`library_items.processing_status` diretamente via
cliente Supabase autenticado (RLS já garante isolamento por dono).

**CHOICE**: Opção 2 para a Fase 3. A Opção 1 (ou uma equivalente com fila persistente) passa a ser
obrigatória a partir do momento em que um passo do pipeline precisar de um provedor de IA com
segredo (`embedding` — Fase 4 — e daí em diante) — `docs/SECURITY.md`/`CLAUDE.md` já proíbem
segredo de IA no frontend, então essa mudança de camada não é opcional quando chegar a hora.

**WHY**: "Não construir 50% de cada módulo" — investir em infraestrutura de fila real antes de
haver qualquer passo que precise dela é complexidade adiantada sem benefício imediato, para um app
de um usuário só. Manter `processing_jobs` e o enum de status completos desde já significa que
quando a execução migrar para o backend (Fase 4), a interface e o modelo de dados não mudam — só
quem escreve nas mesmas tabelas muda (Edge Function com `service_role` em vez do cliente
autenticado).

**CONSEQUENCES**: Processamento não sobrevive ao fechamento da aba antes de terminar (diferente de
uma fila real, que sobrevive). Para o tamanho de documento do MVP (até 20MB de texto, sem OCR/IA),
isso é rápido o bastante para não ser um problema prático observável. `document_chunks.token_count`
é uma estimativa (`tamanho / 4`), não uma contagem real de tokens — fica correta quando a Fase 4
escolher um modelo/tokenizer real. `document_chunks.page_start`/`page_end` e
`document_sections.start_page`/`end_page` ficam `null` por enquanto — a extração de PDF
(`src/lib/document-extraction.ts`) já junta todas as páginas num único texto antes deste pipeline
rodar, então a proveniência por página ainda não é rastreada no nível de chunk/seção (só no nível
do arquivo). Melhorar isso é um passo futuro independente, não bloqueia a Fase 3.

**Nota (Fase 4)**: a frase acima sobre "Edge Function com `service_role`" antecipava mal o desenho —
na implementação real (ver decisão seguinte), a Edge Function usa o JWT do próprio usuário, não
`service_role`. RLS sozinha já basta.

---

## 2026-09-11 — Fase 4 (RAG): OpenAI para embeddings, embutidos em `document_chunks`, busca híbrida via RPC `SECURITY INVOKER`

**DECISION**: Usar OpenAI `text-embedding-3-small` (1536 dimensões) como `EmbeddingProvider`; guardar
o vetor diretamente em `document_chunks.embedding` (colunas `embedding_model`/`embedding_version`
junto, em vez de uma tabela `chunk_embeddings` separada); implementar a busca híbrida como uma
função SQL (`search_document_chunks`, fusão por Reciprocal Rank Fusion — RRF) chamada por uma Edge
Function `search`; gerar os embeddings numa Edge Function separada (`generate-embeddings`), acionada
pelo cliente logo que o pipeline síncrono da Fase 3 chega a `completed`.

**CONTEXT**: Este é o primeiro passo do pipeline que precisa de um provedor de IA com segredo —
`OPENAI_API_KEY` nunca pode existir no navegador (`docs/SECURITY.md`), então a execução
obrigatoriamente muda de camada aqui, exatamente como antecipado na decisão da Fase 3. O dono do
produto escolheu o provedor explicitamente (pergunta feita via `AskUserQuestion`, três opções
apresentadas: OpenAI, Voyage AI, Google Gemini) e optou por usar a própria chave da OpenAI em vez do
AI Gateway do Lovable.

**Incidente de segurança durante a configuração**: o dono do produto colou uma chave de API real da
OpenAI diretamente numa resposta de chat. Isso nunca foi gravado em nenhum arquivo, commit ou outra
chamada de ferramenta — tratado como comprometido na hora: pedimos para ele revogar a chave colada,
gerar uma nova, e cadastrá-la ele mesmo direto em **Project Settings → Secrets** no editor do
Lovable (confirmado pelo próprio agente do Lovable como o caminho correto), nunca de volta pelo
chat. Ver `docs/SECURITY.md` § Segredos para a regra registrada a partir disso.

**OPTIONS** (provedor): (1) OpenAI `text-embedding-3-small` — mais barato, mais documentado em
tutoriais de RAG com Supabase; (2) Voyage AI `voyage-multilingual-2` — parceiro de embeddings
recomendado pela Anthropic; (3) Google Gemini `text-embedding-004`. **OPTIONS** (armazenamento):
(1) `chunk_embeddings` separada, como o modelo de dados documenta; (2) coluna `embedding` embutida
em `document_chunks`, opção que o próprio `docs/DATA_MODEL.md` já permite explicitamente "se
simplificar a arquitetura". **OPTIONS** (execução do embedding): (1) Edge Function isolada, chamada
pelo cliente; (2) trigger/webhook de banco disparando automaticamente quando `processing_status`
vira `completed` pela primeira vez.

**CHOICE**: OpenAI (escolha do dono do produto); embutido em `document_chunks` (opção 2); Edge
Function chamada pelo cliente (opção 1).

**WHY**: Embutir na própria tabela evita um `join` que não traria benefício real — este projeto
nunca compara embeddings de mais de um modelo ao mesmo tempo (regra do `docs/DATA_MODEL.md`), então
não há necessidade de uma tabela historizando várias gerações de embedding por chunk. Chamar a Edge
Function pelo cliente (em vez de um trigger/webhook) segue a mesma lógica de "não construir 50% do
módulo" da Fase 3: um trigger de banco exigiria configurar `pg_net`/webhooks antes de haver qualquer
uso real disso, e o padrão fire-and-forget já está estabelecido e funcionando. A função de busca é
`SECURITY INVOKER` (o padrão do Postgres, não declarado `SECURITY DEFINER`) para que RLS continue
sendo aplicada normalmente em cada tabela que ela consulta — nenhuma das duas Edge Functions usa
`service_role`; ambas criam um cliente Supabase autenticado com o JWT de quem chamou, então toda
leitura/escrita já é automaticamente restrita ao próprio dono pelas policies existentes (princípio
de menor privilégio, `docs/SECURITY.md`). RRF (em vez de soma ponderada de `ts_rank` + similaridade
de cosseno) evita ter que normalizar duas métricas que vivem em escalas completamente diferentes.

**CONSEQUENCES**: Trocar de provedor no futuro significa reimplementar só
`supabase/functions/_shared/embedding-provider.ts` — nenhum outro arquivo muda. Trocar de MODELO (ou
de dimensão) exige reembutir todos os chunks existentes (bump em `EMBEDDING_VERSION`, e uma migration
de dados) — nunca comparar vetores de versões diferentes na mesma busca, e a Fase 4 ainda não tem
esse reprocessamento em massa automatizado (fica para quando for realmente necessário). Já que o
embedding de cada chunk só é gerado depois que a Fase 3 termina (fire-and-forget, sem `await`), um
item pode ficar momentaneamente em `completed` sem embeddings ainda — a metade léxica (full-text) da
busca híbrida já funciona nesse intervalo, só a metade semântica fica incompleta até a Edge Function
terminar. Índice HNSW (não `ivfflat`) porque constrói incrementalmente — certo para uma biblioteca
que começa vazia e cresce documento a documento, ao contrário do `ivfflat`, que quer dados presentes
de antemão para treinar bem.
