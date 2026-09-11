# ARQUITETURA TÉCNICA MESTRA

## MEMÓRIA REFLEXIVA

### Versão 1.0 — Fundação técnica para construção do aplicativo

---

# 1. MISSÃO DA ARQUITETURA

O Memória Reflexiva será um aplicativo web privado capaz de transformar um acervo pessoal em:

**Biblioteca → conhecimento estruturado → memória inteligente → perfil autoral → inteligência personalizada → novas reflexões.**

A tecnologia não deverá ser o centro do produto.

Ela deverá existir para permitir que o usuário:

- preserve sua produção;
- encontre suas ideias;
- compreenda padrões do próprio pensamento;
- utilize sua memória durante novas reflexões;
- mantenha controle sobre aquilo que a IA conclui;
- revise tudo antes de uma produção da IA ser considerada parte de sua memória.

A arquitetura deverá ser:

- segura;
- auditável;
- modular;
- evolutiva;
- versionada;
- compreensível;
- economicamente sustentável;
- preparada para crescer sem precisar reconstruir o aplicativo.

---

# 2. PRINCÍPIO ARQUITETURAL CENTRAL

O aplicativo terá seis camadas.

```text
CAMADA 1
EXPERIÊNCIA DO USUÁRIO
Lovable / TanStack Start / React

        ↓

CAMADA 2
APLICAÇÃO
rotas + componentes + serviços + estado

        ↓

CAMADA 3
BACKEND
Supabase Auth + Database + Storage + Edge Functions

        ↓

CAMADA 4
PROCESSAMENTO
filas + extração + chunking + embeddings + análises

        ↓

CAMADA 5
MEMÓRIA E IA
RAG + perfil autoral + recuperação + geração

        ↓

CAMADA 6
GOVERNANÇA
GitHub + migrations + testes + Claude Code + documentação
```

Nenhuma dessas camadas deverá assumir responsabilidades das demais sem necessidade.

---

# 3. PAPEL DE CADA FERRAMENTA

## 3.1 LOVABLE

Responsabilidade principal:

# EXPERIÊNCIA VISUAL E FRONTEND.

O Lovable deverá ser utilizado para:

- criação das telas;
- design responsivo;
- componentes;
- navegação;
- experiência do usuário;
- ajustes visuais;
- refinamento de layouts;
- integração do frontend com os serviços definidos.

Aplicativos novos do Lovable atualmente utilizam TanStack Start com SSR por padrão, salvo exceções da plataforma/plano. Não migrar para uma stack antiga sem uma razão técnica comprovada.

### O Lovable NÃO será a fonte soberana do backend.

Embora sua integração com Supabase consiga alterar banco e Edge Functions, essas mudanças deverão ser controladas pela arquitetura versionada.

---

# 3.2 GITHUB

O GitHub será:

# A FONTE DE VERDADE DO CÓDIGO.

Tudo que constitui o aplicativo deverá existir no repositório:

- frontend;
- migrations;
- funções;
- testes;
- prompts;
- documentação;
- configurações;
- políticas;
- decisões arquiteturais.

A integração GitHub↔Lovable possui sincronização bidirecional; quando conectada, a documentação do Lovable trata o GitHub como fonte de verdade do código.

Não renomear, mover ou apagar arbitrariamente o repositório conectado ao Lovable porque isso pode quebrar a sincronização.

---

# 3.3 SUPABASE

O Supabase será:

# O NÚCLEO OPERACIONAL DO APLICATIVO.

Utilizaremos:

- PostgreSQL;
- Supabase Auth;
- Supabase Storage;
- Row Level Security;
- Edge Functions;
- pgvector;
- full-text search;
- Supabase Queues/pgmq;
- pg_cron quando necessário;
- Realtime seletivamente;
- migrations;
- secrets.

O Supabase fornece um PostgreSQL real e integra Database, Auth, Storage e Functions sobre a mesma infraestrutura.

---

# 3.4 CLAUDE CODE

Claude Code será:

# ENGENHEIRO PRINCIPAL DO PROJETO.

Será responsável por:

