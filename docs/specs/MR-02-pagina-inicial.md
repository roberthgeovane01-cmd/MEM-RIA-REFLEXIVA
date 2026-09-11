# MR-02 — Página Inicial

> Painel geral, atalhos e continuidade de trabalho.
> Fonte original: `02_Pagina_Inicial.docx`. Status: especificação funcional para construção. Versão 1.0.

## 1. Papel desta página

A Página Inicial deve responder rapidamente a três perguntas: "o que existe no meu aplicativo?", "o que está acontecendo agora?" e "qual é o próximo passo que posso tomar?". Ela não substitui as outras páginas; funciona como um painel de orientação e continuidade.

## 2. Blocos obrigatórios

- Saudação personalizada.
- Resumo da Biblioteca: total de itens, categorias e processamentos pendentes.
- Resumo do Meu Cérebro: quantidade/percentual de material analisado e última atualização.
- Resumo de Minhas Reflexões: concluídas, em revisão e rascunhos.
- Ações rápidas: adicionar conteúdo, criar reflexão, abrir Meu Cérebro, ver reflexões.
- Atividades recentes.
- Avisos relevantes de processamento ou falhas.
- Busca global opcional no topo.

## 3. Lógica dos indicadores

- Nunca mostrar porcentagem de "memória analisada" sem uma definição calculável. Exemplo: itens processados elegíveis / itens totais elegíveis.
- Indicadores devem abrir a página de origem quando clicados.
- Contagens devem respeitar o usuário autenticado e ser atualizadas após ações relevantes.
- Atividade recente deve priorizar eventos úteis: arquivo concluído, reflexão retomável, análise do cérebro atualizada.

## 4. Ações rápidas e destinos

| Item                  | Especificação                                                     |
| --------------------- | ----------------------------------------------------------------- |
| Adicionar conteúdo    | Abre Adicionar Conteúdo.                                          |
| Criar nova reflexão   | Abre o primeiro passo de Criar Reflexão.                          |
| Consultar meu cérebro | Abre Meu Cérebro na Visão Geral.                                  |
| Ver minhas reflexões  | Abre Minhas Reflexões, ordenadas por mais recentes.               |
| Abrir item recente    | Abre Detalhe do Documento ou editor da reflexão, conforme o tipo. |

## Mapa de conexões da página

| Item                    | Especificação                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Chega a esta página por | Login bem-sucedido; navegação global                                                   |
| Pode sair para          | Todos os módulos principais                                                            |
| Lê / consulta           | Contagens da biblioteca, status de processamento, perfil autoral, reflexões, atividade |
| Cria / altera           | Preferencialmente nada; pode registrar apenas eventos de visualização/atalhos          |

## Estados, mensagens e exceções

| Estado / situação             | Comportamento esperado                                                    |
| ----------------------------- | ------------------------------------------------------------------------- |
| Conta nova                    | Mostrar estado vazio orientativo com primeiro passo "Adicionar conteúdo". |
| Há processamento em andamento | Mostrar progresso agregado e link para Biblioteca.                        |
| Falha de processamento        | Mostrar aviso resumido, sem interromper o restante do painel.             |
| Sem reflexões                 | Convidar a criar a primeira reflexão.                                     |
| Dados carregando              | Usar skeletons; não mostrar zeros falsos.                                 |
| Erro parcial                  | Manter blocos disponíveis e identificar somente o bloco indisponível.     |

## 6. Integrações necessárias

- Banco de dados para agregações.
- Pipeline de processamento para status.
- Módulo de perfil autoral.
- Módulo de reflexões.
- Busca global, quando implementada.

## 7. Regras de UX

- Evitar excesso de métricas.
- Priorizar ações e continuidade, não gamificação.
- Não exibir análises pessoais sensíveis em notificações fora do app.
- Todos os cards devem ter destino claro.
- Página deve carregar mesmo se um serviço secundário estiver indisponível.

## Critérios de aceite

- [ ] Painel apresenta dados reais e atualizados do usuário.
- [ ] Cada card leva ao módulo correto.
- [ ] Conta nova possui orientação clara sem telas vazias confusas.
- [ ] Falha de um resumo não derruba a página inteira.
- [ ] Ações rápidas funcionam em no máximo um clique a partir do painel.

## Anexo de implementação — contrato funcional

| Item            | Especificação                                                  |
| --------------- | -------------------------------------------------------------- |
| Entrada         | usuário autenticado e resumos agregados.                       |
| Saída           | navegação para módulos; nenhum conteúdo autoral é criado aqui. |
| Serviços        | agregações da Biblioteca, jobs, perfil autoral e reflexões.    |
| Dados temporais | últimas atividades e última atualização de cada módulo.        |
| Permissão       | somente dados do usuário autenticado.                          |

### Eventos e rastreabilidade

- `home_viewed`
- `quick_action_clicked`
- `recent_item_opened`
- `processing_warning_opened`

Regra: eventos devem registrar identificadores técnicos, tempos, status e erros necessários, mas não copiar textos pessoais completos para logs de observabilidade.

### Desempenho e comportamento em diferentes telas

- Carregar primeiro a estrutura e depois blocos independentes.
- Falha de um card não deve impedir outros cards.
- Contagens podem usar consultas agregadas/cache curto, nunca números inventados.
- A interface deve ser responsiva: em desktop pode usar barra lateral e áreas amplas; em telas menores, a navegação deve condensar sem retirar funções essenciais.

### Acessibilidade

- Cards devem ser botões/links semanticamente corretos.
- Indicadores não podem depender apenas de cor.
- Skeleton deve ser anunciado como carregamento sem prender leitor de tela.

### Escopo: MVP e evolução

- **MVP**: resumo Biblioteca, Cérebro, Reflexões, ações rápidas e atividade recente.
- **Futuro**: notificações inteligentes e widgets personalizáveis.

### Roteiro mínimo de testes

- [ ] Conta nova.
- [ ] Conta com milhares de itens.
- [ ] Job em processamento.
- [ ] Erro parcial de um serviço.
- [ ] Atalhos levam ao destino correto.
- [ ] Contagens atualizam após adicionar/excluir.
