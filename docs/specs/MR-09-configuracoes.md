# MR-09 — Configurações

> Conta, preferências, segurança, IA, privacidade e integrações.
> Fonte original: `09_Configuracoes.docx`. Status: especificação funcional para construção. Versão 1.0.

## 1. Papel desta página

Configurações concentra decisões que afetam toda a experiência, sem poluir as telas de trabalho. Deve diferenciar claramente preferências reversíveis de ações sensíveis ou destrutivas.

## 2. Seções recomendadas

- Minha conta.
- Preferências gerais.
- Segurança e privacidade.
- Idioma e aparência.
- Comportamento da IA.
- Memória e personalização.
- Integrações futuras.
- Exportação de dados.
- Ajuda e sobre o aplicativo.
- Sair / excluir conta.

## 3. Minha conta

- Nome de exibição.
- E-mail e verificação.
- Foto opcional.
- Alteração de senha via fluxo seguro.
- Gerenciamento de sessões/dispositivos futuro.

## 4. Preferências de IA

O usuário pode ajustar preferências de experiência, mas não deve ser exposto a parâmetros técnicos difíceis no MVP. Opções compreensíveis incluem: respostas mais concisas ou profundas, grau de iniciativa da IA para sugerir memórias, preferência por sempre mostrar plano antes da geração e nível de explicação das evidências.

## 5. Preferências de memória

- Exigir confirmação antes de incorporar qualquer reflexão.
- Permitir/desativar uso de determinados tipos de fonte no perfil autoral.
- Recalcular perfil.
- Ver quantidade de fontes elegíveis.
- Exportar relatório do perfil.
- Apagar interpretações derivadas e reconstruir a partir das fontes, quando necessário.

## 6. Privacidade e segurança

- Alterar senha / autenticação adicional quando disponível.
- Ver política de privacidade.
- Exportar dados pessoais.
- Excluir conta com fluxo de confirmação forte.
- Mostrar claramente o que será excluído e o que pode ter retenção técnica temporária.

## 7. Integrações futuras

Conectores como armazenamento em nuvem, e-mail ou outros serviços devem ser opcionais, com escopos de permissão mínimos. O usuário deve poder ver quais integrações estão conectadas, quais dados acessam e revogar acesso.

## Mapa de conexões da página

| Item                    | Especificação                                                   |
| ----------------------- | --------------------------------------------------------------- |
| Chega a esta página por | Menu "Mais", perfil ou navegação global                         |
| Pode sair para          | Login após sair; subseções de conta/privacidade                 |
| Lê / consulta           | Conta, preferências, políticas, integrações e estado do perfil  |
| Cria / altera           | Preferências, segurança, decisões de memória e eventos de conta |

## Estados, mensagens e exceções

| Estado / situação       | Comportamento esperado                                               |
| ----------------------- | -------------------------------------------------------------------- |
| Alteração simples       | Salvar automaticamente ou com botão claro e feedback.                |
| Alteração sensível      | Pedir reautenticação quando apropriado.                              |
| Integração indisponível | Mostrar "em breve" sem botão que pareça funcional.                   |
| Exclusão de conta       | Exigir confirmação inequívoca; informar consequências.               |
| Falha ao salvar         | Não fingir sucesso; manter valor anterior e permitir tentar de novo. |
| Sair                    | Encerrar sessão e voltar ao Login.                                   |

## 9. Integrações necessárias

- Autenticação.
- Banco de preferências.
- Sistema de privacidade/exportação.
- Meu Cérebro e memória.
- Gestão de integrações futuras.
- Auditoria de ações sensíveis.

## Critérios de aceite

- [ ] Preferências realmente alteram o comportamento correspondente.
- [ ] Ações sensíveis exigem confirmação/reautenticação adequada.
- [ ] Usuário consegue sair e invalidar a sessão.
- [ ] Configurações de memória impactam o perfil de forma rastreável.
- [ ] Integrações podem ser revogadas.
- [ ] Exclusão/exportação de dados possuem fluxo claro e testável.

## Anexo de implementação — contrato funcional

| Item      | Especificação                                                                 |
| --------- | ----------------------------------------------------------------------------- |
| Entrada   | preferências e ações da conta.                                                |
| Saída     | configuração global aplicada aos módulos.                                     |
| Serviços  | auth, preferências, privacidade, integrações e auditoria.                     |
| Entidades | `user_settings`, `security_settings`, `integration_connections`.              |
| Permissão | usuário altera apenas sua conta; ações sensíveis podem exigir reautenticação. |

### Eventos e rastreabilidade

- `settings_viewed`
- `preference_changed`
- `privacy_export_requested`
- `integration_connected`
- `integration_revoked`
- `logout_completed`
- `account_deletion_requested`

Regra: eventos devem registrar identificadores técnicos, tempos, status e erros necessários, mas não copiar textos pessoais completos para logs de observabilidade.

### Desempenho e comportamento em diferentes telas

- Preferências leves podem salvar imediatamente.
- Operações pesadas (exportar dados, reconstruir memória) viram jobs com status.
- Falha ao salvar deve preservar último valor confirmado.
- A interface deve ser responsiva: em desktop pode usar barra lateral e áreas amplas; em telas menores, a navegação deve condensar sem retirar funções essenciais.

### Acessibilidade

- Controles informam estado atual.
- Toggles possuem rótulos completos.
- Ações destrutivas têm contraste e confirmação, sem depender só de cor.

### Escopo: MVP e evolução

- **MVP**: conta, preferências, segurança básica, IA/memória, aparência/idioma e sair.
- **Futuro**: conectores, dispositivos, 2FA e controles avançados de modelo.

### Roteiro mínimo de testes

- [ ] Salvar preferência.
- [ ] Falha de rede.
- [ ] Alteração sensível.
- [ ] Logout.
- [ ] Exportação de dados.
- [ ] Exclusão de conta.
- [ ] Rebuild de memória.
- [ ] Revogar integração.