- compreender esta arquitetura;
- planejar;
- implementar;
- escrever migrations;
- criar componentes;
- escrever testes;
- investigar erros;
- manter documentação;
- revisar alterações;
- realizar commits;
- preparar PRs;
- preservar a coerência do sistema.

Claude Code trabalha diretamente sobre o repositório e consegue investigar arquivos e executar operações de desenvolvimento e Git.

---

# 4. GOVERNANÇA DAS FERRAMENTAS

A seguinte regra será obrigatória:

```text
LOVABLE
→ UX/UI

GITHUB
→ FONTE DO CÓDIGO

CLAUDE CODE
→ ENGENHARIA E IMPLEMENTAÇÃO

SUPABASE
→ BACKEND E DADOS
```

Não teremos:

```text
Lovable criando uma tabela
+
Claude criando outra tabela equivalente
+
Dashboard Supabase alterando manualmente uma terceira versão.
```

Isso criaria divergência.

---

# 5. REGRA DE OURO DO BANCO DE DADOS

Depois da fundação inicial:

# TODA ALTERAÇÃO ESTRUTURAL DO SUPABASE DEVERÁ SER UMA MIGRATION VERSIONADA NO GITHUB.

Exemplos:

- criar tabela;
- alterar coluna;
- criar índice;
- ativar RLS;
- criar policy;
- criar trigger;
- criar função SQL;
- adicionar extensão.

A própria documentação do Supabase recomenda que equipes mantenham mudanças estruturais em migrations e alerta que alterar diretamente o banco remoto depois pode produzir divergência no histórico.

---

# 6. AMBIENTES

Inicialmente teremos:

## DESENVOLVIMENTO LOCAL

Claude Code trabalha aqui.

Supabase CLI poderá reproduzir localmente banco, migrations e funções.

## PRODUÇÃO

Projeto oficial no Supabase.

Aplicativo publicado pelo Lovable.

Posteriormente:

## STAGING/PREVIEW

Poderá ser adicionado quando necessário.

O Supabase recomenda local → preview/staging → produção, e seu sistema de branches permite criar ambientes isolados por PR em planos compatíveis.

---

# 7. ESTRUTURA DO REPOSITÓRIO

A estrutura exata deverá respeitar o scaffold criado pelo Lovable/TanStack Start.

Conceitualmente:

```text
/
├── app/
│   ├── routes/
│   ├── components/
│   ├── features/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── styles/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── tests/
│   ├── seed.sql
│   └── config.toml
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PRODUCT_SCOPE.md
│   ├── DATA_MODEL.md
│   ├── RAG_ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── DECISIONS.md
│   ├── ROADMAP.md
│   └── PROJECT_STATE.md
│
├── prompts/
│   ├── author-profile/
│   ├── reflection/
│   ├── memory/
│   └── evaluation/
│
├── tests/
│
├── CLAUDE.md
├── README.md
└── ...
```

Não reorganizar o scaffold do framework apenas para fazê-lo parecer com este desenho.

Adaptar a organização ao projeto real.

---

# 8. MÓDULOS FUNCIONAIS

O sistema será dividido em:

### AUTH

Login e sessão.

### HOME

Página inicial.

### LIBRARY

Biblioteca.

### INGESTION

Upload e processamento.

### DOCUMENT

Detalhe do documento.

### MEMORY

Memória estruturada.

### AUTHOR BRAIN

Meu Cérebro.

### REFLECTION ENGINE

Criar Reflexão.

### REFLECTION ARCHIVE

Minhas Reflexões.

### SETTINGS

Configurações.

### AI ORCHESTRATION

LLM, retrieval e prompts.

### AUDIT

Proveniência e eventos.

---

# 9. SUPABASE AUTH

Supabase Auth deverá controlar:

- cadastro;
- login;
- logout;
- sessão;
- redefinição de senha;
- posteriormente OAuth.

O navegador recebe somente credenciais públicas apropriadas.

Secrets administrativos nunca deverão ir para o frontend.

O Supabase recomenda chave publicável no código distribuído e chave secreta exclusivamente em ambientes controlados; chaves secretas podem ultrapassar RLS e nunca devem chegar ao navegador.

