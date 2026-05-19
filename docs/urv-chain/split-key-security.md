# URV Chain — Arquitetura futura de fração‑chave

Este documento registra a arquitetura futura de segurança da URV Chain baseada em dupla autenticação com dois fatores criptográficos complementares.

## Princípio

A URV Chain deve evoluir para uma cerimônia de emissão/auditoria com dupla autenticação:

1. **Token físico**: dispositivo físico contendo uma fração‑chave do sistema.
2. **Token virtual**: fator virtual/app-side contendo a outra fração lógica de autorização.

Nenhuma dessas frações deve, por ora, bloquear o desenvolvimento do sistema.

## Regra atual

Durante desenvolvimento, mock, CI e devnet:

```env
VITE_URV_PHYSICAL_KEY_FRACTION_MODE=disabled
VITE_URV_VIRTUAL_KEY_FRACTION_MODE=disabled
VITE_URV_ALLOW_DEV_WITHOUT_KEY_FRACTIONS=true
```

Isso significa:

- O sistema sabe que a arquitetura de fração‑chave existe.
- O frontend consegue exibir prontidão futura.
- O CI não quebra.
- O Builder Agent pode continuar desenvolvendo.
- A rede URV pode funcionar em mock/devnet.
- Nenhum operador fica travado por ausência de hardware.

## Modos

### disabled

A fração é reconhecida como arquitetura futura, mas não é exigida.

Uso atual recomendado.

### optional

A fração pode ser usada se existir, mas não bloqueia o fluxo.

Uso futuro em homologação.

### required

A fração passa a ser obrigatória.

Uso apenas em produção, após:

- UX pronta.
- Fluxo de recuperação pronto.
- Política de rotação de chaves.
- Política de perda de token físico.
- Auditoria do contrato e do backend signer.
- Suporte operacional.

## Objetivo da dupla autenticação

A dupla autenticação deve reforçar:

- segurança da emissão URV;
- auditabilidade;
- separação entre operador clínico e operador criptográfico;
- redução de risco de emissão fraudulenta;
- rastreabilidade de cerimônias críticas;
- compatibilidade com hardware wallets, HSMs ou dispositivos dedicados.

## O que a fração‑chave NÃO deve fazer agora

Ela não deve:

- bloquear build;
- bloquear login;
- bloquear demo;
- bloquear mock;
- bloquear devnet;
- impedir criação de tela;
- impedir testes de UI;
- impedir integração Supabase;
- obrigar posse de hardware antes da maturidade do produto.

## Camada de produção futura

Em produção, a cerimônia ideal poderá seguir o modelo:

```text
operador autenticado
↓
token virtual validado
↓
token físico presente
↓
backend/oracle valida política
↓
payload é canonicalizado
↓
hash é gerado
↓
transação Solana é assinada/enviada
↓
evento é registrado em logs off-chain
```

## Separação de responsabilidades

### Frontend

- Exibir status dos fatores.
- Nunca armazenar segredo sensível persistente.
- Nunca expor fração‑chave.
- Permitir modo desenvolvimento sem bloqueio.

### Backend / Oracle

- Validar política.
- Controlar emissão.
- Registrar logs.
- Rotacionar chaves.
- Aplicar bloqueios de produção.

### Token físico

- Servir como fator forte.
- Não carregar PHI.
- Não ser necessário para desenvolvimento.

### Token virtual

- Servir como segundo fator lógico.
- Ser renovável/revogável.
- Não substituir o controle de backend em produção.

## Regra de segurança principal

A fração‑chave não é prontuário, não é PHI e não é dado clínico.

Ela é apenas parte da cerimônia criptográfica de autorização/auditabilidade da URV Chain.

## Política anti‑travamento

Enquanto `VITE_URV_ALLOW_DEV_WITHOUT_KEY_FRACTIONS=true`, nenhuma rotina do app deve impedir o desenvolvimento por falta de token físico ou virtual.

Qualquer código que introduzir bloqueio por fração‑chave precisa verificar:

```ts
shouldBlockUrvForMissingKeyFractions()
```

E essa função deve retornar `false` em desenvolvimento, mock e devnet.

## Critério para ativar required

Só usar `required` quando:

- Mainnet estiver planejada.
- Program ID real estiver implantado.
- Auditoria do Anchor program estiver concluída.
- Backend oracle estiver pronto.
- Fluxo de recuperação estiver documentado.
- Usuário não técnico souber o que fazer em caso de perda do token.
