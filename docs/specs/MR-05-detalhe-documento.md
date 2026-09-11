# MR-05 — Detalhe do Documento

> Conteúdo original, resumo, memórias, metadados, proveniência e ações.
> Fonte original: `05_Detalhe_do_Documento.docx`. Status: especificação funcional para construção. Versão 1.0.

## 1. Papel desta página

O Detalhe do Documento é a ficha completa de uma fonte. Ele deve permitir conferir o original, entender o que a IA extraiu, corrigir metadados e navegar das interpretações de volta para a evidência. É a principal página de transparência entre Biblioteca e Cérebro.

## 2. Abas recomendadas

- Resumo.
- Conteúdo.
- Memórias.
- Anotações.
- Processamento/Origem, quando necessário.

## 3. Cabeçalho do documento

- Título e tipo.
- Capa/miniatura.
- Autoria/origem.
- Data/ano.
- Formato, tamanho e páginas.
- Status de processamento.
- Botões: abrir original, editar metadados, mais ações.

## 4. Aba Resumo

- Resumo gerado pela IA claramente identificado como IA.
- Temas principais.
- Palavras-chave.
- Estrutura detectada do documento.
- Alertas de qualidade de extração.
- Botão para reanalisar sem modificar o original.

## 5. Aba Conteúdo

- Visualização do texto extraído ou visualizador do arquivo.
- Navegação por capítulos/seções/páginas.
- Busca dentro do documento.
- Indicação da página/posição para garantir citação interna.
- Comparação com original quando extração tiver alertas.

## 6. Aba Memórias

- Lista de memórias derivadas da fonte.
- Tipo: ideia, tema, evento, citação curta, conceito, história, padrão etc.
- Trecho de evidência e posição.
- Confiança da extração quando aplicável.
- Ação "ver no contexto".
- Possibilidade de descartar uma memória incorreta sem apagar a fonte.

## 7. Aba Anotações

- Anotações privadas do usuário relacionadas ao documento.
- Data e edição.
- Opção futura de transformar anotação em nova reflexão ou memória autoral aprovada.

## Mapa de conexões da página

| Item                    | Especificação                                                       |
| ----------------------- | ------------------------------------------------------------------- |
| Chega a esta página por | Biblioteca; busca; evidência do Meu Cérebro                         |
| Pode sair para          | Biblioteca; Criar Reflexão; visualizador; evidência específica      |
| Lê / consulta           | Fonte, original, texto extraído, metadados, memórias, anotações     |
| Cria / altera           | Metadados, anotações, reprocessamento, descarte/correção de memória |

## Estados, mensagens e exceções

| Estado / situação | Comportamento esperado                                                             |
| ----------------- | ---------------------------------------------------------------------------------- |
| Ainda processando | Mostrar cabeçalho e original; abas dependentes ficam com status.                   |
| Processado        | Todas as áreas disponíveis.                                                        |
| Extração parcial  | Exibir alerta e manter original acessível.                                         |
| Sem memórias      | Explicar que nenhuma memória foi extraída ou que a análise ainda não ocorreu.      |
| Reprocessando     | Manter versão anterior identificada até nova análise concluir.                     |
| Fonte excluída    | Não permitir links órfãos; dependências devem ser tratadas no momento da exclusão. |

## 9. Integrações necessárias

- Biblioteca/metadados.
- Armazenamento do original.
- Processamento e versionamento de análise.
- Índice de memórias.
- Meu Cérebro para evidências.
- Criar Reflexão para uso como fonte.

## Critérios de aceite

- [ ] É possível verificar o original e a interpretação da IA separadamente.
- [ ] Toda memória mostra sua evidência e posição na fonte.
- [ ] Editar metadados não altera o arquivo original.
- [ ] Reprocessar não apaga silenciosamente a análise anterior antes de concluir.
- [ ] Usuário consegue usar o documento como fonte de uma nova reflexão.
- [ ] Alertas de extração são visíveis e compreensíveis.

## Anexo de implementação — contrato funcional

| Item      | Especificação                                                   |
| --------- | --------------------------------------------------------------- |
| Entrada   | id de uma fonte pertencente ao usuário.                         |
| Saída     | visualização e ações sobre fonte/análises.                      |
| Serviços  | storage, parser, memórias, anotações, versionamento de análise. |
| Entidades | fonte, versão de processamento, memória, anotação.              |
| Permissão | somente proprietário; ações destrutivas auditadas.              |

### Eventos e rastreabilidade

- `source_detail_viewed`
- `source_original_opened`
- `source_metadata_updated`
- `memory_evidence_opened`
- `source_reanalysis_requested`
- `memory_discarded`

Regra: eventos devem registrar identificadores técnicos, tempos, status e erros necessários, mas não copiar textos pessoais completos para logs de observabilidade.

### Desempenho e comportamento em diferentes telas

- Carregar cabeçalho primeiro; abas pesadas sob demanda.
- Conteúdo longo deve usar paginação/virtualização quando necessário.
- Visualizador do original não deve bloquear resumo e metadados.
- A interface deve ser responsiva: em desktop pode usar barra lateral e áreas amplas; em telas menores, a navegação deve condensar sem retirar funções essenciais.

### Acessibilidade

- Abas com semântica correta.
- Trechos de evidência navegáveis pelo teclado.
- Visualizador deve oferecer alternativa textual quando possível.

### Escopo: MVP e evolução

- **MVP**: resumo, conteúdo, memórias, metadados, anotações simples, reprocessar.
- **Futuro**: comparação visual original x extração e comentários avançados.

### Roteiro mínimo de testes

- [ ] Fonte processando.
- [ ] Processado com sucesso.
- [ ] Extração parcial.
- [ ] Memória abre trecho correto.
- [ ] Editar metadados.
- [ ] Reprocessar.
- [ ] Excluir e validar dependências.