---

# 10. MODELO MULTIUSUÁRIO, MESMO COM UM USUÁRIO

A primeira versão terá apenas um usuário principal.

Mesmo assim, o banco será estruturado com:

```text
owner_id UUID
```

Isso evita reconstrução futura.

A regra predominante de segurança será:

```text
owner_id = auth.uid()
```

---

# 11. RLS — ROW LEVEL SECURITY

Todas as tabelas expostas deverão ter:

# RLS ATIVO.

O Supabase recomenda RLS em tabelas de schemas expostos e ressalta que grants e policies precisam ser configurados corretamente.

Nenhum dado pessoal deverá depender apenas de:

“a interface não mostra”.

A restrição deverá existir dentro do banco.

---

# 12. STORAGE

Buckets inicialmente:

```text
library-originals
library-previews
reflection-exports
avatars
```

Preferencialmente privados.

Os documentos pessoais não deverão possuir URL pública permanente.

Supabase Storage utiliza buckets privados sujeitos a controle de acesso; downloads podem ser autenticados ou realizados com URLs assinadas temporárias.

---

# 13. MODELO DE DADOS PRINCIPAL

## `profiles`

Representa o usuário.

Campos principais:

```text
id
display_name
avatar_path
locale
timezone
created_at
updated_at
```

`id` referencia `auth.users.id`.

---

# 14. BIBLIOTECA

## `library_items`

Representa intelectualmente cada item da Biblioteca.

```text
id
owner_id
title
item_type
authorship_type
description
category
language
original_date
year
processing_status
memory_status
created_at
updated_at
deleted_at
```

### `item_type`

Exemplos:

```text
book
reflection
letter
report
message
note
document
other
```

### `authorship_type`

Fundamental:

```text
self_authored
external
mixed
unknown
```

Essa distinção impedirá que uma obra de outra pessoa seja confundida com a identidade autoral do usuário.

---

# 15. ARQUIVOS

## `library_files`

```text
id
owner_id
library_item_id
storage_bucket
storage_path
original_filename
mime_type
file_size
checksum
version
created_at
```

Um item poderá possuir diferentes versões de arquivo sem perder o original.

---

# 16. ESTRUTURA DOCUMENTAL

## `document_sections`

Preserva:

- livro;
- parte;
- capítulo;
- seção;
- subtítulo;
- página.

Campos:

```text
id
owner_id
library_item_id
parent_section_id
section_type
title
sequence
start_page
end_page
text_content
metadata
```

---

# 17. CHUNKS

## `document_chunks`

Unidades utilizadas pela busca.

```text
id
owner_id
library_item_id
section_id
chunk_index
content
token_count
page_start
page_end
search_vector
metadata
created_at
```

Não dividir documentos cegamente.

O chunking será:

# ESTRUTURALMENTE CONSCIENTE.

Primeiro respeitar:

capítulo → seção → parágrafo.

Depois aplicar limite de tamanho.

---

# 18. EMBEDDINGS

## `chunk_embeddings`

```text
id
owner_id
chunk_id
embedding
embedding_model
embedding_version
created_at
```

Também poderá ser embutido diretamente no `document_chunks`, caso isso simplifique a arquitetura.

A decisão será tomada durante implementação.

Uma regra é obrigatória:

# TODOS OS VETORES COMPARADOS PRECISAM SER GERADOS PELO MESMO MODELO.

O Supabase alerta explicitamente que comparar embeddings produzidos por modelos diferentes não é semanticamente válido.

---

# 19. ESTRATÉGIA DE EMBEDDING

O provedor ficará abstraído.

Não hardcodar o aplicativo a um fornecedor.

Variáveis conceituais:

```text
EMBEDDING_PROVIDER
EMBEDDING_MODEL
EMBEDDING_DIMENSIONS
```

Para conteúdo predominantemente em português, selecionar um modelo com desempenho multilíngue adequado.

Trocar o modelo futuramente deverá exigir:

- nova versão;
- reindexação controlada;
- nunca mistura silenciosa entre vetores incompatíveis.

---

# 20. MEMÓRIA INTELIGENTE

