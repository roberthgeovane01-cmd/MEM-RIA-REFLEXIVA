# MR-00 — Arquitetura Geral do Aplicativo

> Mapa funcional, princípios, módulos, dados e integrações globais.
> Fonte original: `00_Arquitetura_Geral_Memoria_Reflexiva.docx`. Status: especificação funcional para construção. Versão 1.0.
> Finalidade: referência única para design, programação, banco de dados, inteligência artificial, testes e validação do produto.

## 1. Propósito do produto

Memória Reflexiva é um aplicativo pessoal que transforma um acervo de textos e documentos em uma memória pesquisável e, depois, utiliza essa memória para apoiar a criação de novas reflexões. O usuário continua sendo o autor; a inteligência artificial atua como organizadora, pesquisadora, associadora de memórias e assistente de escrita.

A arquitetura deve separar rigorosamente quatro coisas: **arquivo original**, **memória extraída**, **interpretação da IA** e **texto final aprovado pelo usuário**. Essa separação evita que inferências sejam confundidas com fatos e impede que textos gerados pela própria IA contaminem automaticamente o perfil autoral.

## 2. Módulos do aplicativo

1. Login e acesso seguro
2. Início / painel geral
3. Biblioteca
4. Adicionar conteúdo
5. Detalhe do documento
6. Meu Cérebro
7. Criar Reflexão
8. Minhas Reflexões
9. Configurações

## 3. Fluxo principal do usuário

1. O usuário entra no aplicativo.
2. Adiciona materiais à Biblioteca.
3. O sistema preserva o original e inicia o processamento.
4. O conteúdo é extraído, organizado, segmentado e indexado.
5. A IA identifica temas, conceitos, trechos relevantes e padrões, sempre mantendo a origem.
6. Meu Cérebro consolida interpretações sobre estilo e metodologia com evidências e nível de confiança.
7. Em Criar Reflexão, o usuário fornece uma reflexão externa e seu comentário pessoal.
8. O sistema recupera memórias relevantes e aponta possíveis conflitos.
9. O usuário aprova ou ajusta um plano de reflexão.
10. A IA gera um novo texto; o usuário revisa, aprova e, se quiser, incorpora o texto final à memória.

## 4. Princípios funcionais obrigatórios

- **Autoria humana**: nenhuma reflexão é considerada autoral apenas porque foi gerada pelo sistema.
- **Proveniência**: toda memória recuperada deve apontar para o documento e trecho de origem.
- **Reversibilidade**: interpretações da IA podem ser corrigidas pelo usuário.
- **Preservação**: o arquivo original nunca é sobrescrito por processamento ou edição de metadados.
- **Privacidade por padrão**: todos os dados pessoais são privados, salvo compartilhamento explícito futuro.
- **Memória seletiva**: o cérebro consulta apenas o contexto relevante para cada tarefa, não o acervo inteiro.
- **Aprendizado controlado**: somente conteúdo aprovado pode influenciar o perfil autoral como nova evidência.
- **Versionamento**: reflexões, perfil autoral e análises importantes devem guardar histórico.

## 5. Entidades conceituais de dados

Os nomes abaixo são conceituais; a equipe técnica pode adaptá-los (ver `docs/DATA_MODEL.md` para os nomes técnicos reais). O importante é que as responsabilidades permaneçam separadas.

| Item                   | Especificação                                                        |
| ---------------------- | -------------------------------------------------------------------- |
| Usuário                | Conta, preferências, configurações e permissões.                     |
| Fonte da Biblioteca    | Registro do item que o usuário adicionou.                            |
| Arquivo original       | Objeto preservado em armazenamento privado.                          |
| Documento processado   | Texto e estrutura extraídos do arquivo.                              |
| Trecho / chunk         | Unidade recuperável com posição e proveniência.                      |
| Memória                | Ideia, tema, conceito, história ou evidência derivada de fontes.     |
| Relação entre memórias | Conexão entre conceitos, temas, eventos ou textos.                   |
| Perfil autoral         | Conjunto versionado de interpretações sobre estilo e método.         |
| Evidência de perfil    | Trechos que sustentam uma interpretação do perfil autoral.           |
| Reflexão               | Projeto de reflexão com entradas, contexto, plano, versões e status. |
| Feedback               | Correção, aceite, rejeição ou edição feita pelo usuário.             |
| Evento de auditoria    | Registro de ações sensíveis, processamento e alterações relevantes.  |

## 6. Serviços lógicos necessários

Ainda não é necessário escolher fornecedores. O aplicativo, porém, precisará destas capacidades lógicas para funcionar:

- Autenticação e sessão
- Banco de dados relacional
- Armazenamento privado de arquivos
- Extração de texto de PDF/DOCX/TXT e, futuramente, OCR
- Processamento assíncrono de documentos
- Embeddings e busca vetorial
- Busca textual e por metadados
- Reranking / seleção de contexto relevante
- Modelo de linguagem para análise e geração
- Versionamento e auditoria
- Monitoramento de erros e jobs
- Exportação de conteúdo

## 7. Estados globais de processamento

- **Recebido**: arquivo salvo, ainda não analisado.
- **Na fila**: aguardando processamento.
- **Processando**: extração/análise em andamento.
- **Processado**: disponível para busca e memória.
- **Processado com alertas**: utilizável, mas parte do conteúdo apresentou limitação.
- **Erro**: processamento interrompido; usuário pode tentar novamente.
- **Reprocessando**: uma nova análise foi solicitada sem substituir o original.

## 8. Regras de segurança e privacidade

- Todo dado deve ser vinculado ao usuário autenticado.
- Arquivos privados nunca devem possuir URL pública permanente.
- Segredos e credenciais não podem ficar no navegador.
- Ações destrutivas exigem confirmação explícita.
- Logs não devem gravar texto pessoal completo desnecessariamente.
- O usuário deve poder excluir arquivo, reflexão e conta, respeitando políticas de retenção.
- Uma falha de IA nunca pode liberar conteúdo de outro usuário.

## 9. Navegação global

A navegação principal deve privilegiar cinco destinos recorrentes: **Início, Biblioteca, Criar Reflexão, Meu Cérebro e Minhas Reflexões**. Configurações pode ficar no menu "Mais" ou no perfil. Em desktop, a mesma estrutura pode aparecer como barra lateral; em telas menores, como barra inferior.

## 10. Ordem recomendada de construção

1. Fundação: autenticação, conta, navegação e banco.
2. Biblioteca e upload.
3. Pipeline de processamento e estados.
4. Detalhe do documento e busca.
5. Memória recuperável e proveniência.
6. Meu Cérebro.
7. Criar Reflexão.
8. Minhas Reflexões e versionamento.
9. Configurações avançadas e integrações futuras.

## Critérios de aceite

- [ ] Todas as páginas descritas nos documentos MR-01 a MR-09 possuem responsabilidades claras e não duplicadas.
- [ ] Existe uma única definição de status para documentos e reflexões.
- [ ] A proveniência acompanha toda memória e todo contexto usado pela IA.
- [ ] Nenhum texto gerado pela IA entra na memória autoral sem aprovação explícita.
- [ ] A arquitetura permite trocar fornecedores de IA, armazenamento ou autenticação sem mudar a lógica do produto.

## 11. Contratos entre módulos

| Item                                   | Especificação                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Biblioteca → Processamento             | A fonte criada entrega id, arquivo e metadados; processamento devolve status, texto extraído e índice. |
| Processamento → Memória                | Trechos processados geram memórias sempre vinculadas à fonte/posição.                                  |
| Memória → Meu Cérebro                  | Somente fontes autorais elegíveis sustentam perfil; evidências e exceções acompanham cada insight.     |
| Memória + Cérebro → Criar Reflexão     | Recuperação monta contexto seletivo, registra fontes e aspectos do perfil utilizados.                  |
| Criar Reflexão → Minhas Reflexões      | Projeto, versões e status passam a ser gerenciados no histórico.                                       |
| Reflexão aprovada → Biblioteca/Memória | Somente após ação explícita a versão final torna-se nova fonte autoral.                                |
| Configurações → Todos                  | Preferências e regras de privacidade influenciam comportamento global.                                 |

## 12. Requisitos não funcionais globais

- Privacidade por padrão e isolamento rigoroso entre usuários.
- Jobs longos assíncronos e retomáveis.
- Idempotência em reprocessamento para evitar duplicação de memória.
- Versionamento de análises e reflexões.
- Observabilidade sem registrar conteúdo pessoal completo.
- Interface responsiva e acessível.
- Backups e recuperação de dados conforme a infraestrutura escolhida.
- Arquitetura desacoplada de um único fornecedor de IA.

## 13. Estratégia de testes do produto

- [ ] Testes unitários de regras de negócio.
- [ ] Testes de integração entre banco, storage, jobs e IA.
- [ ] Testes ponta a ponta dos fluxos principais.
- [ ] Testes de autorização para impedir acesso cruzado entre usuários.
- [ ] Testes de recuperação após falha de job.
- [ ] Testes com documentos pequenos, grandes, vazios e corrompidos.
- [ ] Testes de qualidade de recuperação de memórias.
- [ ] Testes que garantam que conteúdo externo não contamina perfil autoral.
- [ ] Testes de acessibilidade das páginas principais.
