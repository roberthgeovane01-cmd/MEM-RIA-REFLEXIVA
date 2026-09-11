# MR-08 — Minhas Reflexões

> Histórico, estados, versões, edição, exportação e incorporação.
> Fonte original: `08_Minhas_Reflexoes.docx`. Status: especificação funcional para construção. Versão 1.0.

## 1. Papel desta página

Minhas Reflexões é o arquivo de produção do usuário. Diferente da Biblioteca, que contém fontes de vários tipos, esta página acompanha o ciclo de vida das reflexões construídas no aplicativo: rascunho, revisão, aprovação, finalização e incorporação à memória.

## 2. Status recomendados

| Item        | Especificação                                                 |
| ----------- | ------------------------------------------------------------- |
| Rascunho    | Projeto iniciado, ainda incompleto.                           |
| Gerada      | A IA produziu uma versão, ainda sem revisão final.            |
| Em revisão  | Usuário está editando ou avaliando.                           |
| Aprovada    | Conteúdo aprovado pelo usuário.                               |
| Finalizada  | Versão considerada concluída; pode ser exportada.             |
| Incorporada | Versão final foi adicionada explicitamente à memória autoral. |
| Arquivada   | Mantida no histórico, fora do fluxo principal.                |

## 3. Componentes da página

- Abas/filtros por status.
- Busca por título, tema e conteúdo.
- Ordenação por data, título e última edição.
- Cards com título, data, tema, trecho e status.
- Menu de ações.
- Indicador de quantidade de versões.
- Atalho para continuar rascunho.

## 4. Ações disponíveis

- Abrir reflexão completa.
- Continuar edição.
- Ver histórico de versões.
- Duplicar como nova reflexão, preservando vínculo opcional.
- Exportar para formatos definidos.
- Incorporar à memória quando elegível.
- Retirar da memória sem apagar a reflexão, se a política permitir.
- Arquivar.
- Excluir com confirmação.

## 5. Histórico de versões

Cada versão relevante deve registrar autor da mudança (usuário ou IA), data e origem. O sistema deve permitir comparar pelo menos a versão gerada inicialmente com a versão final aprovada. Essa diferença é uma fonte valiosa para aperfeiçoar o perfil autoral, mas só deve ser utilizada como feedback controlado.

## 6. Exportação e compartilhamento

No MVP, exportação pode se limitar a copiar texto e baixar arquivo simples. PDF/DOCX podem ser adicionados conforme prioridade. Compartilhamento público por link deve ser tratado como recurso futuro e exigir controle explícito de privacidade.

## Mapa de conexões da página

| Item                    | Especificação                                                        |
| ----------------------- | -------------------------------------------------------------------- |
| Chega a esta página por | Início; navegação; conclusão de Criar Reflexão                       |
| Pode sair para          | Editor/Criar Reflexão; Biblioteca; Meu Cérebro                       |
| Lê / consulta           | Reflexões, versões, status, vínculos com memória                     |
| Cria / altera           | Status, novas versões, exportações, incorporação/retirada de memória |

## Estados, mensagens e exceções

| Estado / situação         | Comportamento esperado                                            |
| ------------------------- | ----------------------------------------------------------------- |
| Nenhuma reflexão          | Mostrar botão "Criar primeira reflexão".                          |
| Rascunho                  | Ação principal "Continuar".                                       |
| Gerada                    | Ação principal "Revisar".                                         |
| Aprovada                  | Ações "Finalizar", "Exportar" e "Incorporar".                     |
| Incorporada               | Mostrar vínculo com fonte criada na Biblioteca.                   |
| Fonte de memória removida | Reflexão continua existindo; status de incorporação é atualizado. |
| Exclusão                  | Confirmar; informar impacto se estiver incorporada à memória.     |

## 8. Integrações necessárias

- Motor de Reflexões.
- Versionamento.
- Biblioteca para incorporação.
- Meu Cérebro para feedback de edição.
- Exportação.
- Busca.

## Critérios de aceite

- [ ] Usuário encontra e retoma qualquer reflexão não excluída.
- [ ] Status reflete o ciclo real do conteúdo.
- [ ] Histórico de versões é acessível.
- [ ] Incorporação cria vínculo rastreável com a memória.
- [ ] Excluir/retirar conteúdo trata dependências de forma explícita.
- [ ] Busca e filtros funcionam em conjunto.

## Anexo de implementação — contrato funcional

| Item      | Especificação                                            |
| --------- | -------------------------------------------------------- |
| Entrada   | filtros, busca e ordenação.                              |
| Saída     | lista, edição, histórico e ações de ciclo de vida.       |
| Serviços  | reflexões, versões, busca, exportação e Biblioteca.      |
| Entidades | reflexão, versão, status, incorporação.                  |
| Permissão | somente proprietário; compartilhamento futuro explícito. |

### Eventos e rastreabilidade

- `reflections_viewed`
- `reflection_opened`
- `reflection_status_changed`
- `reflection_exported`
- `reflection_archived`
- `reflection_deleted`
- `reflection_incorporated`

Regra: eventos devem registrar identificadores técnicos, tempos, status e erros necessários, mas não copiar textos pessoais completos para logs de observabilidade.

### Desempenho e comportamento em diferentes telas

- Paginar lista.
- Carregar conteúdo completo apenas ao abrir.
- Exportações pesadas podem ser geradas em background.
- A interface deve ser responsiva: em desktop pode usar barra lateral e áreas amplas; em telas menores, a navegação deve condensar sem retirar funções essenciais.

### Acessibilidade

- Status textual.
- Ações do menu acessíveis por teclado.
- Histórico de versões com datas e autores de mudança.

### Escopo: MVP e evolução

- **MVP**: lista, busca, status, abrir/editar, versões, aprovar, finalizar e incorporar.
- **Futuro**: compartilhamento, coleções e estatísticas.

### Roteiro mínimo de testes

- [ ] Todos os status.
- [ ] Busca + filtro.
- [ ] Histórico.
- [ ] Duplicar.
- [ ] Exportar.
- [ ] Excluir reflexão incorporada.
- [ ] Retirar da memória sem apagar reflexão.