## `memory_items`

Não será apenas chunk.

Será conhecimento extraído.

```text
id
owner_id
memory_type
title
canonical_text
summary
importance
confidence
temporal_start
temporal_end
status
created_at
updated_at
```

Tipos possíveis:

```text
idea
theme
concept
event
experience
person
place
metaphor
value
writing_pattern
argument_pattern
story
quote_reference
belief
question
```

---

# 21. EVIDÊNCIAS DA MEMÓRIA

## `memory_evidence`

Relaciona cada conclusão às fontes.

```text
id
owner_id
memory_item_id
library_item_id
section_id
chunk_id
evidence_type
relevance_score
created_at
```

Assim:

# TODA MEMÓRIA DERIVADA PODE VOLTAR À FONTE.

---

# 22. RELAÇÕES ENTRE MEMÓRIAS

## `memory_relations`

```text
id
owner_id
source_memory_id
target_memory_id
relation_type
confidence
created_at
```

Exemplos:

```text
supports
contradicts
evolves_from
related_to
caused_by
example_of
part_of
```

Isso permitirá futuramente construir mapas de ideias.

---

# 23. MEU CÉREBRO — PERFIL AUTORAL

A IA não manterá o “perfil do usuário” como um gigantesco texto livre.

Ele será estruturado.

## `author_profile_versions`

```text
id
owner_id
version
summary
generated_at
approved_at
status
```

---

# 24. CARACTERÍSTICAS AUTORAIS

## `author_traits`

```text
id
owner_id
profile_version_id
trait_type
title
description
confidence
status
created_at
```

Exemplos:

```text
writing_style
reasoning_pattern
narrative_pattern
tone
recurring_theme
metaphor_pattern
argument_pattern
structural_pattern
```

---

# 25. EVIDÊNCIAS AUTORAIS

## `author_trait_evidence`

```text
id
owner_id
author_trait_id
chunk_id
memory_item_id
weight
explanation
```

Quando a interface disser:

“Você frequentemente desenvolve suas reflexões por contraste”

será possível clicar:

# VER EVIDÊNCIAS.

---

# 26. FEEDBACK DO USUÁRIO

## `author_feedback`

```text
id
owner_id
target_type
target_id
feedback_type
user_comment
created_at
```

Tipos:

```text
agree
partially_agree
disagree
correct
hide
```

A IA deverá aprender operacionalmente com esse feedback.

---

# 27. REFLEXÕES

## `reflections`

Representa o projeto reflexivo.

```text
id
owner_id
title
status
theme
created_at
updated_at
approved_at
incorporated_at
```

---

# 28. ENTRADAS DA REFLEXÃO

## `reflection_inputs`

```text
id
owner_id
reflection_id
input_type
content
source_metadata
created_at
```

Tipos:

```text
external_reflection
personal_comment
additional_instruction
```

---

# 29. FONTES SELECIONADAS

## `reflection_source_selections`

```text
id
owner_id
reflection_id
library_item_id
selection_mode
created_at
```

Possibilitará:

- memória global;
- livros selecionados;
- documentos selecionados;
- sem memória.

---

# 30. RETRIEVAL

## `reflection_retrieval_runs`

Registra cada investigação da memória.

```text
id
owner_id
reflection_id
query
strategy
created_at
```

## `reflection_retrieval_items`

```text
id
retrieval_run_id
chunk_id
memory_item_id
semantic_score
lexical_score
combined_score
rank
selected
```

Isso torna o RAG auditável.

---

# 31. BUSCA HÍBRIDA

Não utilizar somente vector search.

A estratégia será:

```text
FULL-TEXT SEARCH
+
VECTOR SEARCH
+
METADADOS
+
FILTROS
+
RANK FUSION
=
RESULTADOS
```

Supabase possui suporte documentado para combinar `tsvector` com `pgvector` para busca híbrida.

---

# 32. RAG

Fluxo de consulta:

```text
Pergunta
↓
Compreensão da intenção
↓
Definição do escopo
↓
Busca lexical
↓
Busca semântica
↓
Filtros
↓
Fusão de ranking
↓
Seleção de evidências
↓
Context Pack
↓
LLM
↓
Resposta fundamentada
```

