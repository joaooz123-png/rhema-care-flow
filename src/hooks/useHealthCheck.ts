import { useEffect, useState } from 'react';
import { invokeEdgeFn } from '@/lib/invokeEdgeFn';

interface ProviderCheck {
  configured: boolean;
  ok: boolean;
  message: string;
}

export interface HealthCheckData {
  status: 'healthy' | 'unhealthy' | 'degraded';
  activeProvider: 'anthropic' | 'openai' | 'gemini' | null;
  fallbackAvailable: boolean;
  checks: {
    anthropic: ProviderCheck;
    openai: ProviderCheck;
    gemini: ProviderCheck;
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
      }
      setLoading(false);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data,
    loading,
    error,
    isUnhealthy: data?.status === 'unhealthy',
    isDegraded: data?.status === 'degraded',
    activeProvider: data?.activeProvider ?? null,
    fallbackAvailable: data?.fallbackAvailable ?? false,
  };
}
