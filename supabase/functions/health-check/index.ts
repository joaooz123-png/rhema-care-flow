import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ProviderCheck {
  configured: boolean;
  ok: boolean;
  message: string;
}

async function checkAnthropic(): Promise<ProviderCheck> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return { configured: false, ok: false, message: "ANTHROPIC_API_KEY not configured" };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    if (res.ok) return { configured: true, ok: true, message: "OK" };
    if (res.status === 401) return { configured: true, ok: false, message: "Unauthorized (invalid key)" };
    if (res.status === 402) return { configured: true, ok: false, message: "Out of credits" };
    if (res.status === 429) return { configured: true, ok: true, message: "Valid (rate-limited during check)" };
    return { configured: true, ok: false, message: `HTTP ${res.status}` };
  } catch (err) {
    return { configured: true, ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

async function checkOpenAI(): Promise<ProviderCheck> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return { configured: false, ok: false, message: "OPENAI_API_KEY not configured" };
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.ok) return { configured: true, ok: true, message: "OK" };
    if (res.status === 401) return { configured: true, ok: false, message: "Unauthorized (invalid key)" };
    if (res.status === 402 || res.status === 429) return { configured: true, ok: false, message: "Out of credits or rate limited" };
    return { configured: true, ok: false, message: `HTTP ${res.status}` };
  } catch (err) {
    return { configured: true, ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

async function checkGemini(): Promise<ProviderCheck> {
  const key = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
  if (!key) return { configured: false, ok: false, message: "GEMINI_API_KEY not configured" };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
    );
    if (res.ok) return { configured: true, ok: true, message: "OK" };
    if (res.status === 401 || res.status === 403) return { configured: true, ok: false, message: "Unauthorized (invalid key)" };
    if (res.status === 429) return { configured: true, ok: false, message: "Rate limited / quota exceeded" };
    return { configured: true, ok: false, message: `HTTP ${res.status}` };
  } catch (err) {
    return { configured: true, ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

async function checkDeepSeek(): Promise<ProviderCheck> {
  const key = Deno.env.get("DEEPSEEK_API_KEY");
  if (!key) return { configured: false, ok: false, message: "DEEPSEEK_API_KEY not configured" };
  try {
    const res = await fetch("https://api.deepseek.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.ok) return { configured: true, ok: true, message: "OK" };
    if (res.status === 401) return { configured: true, ok: false, message: "Unauthorized (invalid key)" };
    if (res.status === 402) return { configured: true, ok: false, message: "Out of credits" };
    if (res.status === 429) return { configured: true, ok: false, message: "Rate limited" };
    return { configured: true, ok: false, message: `HTTP ${res.status}` };
  } catch (err) {
    return { configured: true, ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const [anthropic, openai, gemini] = await Promise.all([
      checkAnthropic(),
      checkOpenAI(),
      checkGemini(),
    ]);

    const providers = { anthropic, openai, gemini };
    const healthyCount = Object.values(providers).filter((p) => p.ok).length;
    const configuredCount = Object.values(providers).filter((p) => p.configured).length;

    let status: "healthy" | "degraded" | "unhealthy";
    if (healthyCount === 0) status = "unhealthy";
    else if (healthyCount < configuredCount || healthyCount === 1) status = "degraded";
    else status = "healthy";

    // Active provider order (first healthy one is primary)
    const order = (Deno.env.get("AI_PROVIDER_ORDER") ?? "anthropic,openai,gemini")
      .split(",")
      .map((s) => s.trim());
    const activeProvider = order.find((id) => (providers as any)[id]?.ok) ?? null;

    return new Response(JSON.stringify({
      status,
      activeProvider,
      fallbackAvailable: healthyCount > 1,
      checks: {
        ...providers,
        // Backward-compat: Dashboard banner reads checks.anthropic
        timestamp: new Date().toISOString(),
      },
    }), {
      status: status === "unhealthy" ? 503 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      status: "unhealthy",
      error: err instanceof Error ? err.message : "Server error",
      checks: { timestamp: new Date().toISOString() },
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