---

# 33. PERMISSÕES NO RAG

Mesmo os resultados vetoriais deverão respeitar RLS.

Isso é possível porque pgvector está integrado ao PostgreSQL e pode usar as mesmas políticas de acesso dos documentos.

---

# 34. CONFLITOS

## `reflection_conflicts`

```text
id
owner_id
reflection_id
current_statement
memory_statement
evidence_chunk_id
conflict_type
confidence
user_resolution
created_at
```

Não concluir automaticamente que o pensamento atual está errado.

Apresentar:

# POSSÍVEL DIVERGÊNCIA.

---

# 35. PLANO DA REFLEXÃO

## `reflection_plans`

```text
id
owner_id
reflection_id
version
plan_json
user_status
created_at
```

A IA primeiro deverá planejar.

Depois gerar.

---

# 36. VERSÕES DA REFLEXÃO

## `reflection_versions`

```text
id
owner_id
reflection_id
version_number
content
created_by
model
prompt_version
created_at
```

`created_by`:

```text
ai
user
mixed
```

---

# 37. APROVAÇÃO

## `reflection_approvals`

Registra explicitamente:

```text
reflection_version_id
approved_by
approved_at
incorporate_into_memory
```

---

# 38. PRINCÍPIO DE NÃO AUTOCONTAMINAÇÃO

Conteúdo escrito pela IA:

# NÃO É MEMÓRIA AUTORAL.

Somente uma versão:

- revisada;
- aprovada;
- explicitamente incorporada

poderá entrar na memória autoral.

Isso impede:

```text
IA gera
↓
IA aprende com IA
↓
IA gera novamente
↓
identidade humana desaparece
```

---

# 39. PROCESSAMENTO ASSÍNCRONO

Não bloquear upload enquanto toda análise acontece.

Fluxo:

```text
UPLOAD
↓
registro criado
↓
job enfileirado
↓
interface retorna imediatamente
↓
worker processa
↓
status atualizado
```

Supabase Queues oferece filas persistentes baseadas em Postgres/pgmq para tarefas em background.

---

# 40. FILAS

Inicialmente:

```text
document_ingestion
embedding_generation
memory_extraction
author_profile_update
```

Posteriormente:

```text
reflection_generation
exports
audio_processing
```

---

# 41. PIPELINE DE INGESTÃO

Um arquivo seguirá:

```text
RECEBIDO
↓
VALIDADO
↓
ORIGINAL PRESERVADO
↓
TEXTO EXTRAÍDO
↓
NORMALIZADO
↓
ESTRUTURA IDENTIFICADA
↓
SEÇÕES
↓
CHUNKS
↓
EMBEDDINGS
↓
MEMÓRIAS
↓
PERFIL AUTORAL
↓
CONCLUÍDO
```

---

# 42. STATUS DE PROCESSAMENTO

Utilizar estados explícitos:

```text
uploaded
queued
extracting
structuring
chunking
embedding
extracting_memory
updating_profile
completed
failed
```

Nunca mostrar apenas:

“Carregando...”

O usuário deverá saber o que está acontecendo.

---

# 43. `processing_jobs`

Além da queue, manter tabela de acompanhamento:

```text
id
owner_id
job_type
entity_type
entity_id
status
progress
attempt_count
error_code
error_message
started_at
finished_at
```

Isso alimentará a interface.

---

# 44. EDGE FUNCTIONS

Serão responsáveis por operações privilegiadas e integração com serviços externos.

Exemplos:

```text
ingest-document
generate-embeddings
extract-memory
build-author-profile
retrieve-memory
analyze-conflicts
generate-reflection-plan
generate-reflection
incorporate-reflection
```

Evitar uma única função monstruosa.

---

# 45. LIMITES DAS EDGE FUNCTIONS

Edge Functions são adequadas para orquestração de APIs e tarefas curtas, mas atualmente possuem limites de CPU, memória e duração. Supabase recomenda mover processamento pesado para tarefas/serviços apropriados.

Portanto:

### MVP

Suportar prioritariamente:

