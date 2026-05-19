# URV Chain — Matriz Universal Solana

Este documento define a parte do Rhema Care Flow que deve permanecer como matriz universal para todos os derivados do código aberto: a rede URV.

## Princípio

> O app pode gerar derivados, verticais, clínicas, especialidades e interfaces diferentes. A rede URV deve permanecer canônica.

A URV Chain é a camada universal de prova, auditoria, mensuração de valor e interoperabilidade econômica/assistencial do ecossistema UHS Health OS.

## O que é universal

A matriz universal inclui:

- Programa Solana/Anchor URV.
- IDL canônica.
- Seeds de PDA.
- Esquema de hash.
- Política de score.
- Política de oracle.
- Registro de eventos.
- Contrato de privacidade.
- Configuração de rede.
- Botões operacionais do frontend.

## O que pode variar nos derivados

Cada derivado pode mudar:

- Interface.
- Nome comercial.
- Especialidade médica.
- Conteúdo clínico.
- Fluxos de onboarding.
- Módulos de agenda, teleconsulta, prescrições ou educação.
- Branding.

Mas não deve redefinir a matriz URV.

## Regra de imutabilidade conceitual

Derivados podem consumir a URV Chain, mas não devem criar outra URV paralela com semântica incompatível.

Se um derivado precisar de ajuste, ele deve propor uma extensão versionada da matriz universal.

## Ambientes

### Off

Blockchain desligada. O app roda sem Solana.

### Mock

Simulação local para UX e testes de interface.

### Devnet

Ambiente padrão para desenvolvimento real com Phantom/Solana Devnet.

### Mainnet-beta

Ambiente futuro de produção, após auditoria técnica, governança, política de oracle e revisão regulatória.

## Botões operacionais esperados

A interface deve evoluir para um painel com botões claros:

1. Conectar wallet.
2. Inicializar estado URV.
3. Registrar prova de evento.
4. Publicar atualização de score.
5. Verificar último estado.
6. Alternar modo Off/Mock/Devnet/Mainnet.
7. Exportar pacote de prova.

## Política de privacidade

A URV Chain nunca deve armazenar PHI/PII on-chain.

Permitido on-chain:

- Hashes.
- Scores normalizados.
- Confidence bps.
- Timestamps.
- PDAs.
- Versão de schema.
- Pointers para conteúdo criptografado.

Proibido on-chain:

- Nome de paciente.
- CPF.
- Endereço.
- Diagnóstico textual identificável.
- Evolução clínica textual.
- Prescrição aberta.
- Qualquer dado que identifique diretamente uma pessoa.

## Contrato de hash

A URV Chain usa canonical JSON + SHA-256.

Fluxo mínimo:

```text
payload clínico/operacional off-chain
↓
canonical JSON
↓
SHA-256
↓
data_hash on-chain
```

Para score:

```text
new_score_hash = sha256(prev_hash + features_hash + score_u32_LE + confidence_bps_LE)
```

## PDAs canônicos

```text
State PDA  = ["state", admin_pubkey]
Record PDA = ["rec", owner_pubkey, data_hash]
Update PDA = ["upd", state_pubkey, new_score_hash]
```

## Programa Anchor esperado

Instruções mínimas:

- `init_state(oracle)`
- `create_record(data_hash, uri, schema_version)`
- `post_score_update(record_data_hash, features_hash, score_u32, confidence_bps, prev_score_hash, new_score_hash)`

## Política de oracle

MVP:

- Wallet conectada pode atuar como oracle em devnet.

Produção:

- Oracle deve ser backend signer controlado.
- Pode usar hardware wallet ou key management service.
- Deve ter política de rotação.
- Deve registrar logs off-chain.
- Deve separar operador clínico de operador de emissão.

## URV não é PHI

URV é unidade abstrata de valor/resultado/confiança. Ela deve representar prova, mensuração e atualização de estado, não prontuário aberto.

## Preset técnico

O app deve ler variáveis `VITE_URV_*` e montar a conexão automaticamente.

Variáveis esperadas:

```env
VITE_URV_CHAIN_ENABLED=false
VITE_URV_NETWORK_MODE=devnet
VITE_URV_CLUSTER_URL=https://api.devnet.solana.com
VITE_URV_PROGRAM_ID=URVPr1vacy11111111111111111111111111111111
VITE_URV_SCHEMA_VERSION=1
VITE_URV_ORACLE_MODE=wallet
VITE_URV_CANONICAL_MATRIX=true
```

## Regra para open source

O código pode ser aberto. A matriz URV deve ser preservada como referência canônica.

Forks podem criar clientes, módulos e verticais, mas devem manter compatibilidade com a URV Chain se quiserem pertencer ao ecossistema UHS.

## Critério de pronto para ligar

A rede estará “pronta para ligar botões” quando:

- Config central existir.
- IDL estiver carregada.
- Program ID vier de env.
- Frontend tiver botão de ligar/desligar.
- Devnet funcionar com Phantom.
- Payloads forem hashados antes de envio.
- Nenhum PHI for enviado para Solana.
- Auditoria de build passar.
