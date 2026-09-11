# MR-03 — Biblioteca

> Acervo pessoal, busca, filtros, organização e gestão.
> Fonte original: `03_Pagina_Biblioteca.docx`. Status: especificação funcional para construção. Versão 1.0.

## 1. Papel desta página

A Biblioteca é a fonte primária do sistema. Tudo que o Cérebro e o Motor de Reflexões utilizarem
deve poder ser rastreado até uma fonte armazenada ou a uma entrada explicitamente criada pelo
usuário. A Biblioteca deve funcionar ao mesmo tempo como arquivo, catálogo e ponto de partida para
exploração.

## 2. Tipos de conteúdo

- Livro autoral.
- Reflexão pessoal.
- Carta.
- Relato.
- Mensagem ou texto curto.
- Documento de trabalho.
- Referência externa.
- Outro tipo configurável futuramente.

## 3. Componentes e controles

- Abas/filtros por categoria.
- Busca por título e conteúdo.
- Filtros por autoria, ano, tags, status, origem e formato.
- Ordenação por data de inclusão, data do conteúdo, título e relevância.
- Botão "Adicionar".
- Lista ou grade de itens.
- Status visível de processamento.
- Menu contextual por item.
- Seleção múltipla futura.
- Contagem de resultados.

## 4. Informações mínimas de cada item

| Item          | Especificação                                                     |
| ------------- | ----------------------------------------------------------------- |
| Identidade    | Título, tipo e miniatura/capa quando disponível.                  |
| Contexto      | Autor/origem, data/ano, categoria e tags principais.              |
| Arquivo       | Formato, tamanho e número aproximado de páginas quando aplicável. |
| Processamento | Status, alertas e data da última análise.                         |
| Autoria       | Marcação clara: autoral, externo ou desconhecido.                 |
| Privacidade   | Privado por padrão; compartilhamento futuro explícito.            |

## 5. Busca

A busca deve evoluir em camadas. No MVP, precisa localizar por título, metadados e texto
processado. A evolução natural é combinar busca textual, busca semântica e filtros. O usuário não
precisa saber qual tecnologia é usada: ele deve apenas encontrar resultados relevantes e poder
entender por que um item apareceu.

## 6. Ações por item

- Abrir Detalhe do Documento.
- Editar metadados sem alterar o arquivo original.
- Reprocessar análise.
- Alterar categoria e tags.
- Baixar original.
- Excluir com confirmação.
- Mover para coleção/pasta futura.
- Usar como fonte em uma nova reflexão.

## Mapa de conexões da página

| Item                    | Especificação                                                         |
| ----------------------- | --------------------------------------------------------------------- |
| Chega a esta página por | Início; navegação global; busca                                       |
| Pode sair para          | Adicionar Conteúdo; Detalhe do Documento; Criar Reflexão              |
| Lê / consulta           | Fontes, arquivos, metadados, status de processamento, índice de busca |
| Cria / altera           | Metadados, exclusões, pedidos de reprocessamento                      |

## Estados, mensagens e exceções

| Estado / situação | Comportamento esperado                                                      |
| ----------------- | --------------------------------------------------------------------------- |
| Biblioteca vazia  | Explicar propósito e mostrar botão principal "Adicionar primeiro conteúdo". |
| Item recebido     | Mostrar "Recebido" e permitir abrir metadados.                              |
| Processando       | Mostrar progresso/status sem bloquear o restante da biblioteca.             |
| Processado        | Disponibilizar busca por conteúdo e memórias.                               |
| Com alertas       | Mostrar selo e explicar limitação no detalhe.                               |
| Erro              | Permitir tentar novamente ou substituir arquivo.                            |
| Nenhum resultado  | Sugerir remover filtros ou usar termos diferentes.                          |

## 8. Integrações necessárias

- Armazenamento privado.
- Banco de metadados.
- Pipeline de ingestão.
- Busca textual/semântica.
- Sistema de permissões.
- Logs de auditoria para excluir/reprocessar.

## 9. Regras críticas

- Original imutável pelo processamento.
- Metadados editáveis ficam separados do arquivo original.
- Excluir uma fonte deve tratar dependências e memórias derivadas de forma previsível.
- Conteúdo externo nunca é marcado como autoria do usuário automaticamente.
- Resultados de busca devem preservar a proveniência.

## Critérios de aceite

- [ ] Usuário consegue adicionar, localizar, filtrar, abrir, editar metadados e excluir conteúdo.
- [ ] Status de processamento está sempre visível.
- [ ] Busca retorna apenas itens do usuário.
- [ ] Excluir um item exige confirmação e atualiza índices/memórias relacionadas.
- [ ] Um item externo não alimenta o perfil autoral como se fosse texto do usuário.
- [ ] A Biblioteca funciona com dezenas, centenas e depois milhares de itens sem perder organização.

## Anexo de implementação — contrato funcional

| Item      | Especificação                                                |
| --------- | ------------------------------------------------------------ |
| Entrada   | filtros, busca, ordenação e paginação.                       |
| Saída     | lista de fontes e ações de gestão.                           |
| Serviços  | metadados, busca, armazenamento, processamento e permissões. |
| Entidades | fonte, arquivo original, status, tags/categorias.            |
| Permissão | CRUD apenas sobre fontes do próprio usuário.                 |

### Eventos e rastreabilidade

- `library_viewed`
- `library_searched`
- `library_filter_changed`
- `source_opened`
- `source_deleted`
- `source_reprocess_requested`

Regra: eventos devem registrar identificadores técnicos, tempos, status e erros necessários, mas
não copiar textos pessoais completos para logs de observabilidade.

### Desempenho e comportamento em diferentes telas

- Paginar resultados; não carregar todo o acervo de uma vez.
- Busca deve ser cancelável quando o usuário digita novo termo.
- Miniaturas devem ser leves e carregadas sob demanda.
- A interface deve ser responsiva: em desktop pode usar barra lateral e áreas amplas; em telas
  menores, a navegação deve condensar sem retirar funções essenciais.

### Acessibilidade

- Filtros utilizáveis por teclado.
- Status tem texto além de cor.
- Menu contextual possui rótulo com o nome do item.

### Escopo: MVP e evolução

- **MVP**: lista, categorias, busca textual, filtros essenciais, status e CRUD de metadados.
- **Futuro**: coleções, seleção múltipla, busca híbrida avançada e compartilhamento.

### Roteiro mínimo de testes

- [ ] Biblioteca vazia.
- [ ] Paginação.
- [ ] Busca sem resultado.
- [ ] Filtro + ordenação combinados.
- [ ] Item processando/erro.
- [ ] Exclusão com dependências.
- [ ] Isolamento entre usuários.