- TXT;
- Markdown;
- DOCX textuais;
- PDFs com camada de texto.

### Posteriormente

Adicionar pipeline especializado para:

- OCR;
- PDFs escaneados;
- imagens;
- áudio;
- vídeo.

Não colocar OCR pesado dentro de uma única Edge Function.

---

# 46. EMBEDDINGS ASSÍNCRONOS

Supabase documenta arquitetura utilizando:

- pgvector;
- pgmq;
- pg_net;
- pg_cron;
- Edge Functions

para gerar embeddings de forma assíncrona, com retries.

Esse padrão poderá inspirar nosso worker.

---

# 47. CAMADA DE IA

Nunca chamar diretamente um fornecedor em vinte pontos do código.

Criar:

```text
AIProvider
EmbeddingProvider
```

Exemplo conceitual:

```text
generateText()
generateStructuredOutput()
embedText()
```

Isso permitirá trocar modelos futuramente.

---

# 48. CONFIGURAÇÃO DE IA

Segredos somente backend.

Exemplos conceituais:

```text
TEXT_AI_PROVIDER
TEXT_AI_MODEL
EMBEDDING_PROVIDER
EMBEDDING_MODEL
```

Nunca:

```text
VITE_ANTHROPIC_API_KEY
VITE_OPENAI_API_KEY
```

Qualquer variável enviada ao frontend é potencialmente pública.

---

# 49. PROMPTS

Prompts importantes deverão ser versionados no Git.

Não ficar escondidos em strings espalhadas.

Exemplo:

```text
/prompts/reflection/system-v1.md
/prompts/reflection/plan-v1.md
/prompts/memory/extract-v1.md
/prompts/author-profile/analyze-v1.md
```

Cada geração deverá registrar:

```text
prompt_version
model
created_at
```

---

# 50. SAÍDAS ESTRUTURADAS

Quando a IA produzir:

- memória;
- conflito;
- perfil;
- plano;
- classificação

ela deverá retornar formato estruturado validável.

Exemplo:

```json
{
  "theme": "...",
  "confidence": 0.86,
  "evidence": [...]
}
```

Nunca depender apenas de parsing de texto livre.

---

# 51. O QUE NÃO ARMAZENAR

Não tentar armazenar raciocínio interno privado do modelo.

Armazenar:

- decisão;
- resumo;
- plano;
- evidências;
- referências;
- resultado.

Não:

# CADEIA INTERNA DE PENSAMENTO.

---

# 52. MOTOR DE CRIAÇÃO DE REFLEXÕES

Pipeline:

```text
ETAPA 1
Reflexão externa

↓

ETAPA 2
Comentário pessoal

↓

ETAPA 3
Investigação da memória

↓

ETAPA 4
Possíveis conflitos

↓

ETAPA 5
Plano da reflexão

↓

ETAPA 6
Geração

↓

ETAPA 7
Revisão humana

↓

ETAPA 8
Aprovação

↓

ETAPA 9
Incorporação opcional à memória
```

---

# 53. CONTEXT PACK

Antes de gerar uma reflexão, criar internamente:

```text
CURRENT_INPUT
PERSONAL_COMMENT
AUTHOR_PROFILE
RELEVANT_MEMORIES
SOURCE_EXCERPTS
CONFLICTS
USER_INSTRUCTIONS
```

Esse conjunto será denominado:

# CONTEXT PACK.

O LLM recebe o Context Pack.

Não toda a Biblioteca.

---

# 54. HOME

Página inicial consumirá dados derivados:

- documentos;
- processamento;
- memórias;
- perfil;
- reflexões;
- atividades.

Não executar análises pesadas simplesmente para abrir o dashboard.

---

# 55. REALTIME

Usar somente onde traz valor.

Principal aplicação:

# STATUS DE PROCESSAMENTO.

Exemplo:

```text
uploaded
↓
processing
↓
embedding
↓
completed
```

A tela poderá atualizar automaticamente.

---

# 56. CACHE

Consultas repetitivas como:

- categorias;
- contadores;
- resumo do perfil

podem ser cacheadas conforme o framework permitir.

