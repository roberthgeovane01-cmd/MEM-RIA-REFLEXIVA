# MR-01 — Página de Login

> Acesso, criação de sessão, recuperação e segurança.
> Fonte original: `01_Pagina_Login.docx`. Status: especificação funcional para construção. Versão 1.0.

## 1. Papel desta página

O Login é a porta de entrada do universo pessoal do usuário. Sua função é autenticar a identidade, criar uma sessão segura e encaminhar o usuário ao aplicativo sem expor conteúdo da Biblioteca antes da autenticação.

Na primeira versão, a experiência deve ser simples: e-mail e senha são suficientes. Login social pode ser incluído se reduzir complexidade operacional, mas não é requisito conceitual do produto.

## 2. Componentes visuais obrigatórios

- Marca "Memória Reflexiva" e frase curta de posicionamento.
- Campo de e-mail.
- Campo de senha com mostrar/ocultar.
- Opção "Lembrar de mim", se a política de sessão permitir.
- Botão principal "Entrar".
- Link "Esqueci minha senha".
- Acesso para criação de conta, se o produto permitir auto cadastro.
- Login social opcional.
- Mensagens de validação e estado de carregamento.

## 3. Funções e regras

- Validar formato do e-mail no navegador e novamente no servidor.
- Nunca informar se um e-mail específico existe durante recuperação de senha quando isso puder facilitar enumeração de contas.
- Bloquear repetição abusiva de tentativas conforme mecanismo de segurança.
- Criar sessão somente após autenticação bem-sucedida.
- Redirecionar para Início ou para a última rota permitida.
- Encerrar sessão de forma consistente em todos os módulos.
- Não guardar senha em texto legível nem em logs.

## 4. Dados manipulados

| Item               | Especificação                                                         |
| ------------------ | --------------------------------------------------------------------- |
| Entrada            | E-mail, senha, opção de persistência da sessão.                       |
| Leitura            | Conta, status da conta, fatores de autenticação.                      |
| Gravação           | Sessão, data do último acesso e evento de auditoria.                  |
| Não deve armazenar | Senha em texto, token em log, conteúdo pessoal antes da autenticação. |

## Mapa de conexões da página

| Item                    | Especificação                                  |
| ----------------------- | ---------------------------------------------- |
| Chega a esta página por | Tela pública / link de acesso                  |
| Pode sair para          | Início; recuperação de senha; criação de conta |
| Lê / consulta           | Serviço de autenticação e situação da conta    |
| Cria / altera           | Sessão autenticada e logs de segurança         |

## Estados, mensagens e exceções

| Estado / situação      | Comportamento esperado                                           |
| ---------------------- | ---------------------------------------------------------------- |
| Inicial                | Campos vazios, botão habilitado somente conforme regra definida. |
| Validando              | Botão mostra progresso; evitar duplo envio.                      |
| Credenciais incorretas | Mensagem neutra: "E-mail ou senha incorretos".                   |
| Conta não confirmada   | Orientar confirmação de e-mail, se aplicável.                    |
| Muitas tentativas      | Informar bloqueio temporário sem expor detalhes sensíveis.       |
| Erro de rede           | Preservar e-mail digitado e permitir tentar novamente.           |
| Sucesso                | Criar sessão e redirecionar imediatamente.                       |

## 6. Integrações necessárias

- Serviço de autenticação.
- Serviço de e-mail para recuperação/confirmação.
- Registro de auditoria.
- Camada de autorização usada por todas as páginas protegidas.

## 7. Segurança e acessibilidade

- HTTPS obrigatório em produção.
- Campos com labels reais, não apenas placeholders.
- Navegação completa por teclado.
- Mensagens de erro anunciáveis por leitor de tela.
- Sessão expira conforme política de segurança.
- Recuperação de senha deve usar link temporário e de uso limitado.

## Critérios de aceite

- [ ] Credenciais válidas levam ao Início e criam sessão válida.
- [ ] Credenciais inválidas nunca criam sessão.
- [ ] Recuperação de senha funciona do início ao fim.
- [ ] Ao sair, rotas protegidas deixam de ser acessíveis.
- [ ] Erros de rede e validação são compreensíveis para usuário leigo.
- [ ] Nenhuma informação da Biblioteca é carregada para usuário não autenticado.

## Anexo de implementação — contrato funcional

Esta seção traduz a experiência da página em responsabilidades concretas para design, backend, banco de dados e testes. Os nomes técnicos são referenciais; a lógica é obrigatória.

| Item                 | Especificação                                                                 |
| -------------------- | ----------------------------------------------------------------------------- |
| Entrada da interface | e-mail, senha, opção de sessão persistente e, opcionalmente, provedor social. |
| Saída de sucesso     | sessão autenticada + redirecionamento para rota protegida.                    |
| Saída de falha       | mensagem segura, sem revelar dados da conta.                                  |
| Serviços             | autenticação, e-mail transacional, auditoria e autorização de rotas.          |
| Permissão            | página pública; nenhuma leitura de conteúdo pessoal antes da sessão.          |

### Eventos e rastreabilidade

Registrar eventos ajuda a depurar o produto e entender o fluxo sem armazenar desnecessariamente o conteúdo pessoal. Exemplos de eventos lógicos:

- `login_succeeded`
- `login_failed` (sem registrar senha)
- `password_reset_requested`
- `session_created`
- `logout_completed`

Regra: eventos devem registrar identificadores técnicos, tempos, status e erros necessários, mas não copiar textos pessoais completos para logs de observabilidade.

### Desempenho e comportamento em diferentes telas

- Tela deve abrir rapidamente mesmo sem carregar dados pessoais.
- A validação local deve responder imediatamente; autenticação de rede deve mostrar loading.
- Nenhuma chamada à Biblioteca/Meu Cérebro deve ocorrer antes da sessão válida.
- A interface deve ser responsiva: em desktop pode usar barra lateral e áreas amplas; em telas menores, a navegação deve condensar sem retirar funções essenciais.

### Acessibilidade

- Ordem de tabulação previsível.
- Campos com label, autocomplete apropriado e mensagem de erro associada.
- Contraste adequado e foco visível.

### Escopo: MVP e evolução

- **MVP**: e-mail + senha; recuperar senha; sair; proteção de rotas.
- **Futuro**: login social, autenticação em dois fatores, gestão de dispositivos.

### Roteiro mínimo de testes

- [ ] Login válido e inválido.
- [ ] E-mail malformado.
- [ ] Senha incorreta.
- [ ] Reset de senha.
- [ ] Sessão expirada.
- [ ] Acesso direto a rota protegida sem login.
- [ ] Logout invalida acesso.
