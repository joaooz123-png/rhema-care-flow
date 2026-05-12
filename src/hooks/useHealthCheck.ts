import { useEffect, useState } from 'react';
import { invokeEdgeFn } from '@/lib/invokeEdgeFn';

export interface HealthCheckData {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: {
    anthropic: {
      ok: boolean;
      configured: boolean;
      message: string;
    };
    timestamp: string;
  };
}

export function useHealthCheck() {
  const [data, setData] = useState<HealthCheckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setLoading(true);
      setError(null);

      const { data: result, error: fnError } = await invokeEdgeFn<HealthCheckData>('health-check', {});

      if (cancelled) return;

      if (fnError) {
        setError(fnError);
        setData(null);
      } else {
        setData(result);
        setError(null);
      }

      setLoading(false);
    }

    check();

    return () => {
      cancelled = true;
    };
  }, []);

  const isUnhealthy = data?.status === 'unhealthy';
  const isDegraded = data?.status === 'degraded';
  const anthropicMissing = !data?.checks.anthropic.configured;
  const anthropicInvalid = data?.checks.anthropic.configured && !data?.checks.anthropic.ok;

  return {
    data,
    loading,
    error,
    isUnhealthy,
    isDegraded,
    anthropicMissing,
    anthropicInvalid,
  };
}