Evitar cache de dados que precisam refletir atualização imediata sem estratégia de invalidação.

---

# 57. AUDITORIA

## `audit_events`

```text
id
owner_id
event_type
entity_type
entity_id
metadata
created_at
```

Exemplos:

```text
document_uploaded
document_processed
document_deleted
memory_corrected
reflection_generated
reflection_approved
reflection_incorporated
```

---

# 58. PRIVACIDADE

Como o sistema conterá material pessoal, o padrão será:

# PRIVADO POR PADRÃO.

Isso inclui:

- biblioteca;
- reflexões;
- arquivos;
- embeddings;
- memória;
- perfil;
- logs.

---

# 59. PRINCÍPIO DE MENOR PRIVILÉGIO

Frontend:

```text
publishable key
+
JWT do usuário
+
RLS
```

Backend privilegiado:

```text
secret key
```

somente quando realmente necessário.

---

# 60. STORAGE

Não alterar diretamente tabelas internas do schema `storage`.

Supabase recomenda utilizar sua API de Storage para operações de arquivo; editar diretamente os metadados pode deixar objetos inconsistentes.

---

# 61. GITHUB

Branch principal:

```text
main
```

Desenvolvimento:

```text
feature/*
fix/*
chore/*
```

---

# 62. PROTEÇÃO DA MAIN

Quando o repositório estiver operacional:

- exigir PR;
- exigir CI verde;
- impedir force push;
- habilitar secret scanning quando disponível;
- bloquear merge com falhas críticas.

GitHub Rulesets permite exigir PR, status checks e bloquear force push, entre outras proteções.

---

# 63. CI

GitHub Actions deverá executar pelo menos:

```text
install
typecheck
lint
tests
build
```

Posteriormente:

```text
database tests
RLS tests
integration tests
e2e tests
```

---

# 64. DEPLOY DO SUPABASE

Produção deverá evoluir para:

```text
merge main
↓
CI
↓
migrations
↓
functions
↓
production
```

Supabase recomenda CI/CD para migrations de produção e documenta GitHub Actions para esse fluxo.

---

# 65. LOVABLE E PUBLICAÇÃO

Importante:

# PUSH NO GITHUB NÃO SIGNIFICA NECESSARIAMENTE PUBLICAÇÃO NO LOVABLE.

Lovable publica snapshots.

Mudanças posteriores precisam ser republicadas/atualizadas.

---

# 66. CLAUDE CODE — MEMÓRIA DO PROJETO

Criar na raiz:

# `CLAUDE.md`

Deverá registrar:

- propósito do aplicativo;
- arquitetura;
- comandos;
- padrões;
- regras de banco;
- regras de segurança;
- responsabilidades Lovable/Claude/Supabase;
- definição de pronto.

Claude Code oferece memória de projeto via `CLAUDE.md`; a própria documentação recomenda guardar comandos importantes, convenções e padrões arquiteturais nesse arquivo.

---

# 67. DOCUMENTAÇÃO OPERACIONAL

Manter:

## `docs/PROJECT_STATE.md`

Estado atual.

## `docs/ROADMAP.md`

Próximas etapas.

## `docs/DECISIONS.md`

Decisões arquiteturais.

## `docs/DATA_MODEL.md`

Modelo de dados.

## `docs/SECURITY.md`

RLS, permissões e secrets.

---

# 68. CLAUDE CODE — SEGURANÇA

Nunca iniciar Claude Code com:

```text
--dangerously-skip-permissions
```

como prática normal.

Operações destrutivas deverão continuar exigindo aprovação.

Claude Code oferece modos de permissão inclusive `plan`, `acceptEdits` e modos mais permissivos; a configuração deve equilibrar autonomia e proteção.

---

# 69. MCP

Quando disponível, Claude Code poderá conectar ferramentas via MCP para:

- GitHub;
- Supabase;
- browser;
- documentação.

MCP é o protocolo suportado pela Anthropic para disponibilizar ferramentas e fontes externas ao agente.

Não conceder permissões mais amplas que o necessário.

---

# 70. FASES DE IMPLEMENTAÇÃO

