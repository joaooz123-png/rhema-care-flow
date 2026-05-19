# URV Chain — Checklist de Ativação

Este checklist transforma a rede URV em uma camada praticamente plug-and-play.

## Estado desejado

A rede URV deve ficar presetada para que o operador precise apenas:

1. Definir variáveis `VITE_URV_*`.
2. Subir o programa Anchor.
3. Informar o Program ID real.
4. Conectar wallet/oracle.
5. Acionar os botões da interface.

## 1. Configuração local

Criar `.env.local` com:

```env
VITE_URV_CHAIN_ENABLED=true
VITE_URV_NETWORK_MODE=devnet
VITE_URV_CLUSTER_URL=https://api.devnet.solana.com
VITE_URV_PROGRAM_ID=URVPr1vacy11111111111111111111111111111111
VITE_URV_SCHEMA_VERSION=1
VITE_URV_ORACLE_MODE=wallet
VITE_URV_CANONICAL_MATRIX=true
```

## 2. Modos de operação

### Off

```env
VITE_URV_CHAIN_ENABLED=false
VITE_URV_NETWORK_MODE=off
```

Uso: derivado sem blockchain visível.

### Mock

```env
VITE_URV_CHAIN_ENABLED=true
VITE_URV_NETWORK_MODE=mock
```

Uso: validar UX sem enviar transações.

### Devnet

```env
VITE_URV_CHAIN_ENABLED=true
VITE_URV_NETWORK_MODE=devnet
VITE_URV_CLUSTER_URL=https://api.devnet.solana.com
```

Uso: teste real com Phantom/Solflare.

### Mainnet-beta

```env
VITE_URV_CHAIN_ENABLED=true
VITE_URV_NETWORK_MODE=mainnet-beta
```

Uso: somente após auditoria de contrato, governança e oracle.

## 3. Critérios de prontidão

- [ ] `src/config/urvChain.ts` existe.
- [ ] `.env.example` contém presets `VITE_URV_*`.
- [ ] `src/lib/solana.ts` usa a config central.
- [ ] `UrvDemo` lê Program ID da config, não hardcoded.
- [ ] IDL canônica existe em `src/idl/urv_privacy.json`.
- [ ] Documentação universal existe em `docs/urv-chain/universal-urv-network.md`.
- [ ] Nenhum PHI/PII é enviado para Solana.
- [ ] `canonicalize()` é usado antes do hash.
- [ ] Hash SHA-256 é gerado no frontend/backend antes de transação.
- [ ] `new_score_hash` segue a fórmula canônica.
- [ ] CI passa.

## 4. Botões mínimos da interface

- [ ] Conectar wallet.
- [ ] Init State.
- [ ] Create Record.
- [ ] Post Score Update.
- [ ] Ver status da rede.
- [ ] Ver Program ID.
- [ ] Ver RPC ativo.
- [ ] Ver modo: off/mock/devnet/mainnet-beta.

## 5. Política de forks e derivados

Derivados oficiais podem mudar interface e módulos, mas devem preservar:

- PDA seeds.
- Hash contract.
- Schema versioning.
- IDL canônica ou extensão versionada.
- Proibição de PHI/PII on-chain.
- Compatibilidade com `VITE_URV_CANONICAL_MATRIX=true`.

## 6. Regras para produção

Antes de mainnet:

- [ ] Auditoria do programa Anchor.
- [ ] Separar oracle de wallet de usuário.
- [ ] Backend signer ou hardware signer.
- [ ] Política de rotação de chaves.
- [ ] Logs off-chain.
- [ ] Monitoramento de transações.
- [ ] Procedimento de pausa/emergência.
- [ ] Revisão jurídica/regulatória.

## 7. Fronteira de privacidade

Nunca on-chain:

- Nome.
- CPF.
- Endereço.
- Telefone.
- Texto clínico aberto.
- Diagnóstico identificável.
- Prescrição aberta.

Somente on-chain:

- Hash.
- Score.
- Confidence.
- Timestamp.
- URI criptografada/pointer.
- Schema version.
- PDA.

## 8. Fórmula canônica

```text
data_hash = sha256(canonical_json(payload_off_chain))
features_hash = sha256(canonical_json(features))
new_score_hash = sha256(prev_hash + features_hash + score_u32_LE + confidence_bps_LE)
```

## 9. Definição de pronto

A rede URV estará pronta para ser ativada quando o operador conseguir:

1. Rodar em mock.
2. Rodar em devnet.
3. Trocar Program ID por env.
4. Criar record sem PHI.
5. Publicar score update encadeado.
6. Conferir transação no Solana Explorer.
7. Repetir o mesmo fluxo em derivado/fork mantendo matriz canônica.
