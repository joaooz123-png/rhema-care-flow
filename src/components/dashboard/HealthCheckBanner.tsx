import { AlertTriangle, CheckCircle2, RefreshCw, XCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealthCheck } from '@/hooks/useHealthCheck';

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic Claude',
  openai: 'OpenAI GPT',
  gemini: 'Google Gemini',
  deepseek: 'DeepSeek',
};

export function HealthCheckBanner() {
  const { data, loading } = useHealthCheck();

  if (loading || !data) return null;
  if (data.status === 'healthy' && !data.fallbackAvailable) {
    // Single provider OK, no banner
    return null;
  }
  if (data.status === 'healthy') return null;

  const isUnhealthy = data.status === 'unhealthy';
  const tone = isUnhealthy ? 'destructive' : 'warning';

  const containerCls = isUnhealthy
    ? 'border-destructive/30 bg-destructive/10'
    : 'border-warning/30 bg-warning/10';
  const iconBgCls = isUnhealthy ? 'bg-destructive/20' : 'bg-warning/20';
  const iconCls = isUnhealthy ? 'text-destructive' : 'text-warning';
  const titleCls = isUnhealthy ? 'text-destructive' : 'text-warning';

  return (
    <div className={`mb-4 rounded-lg border p-4 ${containerCls}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBgCls}`}>
          <AlertTriangle className={`h-4 w-4 ${iconCls}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${titleCls}`}>
            {isUnhealthy
              ? 'Nenhum provedor de IA disponível'
              : `Modo degradado — operando via ${PROVIDER_LABELS[data.activeProvider ?? ''] ?? 'fallback'}`}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isUnhealthy
              ? 'Todos os provedores de IA configurados estão inacessíveis (sem créditos, chaves inválidas ou indisponíveis). As funcionalidades de IA não funcionarão até que ao menos um provedor seja restabelecido.'
              : 'Um ou mais provedores estão indisponíveis. O sistema fez switch automático para o próximo provedor saudável. Recomenda-se restaurar os provedores afetados.'}
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {(['anthropic', 'openai', 'deepseek', 'gemini'] as const).map((id) => {
              const p = data.checks[id];
              const isActive = data.activeProvider === id;
              return (
                <div
                  key={id}
                  className={`flex items-center gap-2 rounded-md border bg-background/50 px-3 py-2 ${
                    isActive ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border'
                  }`}
                >
                  {p.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  ) : p.configured ? (
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium truncate">{PROVIDER_LABELS[id]}</span>
                      {isActive && <Zap className="h-3 w-3 text-primary shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate" title={p.message}>
                      {p.message}
                    </p>
                  </div>
                </div>
              );
            })}
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
