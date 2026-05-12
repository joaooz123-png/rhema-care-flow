import { AlertTriangle, KeyRound, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealthCheck } from '@/hooks/useHealthCheck';

export function HealthCheckBanner() {
  const { data, loading, anthropicMissing, anthropicInvalid } = useHealthCheck();

  if (loading) return null;
  if (!data) return null;
  if (data.status === 'healthy') return null;

  const isMissing = anthropicMissing;
  const isInvalid = anthropicInvalid;

  return (
    <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">
            {isMissing && 'ANTHROPIC_API_KEY não configurada'}
            {isInvalid && 'ANTHROPIC_API_KEY inválida'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isMissing && (
              <>
                A chave de API da Anthropic não está configurada. As funcionalidades de IA do
                RheumaFlow estão indisponíveis. Adicione a chave em{' '}
                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Cloud &rarr; Secrets</span>.
              </>
            )}
            {isInvalid && (
              <>
                A chave de API da Anthropic está configurada, mas foi rejeitada pela API
                (401 Unauthorized). Verifique se a chave está correta e ativa.
              </>
            )}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {data.checks.anthropic.message}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Recarregar
        </Button>
      </div>
    </div>
  );
}
