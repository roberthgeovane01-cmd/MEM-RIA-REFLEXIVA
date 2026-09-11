# MR-04 — Adicionar Conteúdo

> Entrada de arquivos e textos, metadados e início do processamento.
> Fonte original: `04_Adicionar_Conteudo.docx`. Status: especificação funcional para construção. Versão 1.0.

## 1. Papel desta página

Adicionar Conteúdo é o ponto de entrada da memória. Sua responsabilidade é receber materiais com o mínimo de atrito, coletar os metadados necessários para interpretar corretamente a fonte e iniciar o processamento sem alterar o original.

## 2. Formas de entrada no MVP

- Upload de PDF, DOCX e TXT.
- Colar ou escrever texto diretamente.
- Adicionar relato.
- Adicionar carta.
- Adicionar reflexão pessoal.
- Entrada em lote pode ficar para fase posterior.

## 3. Campos e metadados

- Título: obrigatório ou sugerido automaticamente e confirmado pelo usuário.
- Tipo de conteúdo.
- Autoria/origem: "escrito por mim", "recebido de alguém", "referência externa" etc.
- Data do conteúdo, quando conhecida.
- Categoria.
- Tags opcionais.
- Projeto/coleção opcional.
- Observação contextual opcional.
- Arquivo ou texto.

## 4. Validação antes do envio

- Formato permitido.
- Tamanho máximo definido pela infraestrutura.
- Arquivo legível e não vazio.
- Campos obrigatórios preenchidos.
- Detecção opcional de duplicidade por hash e título.
- Aviso caso o usuário marque como autoral um documento cuja origem pareça externa; não bloquear, apenas pedir confirmação quando apropriado.

## 5. Processo após confirmação

1. Criar registro da fonte.
2. Salvar original em armazenamento privado.
3. Registrar hash e metadados técnicos.
4. Colocar documento na fila de processamento.
5. Extrair texto e estrutura.
6. Criar segmentos mantendo capítulo/página/posição.
7. Indexar para busca.
8. Extrair memórias e temas conforme regras.
9. Atualizar status e notificar dentro do aplicativo.

## 6. Processamento não deve bloquear a interface

Depois que o upload seguro terminar, o usuário deve poder sair da página. A análise pode continuar como tarefa de backend. A Biblioteca mostra o andamento. Isso evita telas presas e permite processar documentos grandes de forma confiável.

## Mapa de conexões da página

| Item                    | Especificação                                            |
| ----------------------- | -------------------------------------------------------- |
| Chega a esta página por | Biblioteca; Início                                       |
| Pode sair para          | Biblioteca; Detalhe do Documento após criação            |
| Lê / consulta           | Conta, categorias e limites de upload                    |
| Cria / altera           | Fonte, arquivo original, metadados, job de processamento |

## Estados, mensagens e exceções

| Estado / situação     | Comportamento esperado                                        |
| --------------------- | ------------------------------------------------------------- |
| Selecionando          | Usuário ainda escolhe tipo e arquivo.                         |
| Enviando              | Exibir porcentagem real do upload quando disponível.          |
| Upload concluído      | Confirmar preservação do arquivo e início da análise.         |
| Analisando            | Página pode fechar; status segue na Biblioteca.               |
| Duplicidade provável  | Permitir cancelar, manter ambos ou revisar.                   |
| Formato não suportado | Explicar formatos aceitos.                                    |
| Falha de upload       | Não criar fonte incompleta silenciosamente; permitir repetir. |
| Falha de análise      | Original continua disponível e pode ser reprocessado.         |

## 8. Integrações necessárias

- Armazenamento privado.
- Banco de fontes/metadados.
- Fila de jobs.
- Extratores de texto.
- Serviço de IA para análise posterior.
- Busca/indexação.

## Critérios de aceite

- [ ] Upload e texto digitado criam itens válidos na Biblioteca.
- [ ] Original permanece recuperável mesmo se análise falhar.
- [ ] Usuário consegue sair após upload sem perder o job.
- [ ] Metadados de autoria/origem acompanham o documento.
- [ ] Duplicidades e formatos inválidos têm tratamento explícito.
- [ ] Status da Biblioteca reflete corretamente cada etapa.

## Anexo de implementação — contrato funcional

| Item            | Especificação                                         |
| --------------- | ----------------------------------------------------- |
| Entrada         | arquivo ou texto + metadados.                         |
| Saída imediata  | fonte criada, original salvo e job registrado.        |
| Saída posterior | documento processado, índice e memórias.              |
| Serviços        | storage privado, banco, fila, extratores e indexação. |
| Permissão       | somente usuário autenticado pode criar em seu espaço. |

### Eventos e rastreabilidade

- `source_upload_started`
- `source_upload_completed`
- `source_created`
- `processing_queued`
- `processing_failed`
- `duplicate_warning_shown`

Regra: eventos devem registrar identificadores técnicos, tempos, status e erros necessários, mas não copiar textos pessoais completos para logs de observabilidade.

### Desempenho e comportamento em diferentes telas

- Upload grande deve ter progresso e não depender de manter a tela aberta após conclusão do envio.
- Processamento pesado é assíncrono.
- Validar tamanho e formato antes de enviar quando possível.
- A interface deve ser responsiva: em desktop pode usar barra lateral e áreas amplas; em telas menores, a navegação deve condensar sem retirar funções essenciais.

### Acessibilidade

- Área de upload precisa funcionar sem arrastar-e-soltar.
- Erros associados ao campo correto.
- Progresso possui texto/percentual.

### Escopo: MVP e evolução

- **MVP**: PDF/DOCX/TXT e texto digitado; metadados; fila de processamento.
- **Futuro**: imagens com OCR, áudio, vídeo, lote e conectores externos.

### Roteiro mínimo de testes

- [ ] Arquivo válido.
- [ ] Formato inválido.
- [ ] Arquivo vazio/corrompido.
- [ ] Upload interrompido.
- [ ] Duplicidade.
- [ ] Texto direto.
- [ ] Job falha depois do upload.
- [ ] Sair da página não cancela job.
