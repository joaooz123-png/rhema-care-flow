import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Info, KeyRound, Network, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  areUrvKeyFractionsRequired,
  getUrvReadinessChecks,
  shouldBlockUrvForMissingKeyFractions,
  URV_CHAIN_CONFIG,
} from '@/config/urvChain';

export function UrvPresetPanel() {
  const readinessChecks = getUrvReadinessChecks();
  const keyFractionsRequired = areUrvKeyFractionsRequired();
  const blockedByKeyFractions = shouldBlockUrvForMissingKeyFractions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            URV Universal Network Preset
          </CardTitle>
          <CardDescription>
            Canonical Solana matrix inherited by official derivatives of the open-source codebase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={URV_CHAIN_CONFIG.enabled ? 'default' : 'destructive'}>
              {URV_CHAIN_CONFIG.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Badge variant="secondary">{URV_CHAIN_CONFIG.networkMode}</Badge>
            <Badge variant="outline">Oracle: {URV_CHAIN_CONFIG.oracleMode}</Badge>
            <Badge variant={URV_CHAIN_CONFIG.canonicalMatrix ? 'outline' : 'destructive'}>
              {URV_CHAIN_CONFIG.canonicalMatrix ? 'Canonical Matrix' : 'Non-canonical'}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Network Mode</p>
              <p className="font-mono break-all">{URV_CHAIN_CONFIG.networkMode}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Schema Version</p>
              <p className="font-mono">{URV_CHAIN_CONFIG.schemaVersion}</p>
            </div>
            <div className="rounded-lg border p-3 md:col-span-2">
              <p className="text-xs text-muted-foreground">RPC Endpoint</p>
              <p className="font-mono break-all">{URV_CHAIN_CONFIG.clusterUrl}</p>
            </div>
            <div className="rounded-lg border p-3 md:col-span-2">
              <p className="text-xs text-muted-foreground">Program ID</p>
              <p className="font-mono break-all">{URV_CHAIN_CONFIG.programId}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            {readinessChecks.map(check => (
              <div key={check.id} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                {check.ok ? (
                  <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                )}
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Future Split-Key Security
          </CardTitle>
          <CardDescription>
            Physical token + virtual token are architecturally reserved, but intentionally non-blocking now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Physical Key Fraction</p>
              <p className="font-mono">{URV_CHAIN_CONFIG.physicalKeyFractionMode}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Virtual Key Fraction</p>
              <p className="font-mono">{URV_CHAIN_CONFIG.virtualKeyFractionMode}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Development Escape Hatch</p>
              <p className="font-mono">{String(URV_CHAIN_CONFIG.allowDevelopmentWithoutKeyFractions)}</p>
            </div>
          </div>

          <Alert variant={blockedByKeyFractions ? 'destructive' : 'default'}>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>
              {blockedByKeyFractions
                ? 'Split-key enforcement would block this environment'
                : 'Development is not blocked by missing key fractions'}
            </AlertTitle>
            <AlertDescription>
              {keyFractionsRequired
                ? 'At least one key fraction is marked required, but development remains unblocked while the escape hatch is enabled.'
                : 'Physical and virtual key fractions are reserved for future production-grade security and auditability, but both are disabled/optional for current development.'}
            </AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Future ceremony</AlertTitle>
            <AlertDescription>
              Production may require a physical token carrying one key fraction plus a virtual token/app-side factor.
              Until recovery, rotation, oracle and support flows are implemented, this must not block mock, devnet, CI or app development.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