## FASE 0 — FUNDAÇÃO

- criar projeto Lovable;
- GitHub;
- Supabase;
- Claude Code;
- documentação;
- CI;
- design system inicial.

## FASE 1 — AUTH + APP SHELL

- login;
- sessão;
- proteção de rotas;
- navegação;
- Home vazia.

## FASE 2 — BIBLIOTECA

- tabela;
- Storage;
- upload;
- organização;
- busca simples;
- detalhe do documento.

## FASE 3 — INGESTÃO

- extração;
- sections;
- chunks;
- jobs;
- status.

## FASE 4 — RAG

- embeddings;
- FTS;
- busca híbrida;
- evidências.

## FASE 5 — MEMÓRIA

- memory_items;
- evidence;
- relations.

## FASE 6 — MEU CÉREBRO

- traits;
- profile;
- evidências;
- feedback.

## FASE 7 — REFLEXÕES

- fluxo de sete etapas;
- retrieval;
- conflitos;
- plano;
- geração;
- revisão.

## FASE 8 — APRENDIZADO

- comparação IA × usuário;
- feedback;
- atualização de perfil.

## FASE 9 — HARDENING

- testes;
- observabilidade;
- segurança;
- desempenho;
- recuperação de falhas.

---

# 71. PRIMEIRO VERTICAL SLICE

Não construir 50% de cada módulo.

Construir primeiro uma cadeia completa simples:

```text
LOGIN
↓
UPLOAD TXT
↓
ARMAZENAR
↓
PROCESSAR
↓
CRIAR CHUNKS
↓
BUSCAR
↓
MOSTRAR RESULTADO COM FONTE
```

Somente então ampliar formatos.

Essa abordagem prova a arquitetura.

---

# 72. SEGUNDO VERTICAL SLICE

```text
REFLEXÃO EXTERNA
↓
COMENTÁRIO
↓
BUSCA NA MEMÓRIA
↓
GERAÇÃO
↓
EDIÇÃO
↓
APROVAÇÃO
```

---

# 73. TESTES OBRIGATÓRIOS

Cada módulo deverá possuir testes compatíveis com seu risco.

Particularmente importantes:

- login;
- RLS;
- isolamento entre usuários;
- upload;
- acesso aos arquivos;
- processamento;
- recuperação;
- proveniência;
- incorporação à memória;
- deleção.

---

# 74. CRITÉRIO DE PRONTO

Nenhuma tarefa é “pronta” simplesmente porque a interface aparece.

Uma função estará pronta quando:

```text
UI funciona
+
dados são persistidos
+
RLS protege
+
erros são tratados
+
estado de loading existe
+
testes passam
+
build passa
+
documentação foi atualizada
```

---

# 75. FONTE DE VERDADE POR DOMÍNIO

```text
Código
→ GitHub

Schema
→ migrations do GitHub

Dados
→ Supabase

Arquivos
→ Supabase Storage

Segredos
→ Supabase Secrets / ambiente seguro

UI
→ código GitHub, produzido/refinado via Lovable

Regras arquiteturais
→ docs + CLAUDE.md

Implementação
→ Claude Code

Publicação
→ snapshot Lovable
```

---

# 76. VISÃO FINAL

A arquitetura do Memória Reflexiva não deverá resultar em:

# “UM CHATBOT COM MEUS PDFs.”

Deverá resultar em:

```text
ACERVO ORIGINAL
        ↓
ESTRUTURA DOCUMENTAL
        ↓
MEMÓRIA RASTREÁVEL
        ↓
PERFIL AUTORAL COM EVIDÊNCIAS
        ↓
RECUPERAÇÃO CONTEXTUAL
        ↓
INTELIGÊNCIA PERSONALIZADA
        ↓
REFLEXÃO ASSISTIDA
        ↓
REVISÃO HUMANA
        ↓
NOVA MEMÓRIA APROVADA
```

O usuário permanece:

# A AUTORIDADE FINAL.

A IA funciona como:

# MEMÓRIA + INVESTIGAÇÃO + ASSOCIAÇÃO + ASSISTÊNCIA À CRIAÇÃO.
