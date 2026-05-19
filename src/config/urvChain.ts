import { clusterApiUrl, PublicKey } from '@solana/web3.js';

export type UrvNetworkMode = 'off' | 'mock' | 'devnet' | 'mainnet-beta';
export type UrvOracleMode = 'wallet' | 'backend' | 'hardware';
export type UrvKeyPolicyMode = 'disabled' | 'optional' | 'required';

const DEFAULT_DEVNET_PROGRAM_ID = 'URVPr1vacy11111111111111111111111111111111';

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readNetworkMode(value: string | undefined): UrvNetworkMode {
  if (value === 'off' || value === 'mock' || value === 'devnet' || value === 'mainnet-beta') {
    return value;
  }
  return 'devnet';
}

function readOracleMode(value: string | undefined): UrvOracleMode {
  if (value === 'wallet' || value === 'backend' || value === 'hardware') {
    return value;
  }
  return 'wallet';
}

function readKeyPolicyMode(value: string | undefined): UrvKeyPolicyMode {
  if (value === 'disabled' || value === 'optional' || value === 'required') {
    return value;
  }
  return 'disabled';
}

function resolveClusterUrl(mode: UrvNetworkMode, configured?: string): string {
  if (configured) return configured;
  if (mode === 'mainnet-beta') return clusterApiUrl('mainnet-beta');
  return clusterApiUrl('devnet');
}

const networkMode = readNetworkMode(import.meta.env.VITE_URV_NETWORK_MODE);

export const URV_CHAIN_CONFIG = {
  /** Master switch. Keep false for apps that do not expose blockchain UX. */
  enabled: readBoolean(import.meta.env.VITE_URV_CHAIN_ENABLED, true),

  /** off = disabled, mock = local UX simulation, devnet = Solana devnet, mainnet-beta = production. */
  networkMode,

  /** RPC endpoint. Defaults to Solana cluster API for selected network. */
  clusterUrl: resolveClusterUrl(networkMode, import.meta.env.VITE_URV_CLUSTER_URL),

  /** Canonical Anchor program ID. Override only after deploying the URV program. */
  programId: import.meta.env.VITE_URV_PROGRAM_ID || DEFAULT_DEVNET_PROGRAM_ID,

  /** Schema version for off-chain canonical payloads. */
  schemaVersion: readNumber(import.meta.env.VITE_URV_SCHEMA_VERSION, 1),

  /** MVP: wallet. Production: backend/hardware. */
  oracleMode: readOracleMode(import.meta.env.VITE_URV_ORACLE_MODE),

  /** Must remain true for official UHS/Rhema derivatives. */
  canonicalMatrix: readBoolean(import.meta.env.VITE_URV_CANONICAL_MATRIX, true),

  /**
   * Future security layer: physical token containing one key fraction.
   * Keep disabled during development so no unrecoverable key dependency blocks the app.
   */
  physicalKeyFractionMode: readKeyPolicyMode(import.meta.env.VITE_URV_PHYSICAL_KEY_FRACTION_MODE),

  /**
   * Future security layer: virtual token / app-side factor paired with the physical token.
   * Keep disabled during development; enable optional/required only after UX and recovery flows exist.
   */
  virtualKeyFractionMode: readKeyPolicyMode(import.meta.env.VITE_URV_VIRTUAL_KEY_FRACTION_MODE),

  /** Development escape hatch. Must remain true in mock/devnet until the split-key ceremony exists. */
  allowDevelopmentWithoutKeyFractions: readBoolean(
    import.meta.env.VITE_URV_ALLOW_DEV_WITHOUT_KEY_FRACTIONS,
    true,
  ),
} as const;

export function isUrvChainActive(): boolean {
  return URV_CHAIN_CONFIG.enabled && URV_CHAIN_CONFIG.networkMode !== 'off';
}

export function isUrvMockMode(): boolean {
  return URV_CHAIN_CONFIG.enabled && URV_CHAIN_CONFIG.networkMode === 'mock';
}

export function getUrvExplorerCluster(): 'devnet' | 'mainnet-beta' {
  return URV_CHAIN_CONFIG.networkMode === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
}

export function getUrvProgramPublicKey(): PublicKey | null {
  try {
    return new PublicKey(URV_CHAIN_CONFIG.programId);
  } catch {
    return null;
  }
}

export function areUrvKeyFractionsRequired(): boolean {
  return (
    URV_CHAIN_CONFIG.physicalKeyFractionMode === 'required' ||
    URV_CHAIN_CONFIG.virtualKeyFractionMode === 'required'
  );
}

export function shouldBlockUrvForMissingKeyFractions(): boolean {
  if (!areUrvKeyFractionsRequired()) return false;
  if (URV_CHAIN_CONFIG.allowDevelopmentWithoutKeyFractions) return false;
  return URV_CHAIN_CONFIG.networkMode === 'mainnet-beta';
}

export function getUrvReadinessChecks() {
  const programPublicKey = getUrvProgramPublicKey();
  return [
    {
      id: 'enabled',
      label: 'URV Chain habilitada',
      ok: URV_CHAIN_CONFIG.enabled,
    },
    {
      id: 'mode',
      label: `Modo de rede: ${URV_CHAIN_CONFIG.networkMode}`,
      ok: URV_CHAIN_CONFIG.networkMode !== 'off',
    },
    {
      id: 'cluster',
      label: 'RPC configurado',
      ok: Boolean(URV_CHAIN_CONFIG.clusterUrl),
    },
    {
      id: 'program',
      label: 'Program ID valido',
      ok: Boolean(programPublicKey),
    },
    {
      id: 'schema',
      label: `Schema v${URV_CHAIN_CONFIG.schemaVersion}`,
      ok: URV_CHAIN_CONFIG.schemaVersion >= 1,
    },
    {
      id: 'canonical',
      label: 'Matriz URV canonica preservada',
      ok: URV_CHAIN_CONFIG.canonicalMatrix,
    },
    {
      id: 'physical-key-fraction',
      label: `Fração-chave física: ${URV_CHAIN_CONFIG.physicalKeyFractionMode}`,
      ok: URV_CHAIN_CONFIG.physicalKeyFractionMode !== 'required' || URV_CHAIN_CONFIG.allowDevelopmentWithoutKeyFractions,
    },
    {
      id: 'virtual-key-fraction',
      label: `Fração-chave virtual: ${URV_CHAIN_CONFIG.virtualKeyFractionMode}`,
      ok: URV_CHAIN_CONFIG.virtualKeyFractionMode !== 'required' || URV_CHAIN_CONFIG.allowDevelopmentWithoutKeyFractions,
    },
    {
      id: 'dev-without-key-fractions',
      label: URV_CHAIN_CONFIG.allowDevelopmentWithoutKeyFractions
        ? 'Desenvolvimento liberado sem frações-chave'
        : 'Frações-chave podem bloquear ambientes restritos',
      ok: URV_CHAIN_CONFIG.allowDevelopmentWithoutKeyFractions || URV_CHAIN_CONFIG.networkMode !== 'mainnet-beta',
    },
  ];
}
