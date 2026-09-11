# Segurança — Memória Reflexiva

## Princípios

- **Privado por padrão.** Biblioteca, reflexões, arquivos, embeddings, memória, perfil e logs são
  privados por padrão. Nada disso é público sem uma decisão explícita futura.
- **A restrição vive no banco, não na interface.** Nenhum dado pessoal pode depender apenas de "a
  interface não mostra". Toda tabela pessoal tem RLS ativo.
- **Menor privilégio.** Frontend usa `publishable key` + JWT do usuário + RLS. Chaves secretas
  (`service_role`, chaves de provedores de IA) existem exclusivamente em ambiente de backend —
  nunca em variáveis `VITE_*`, nunca no navegador.
- **Uma falha de IA nunca pode liberar conteúdo de outro usuário.**

## RLS (Row Level Security)

- Toda tabela pessoal exposta via API tem RLS **ativo** desde a migration que a cria.
- Regra predominante: `owner_id = auth.uid()` (ou `id = auth.uid()` no caso de `profiles`).
- Funções `security definer` (como o trigger de criação de perfil) devem ter `EXECUTE` revogado de
  `public`/`anon`/`authenticated` quando não são destinadas a ser chamadas diretamente via RPC —
  só o gatilho que as invoca precisa executá-las.
- Rodar `mcp__Supabase__get_advisors` (ou `supabase db lint` localmente) depois de qualquer
  migration que crie tabela, policy ou função, e resolver os avisos de segurança antes de dar a
  tarefa como concluída.

## Anti-contaminação (regra crítica do produto)

Texto criado pela IA **não é automaticamente memória autoral**. Só entra na memória autoral depois
de: revisão humana **+** aprovação explícita **+** ação explícita de incorporar. Isso deve estar
garantido no modelo de dados (rascunho/versão gerada ≠ memória autoral aprovada), nunca apenas
como uma regra de UI. Da mesma forma, conteúdo com `authorship_type = external` nunca alimenta o
perfil autoral como evidência de estilo — apenas como referência de conhecimento.

## Segredos

- `.env` e `.env.local` nunca são commitados (`.gitignore` cobre ambos). `.env.example` só contém
  nomes de variáveis e placeholders vazios.
- Segredos de provedores de IA (`TEXT_AI_PROVIDER`, `TEXT_AI_MODEL`, chaves de API) só existem como
  Supabase Secrets / variáveis de ambiente de Edge Functions — nunca como `VITE_*`.
- `VITE_SUPABASE_PUBLISHABLE_KEY` **não é secreta** — é a chave pública do projeto, protegida pelas
  policies de RLS, não por estar escondida.
- **Nunca aceitar um segredo (chave de API, token, senha) colado diretamente numa mensagem de
  chat/agente** — mesmo que a intenção seja "só para eu configurar". Uma chave assim já entra no
  histórico da conversa, que não é armazenamento seguro. Se isso acontecer: (1) não gravar o valor
  em nenhum arquivo, commit ou outra chamada de ferramenta; (2) orientar o dono a revogar/regenerar
  a chave no provedor; (3) a chave nova é cadastrada por ele mesmo direto no painel de Secrets do
  backend (aqui, Project Settings → Secrets no editor do Lovable), nunca repassada por chat. Caso
  real: 11/09/2026, chave da OpenAI colada durante a configuração da Fase 4 — tratada como
  comprometida, dono do produto revogou e cadastrou uma nova diretamente no painel.

## Storage

- Buckets pessoais (`library-originals`, `library-previews`, `reflection-exports`, `avatars`) são
  privados. Nenhum arquivo pessoal recebe URL pública permanente — usar download autenticado ou
  URL assinada de curta duração.
- Nunca editar diretamente as tabelas internas do schema `storage`; usar a API de Storage.

## Git / migrations

- Depois da fundação inicial, toda alteração estrutural do Supabase é uma migration versionada no
  GitHub. Nunca alterar o schema de produção manualmente pelo Dashboard como atalho.
- Nunca usar `git push --force` sem autorização explícita, nem `--no-verify` para pular validações.
- Operações destrutivas (drop table, reset de banco, limpar Storage, apagar branch compartilhada)
  exigem confirmação explícita do dono do produto antes de executar — ver histórico em
  `docs/DECISIONS.md` para o único caso já autorizado (reset do schema legado em 11/09/2026).

## Auditoria

Ações sensíveis (upload, exclusão, reprocessamento, correção de memória, aprovação/incorporação de
reflexão) devem gerar um `audit_event` (ver `docs/DATA_MODEL.md`). Logs de observabilidade nunca
copiam texto pessoal completo — apenas identificadores técnicos, tempos, status e erros.

## Checklist de segurança por funcionalidade

Antes de considerar uma funcionalidade pronta (ver também "Definição de pronto" em `CLAUDE.md`):

- [ ] RLS ativo e testado na(s) tabela(s) nova(s)?
- [ ] Nenhuma secret key exposta ao frontend?
- [ ] Ações destrutivas pedem confirmação?
- [ ] `get_advisors` (security) sem avisos novos não resolvidos?
- [ ] Dados de um usuário são inacessíveis a outro (teste de isolamento)?
