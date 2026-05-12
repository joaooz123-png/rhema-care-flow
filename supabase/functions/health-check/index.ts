import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface HealthCheckResult {
  status: "healthy" | "unhealthy" | "degraded";
  checks: {
    anthropic: {
      ok: boolean;
      configured: boolean;
      message: string;
    };
    timestamp: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    // Check if key is configured
    const isConfigured = !!apiKey && apiKey.length > 20;

    // Try a lightweight validation against Anthropic
    let isValid = false;
    let message = "";

    if (!isConfigured) {
      message = "ANTHROPIC_API_KEY is not configured";
    } else {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1,
            messages: [{ role: "user", content: "hi" }],
          }),
        });

        if (res.ok) {
          isValid = true;
          message = "ANTHROPIC_API_KEY is configured and valid";
        } else if (res.status === 401) {
          message = "ANTHROPIC_API_KEY is configured but unauthorized (invalid key)";
        } else if (res.status === 429) {
          isValid = true;
          message = "ANTHROPIC_API_KEY is valid (rate limited during check)";
        } else {
          const text = await res.text().catch(() => "");
          message = `ANTHROPIC_API_KEY validation failed (${res.status}): ${text.slice(0, 200)}`;
        }
      } catch (err) {
        message = `ANTHROPIC_API_KEY network validation error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    const anthropicOk = isConfigured && isValid;
    const overallStatus: HealthCheckResult["status"] = anthropicOk
      ? "healthy"
      : isConfigured
      ? "degraded"
      : "unhealthy";

    const result: HealthCheckResult = {
      status: overallStatus,
      checks: {
        anthropic: {
          ok: anthropicOk,
          configured: isConfigured,
          message,
        },
        timestamp: new Date().toISOString(),
      },
    };

    const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;

    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        error: err instanceof Error ? err.message : "Server error",
        checks: {
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
