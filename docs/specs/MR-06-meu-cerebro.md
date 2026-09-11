# MR-06 — Meu Cérebro

> Perfil autoral, padrões, temas, evidências, confiança e correção.
> Fonte original: `06_Meu_Cerebro.docx`. Status: especificação funcional para construção. Versão 1.0.

## 1. Papel desta página

Meu Cérebro é a representação revisável do que a IA aprendeu a partir do acervo autoral. Ele não é um diagnóstico sobre a pessoa e não deve apresentar inferências como verdades absolutas. Sua função é tornar visíveis padrões de escrita e pensamento que podem ser usados como contexto para futuras reflexões.

## 2. Pré-condição de análise

Somente fontes elegíveis devem alimentar o perfil autoral. Por padrão, textos marcados como "escritos por mim" e reflexões finais aprovadas podem ser usados. **Conteúdo externo serve como referência de conhecimento, não como evidência de estilo ou crença do usuário.**

## 3. Abas recomendadas

- Visão Geral.
- Estilo.
- Temas.
- Conceitos.
- Histórias/Experiências.
- Método de reflexão.
- Evolução temporal.
- Evidências e correções.

## 4. Estrutura de um insight do Cérebro

| Item                | Especificação                                                                     |
| ------------------- | --------------------------------------------------------------------------------- |
| Afirmação           | Descrição clara e não absoluta do padrão observado.                               |
| Categoria           | Estilo, tema, conceito, estrutura, história, evolução etc.                        |
| Confiança           | Baixa, média ou alta; calculada a partir de quantidade/diversidade de evidências. |
| Evidências          | Trechos e fontes que sustentam a interpretação.                                   |
| Exceções            | Fontes que contradizem ou limitam a generalização.                                |
| Período             | Quando o padrão foi observado.                                                    |
| Feedback do usuário | Concordo, parcial, discordo, correção escrita.                                    |
| Versão              | Perfil e insight devem ser versionáveis.                                          |

## 5. Funções principais

- Explorar insights por categoria.
- Abrir evidências e voltar à fonte original.
- Confirmar, discordar ou corrigir interpretação.
- Marcar insight como importante para o estilo de escrita.
- Visualizar mudanças ao longo do tempo.
- Recalcular perfil após entrada de novo material relevante.
- Comparar versão atual com versões anteriores.

## 6. Como o perfil participa da geração

O Motor de Reflexões não deve enviar todo o Meu Cérebro para cada geração. Ele seleciona apenas os elementos pertinentes ao objetivo atual: por exemplo, estrutura narrativa, tom, padrões de desenvolvimento e temas relacionados. Essa seleção deve ser registrada no contexto da reflexão.

## Mapa de conexões da página

| Item                    | Especificação                                               |
| ----------------------- | ----------------------------------------------------------- |
| Chega a esta página por | Início; navegação; links de evidência                       |
| Pode sair para          | Detalhe do Documento; Criar Reflexão; versões do perfil     |
| Lê / consulta           | Fontes autorais processadas, memórias, feedbacks, histórico |
| Cria / altera           | Feedbacks, correções, perfil e versões de perfil            |

## Estados, mensagens e exceções

| Estado / situação                | Comportamento esperado                                              |
| -------------------------------- | ------------------------------------------------------------------- |
| Pouco material                   | Mostrar que ainda não há base suficiente; evitar conclusões fortes. |
| Análise em atualização           | Manter perfil anterior disponível com indicador de atualização.     |
| Insight com baixa confiança      | Apresentar linguagem cautelosa e evidências.                        |
| Insight contestado               | Não usar como regra forte de geração até reconciliar.               |
| Evidência removida               | Recalcular ou reduzir confiança do insight.                         |
| Sem evolução temporal suficiente | Não fabricar linha do tempo; informar ausência de base.             |

## 8. Integrações necessárias

- Memória/índice de evidências.
- Biblioteca e Detalhe do Documento.
- Serviço de IA para síntese do perfil.
- Versionamento.
- Motor de Reflexões.
- Feedback do usuário.

## 9. Regras críticas de IA

- Não inferir traços pessoais sensíveis sem necessidade do produto.
- Não transformar presença de um tema em crença do usuário automaticamente.
- Separar estilo linguístico de posição intelectual.
- Preferir evidências múltiplas e diversas.
- Permitir exceções e mudança de opinião.
- Explicar incerteza.
- Nunca ocultar a origem de uma conclusão.

## Critérios de aceite

- [ ] Cada insight possui evidências rastreáveis.
- [ ] Usuário pode discordar e corrigir.
- [ ] Conteúdo externo não contamina perfil autoral.
- [ ] O perfil possui versionamento e data de atualização.
- [ ] Gerações registram quais aspectos do perfil foram utilizados.
- [ ] Com pouco material, o sistema evita afirmações excessivas.

## Anexo de implementação — contrato funcional

| Item      | Especificação                                                     |
| --------- | ----------------------------------------------------------------- |
| Entrada   | fontes autorais elegíveis + memórias + feedbacks.                 |
| Saída     | perfil autoral versionado e insights rastreáveis.                 |
| Serviços  | recuperação de evidências, IA analítica, versionamento, feedback. |
| Entidades | perfil, insight, evidência, exceção, confiança, feedback.         |
| Permissão | privado; nada do perfil é público por padrão.                     |

### Eventos e rastreabilidade

- `brain_viewed`
- `insight_opened`
- `evidence_opened`
- `insight_confirmed`
- `insight_disputed`
- `profile_rebuild_requested`

Regra: eventos devem registrar identificadores técnicos, tempos, status e erros necessários, mas não copiar textos pessoais completos para logs de observabilidade.

### Desempenho e comportamento em diferentes telas

- Perfil consolidado deve ser pré-calculado em background, não refeito a cada visita.
- Abrir evidências pode buscar trechos sob demanda.
- Rebuild deve ser job assíncrono.
- A interface deve ser responsiva: em desktop pode usar barra lateral e áreas amplas; em telas menores, a navegação deve condensar sem retirar funções essenciais.

### Acessibilidade

- Confiança expressa em texto além de gráfico/cor.
- Evidências listadas de modo navegável.
- Correções podem ser feitas sem depender de gestos complexos.

### Escopo: MVP e evolução

- **MVP**: visão geral, estilo, temas, método, evidências, confiança e feedback.
- **Futuro**: linha do tempo rica, mapas de conceitos e comparação entre períodos.

### Roteiro mínimo de testes

- [ ] Poucas fontes.
- [ ] Muitas fontes.
- [ ] Insight com evidências múltiplas.
- [ ] Insight contestado.
- [ ] Excluir evidência reduz confiança.
- [ ] Conteúdo externo não influencia estilo.
- [ ] Rebuild cria nova versão.
