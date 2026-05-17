// Multi-provider AI adapter — exposes an OpenAI-compatible `chat/completions`
// interface and automatically switches between providers when one runs out of
// credit / hits rate limits / returns auth errors.
//
// Fallback order: Anthropic → OpenAI → Gemini (only providers whose API key
// is configured are tried). Returns OpenAI-shaped JSON or SSE.

interface OAIMessage { role: "system" | "user" | "assistant"; content: string }
interface OAIBody {
  model?: string;
  messages: OAIMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

type ProviderId = "lovable" | "anthropic" | "openai" | "gemini" | "deepseek";

interface ProviderResult {
  ok: boolean;
  response: Response;
  /** True if we should try the next provider (credits/auth/overload/5xx). */
  shouldFallback: boolean;
  status: number;
  errorText?: string;
}

// Status codes that mean "this provider can't serve us right now — try another"
const FALLBACK_STATUSES = new Set([401, 402, 403, 429, 500, 502, 503, 504, 529]);

function shouldTryNext(status: number): boolean {
  return FALLBACK_STATUSES.has(status);
}

// --------------------------- Lovable AI Gateway ---------------------------
const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

function mapLovableModel(openaiModel?: string): string {
  if (!openaiModel) return "google/gemini-3-flash-preview";
  const m = openaiModel.toLowerCase();
  if (m.includes("nano") || m.includes("flash-lite") || m.includes("haiku") || m.includes("mini")) {
    return "google/gemini-2.5-flash-lite";
  }
  if (m.includes("pro") || m.includes("opus") || m.includes("sonnet") || m.includes("gpt-5")) {
    return "google/gemini-2.5-pro";
  }
  if (m.startsWith("google/") || m.startsWith("openai/")) return openaiModel;
  return "google/gemini-3-flash-preview";
}

async function callLovable(body: OAIBody): Promise<ProviderResult> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return {
      ok: false,
      shouldFallback: true,
      status: 0,
      response: jsonError("LOVABLE_API_KEY not configured", 500),
      errorText: "no key",
    };
  }

  const payload = {
    model: mapLovableModel(body.model),
    messages: body.messages,
    stream: !!body.stream,
    ...(typeof body.temperature === "number" ? { temperature: body.temperature } : {}),
    ...(body.max_tokens ? { max_tokens: body.max_tokens } : {}),
  };

  const upstream = await fetch(LOVABLE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error(`[lovable] ${upstream.status}:`, text.slice(0, 300));
    return {
      ok: false,
      shouldFallback: shouldTryNext(upstream.status),
      status: upstream.status,
      response: jsonError(text || "Lovable AI request failed", upstream.status),
      errorText: text,
    };
  }

  if (!body.stream) {
    const data = await upstream.json();
    return {
      ok: true,
      shouldFallback: false,
      status: 200,
      response: new Response(JSON.stringify({ ...data, _provider: "lovable" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Ai-Provider": "lovable" },
      }),
    };
  }

  // Lovable gateway streams OpenAI-compatible SSE — pass through
  return {
    ok: true,
    shouldFallback: false,
    status: 200,
    response: new Response(upstream.body, {
      status: 200,
      headers: { "Content-Type": "text/event-stream", "X-Ai-Provider": "lovable" },
    }),
  };
}

// --------------------------- Anthropic ---------------------------
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

function mapAnthropicModel(openaiModel?: string): string {
  if (!openaiModel) return "claude-sonnet-4-5-20250929";
  const m = openaiModel.toLowerCase();
  if (m.includes("flash-lite") || m.includes("nano") || m.includes("haiku")) {
    return "claude-haiku-4-5-20251001";
  }
  return "claude-sonnet-4-5-20250929";
}

async function callAnthropic(body: OAIBody): Promise<ProviderResult> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return {
      ok: false,
      shouldFallback: true,
      status: 0,
      response: jsonError("ANTHROPIC_API_KEY not configured", 500),
      errorText: "no key",
    };
  }

  const systemParts: string[] = [];
  const messages: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of body.messages || []) {
    if (m.role === "system") systemParts.push(m.content);
    else messages.push({ role: m.role, content: m.content });
  }

  const payload: Record<string, unknown> = {
    model: mapAnthropicModel(body.model),
    max_tokens: body.max_tokens ?? 4096,
    messages,
    stream: !!body.stream,
  };
  if (systemParts.length) payload.system = systemParts.join("\n\n");
  if (typeof body.temperature === "number") payload.temperature = body.temperature;

  const upstream = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error(`[anthropic] ${upstream.status}:`, text.slice(0, 300));
    return {
      ok: false,
      shouldFallback: shouldTryNext(upstream.status),
      status: upstream.status,
      response: jsonError(text || "Anthropic request failed", upstream.status === 529 ? 429 : upstream.status),
      errorText: text,
    };
  }

  // Non-streaming
  if (!body.stream) {
    const data = await upstream.json();
    const text = (data?.content || [])
      .filter((b: any) => b?.type === "text")
      .map((b: any) => b.text)
      .join("");
    const oaiShape = {
      id: data?.id ?? crypto.randomUUID(),
      object: "chat.completion",
      model: data?.model ?? payload.model,
      choices: [{
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: data?.stop_reason ?? "stop",
      }],
      usage: data?.usage ?? undefined,
      _provider: "anthropic",
    };
    return {
      ok: true,
      shouldFallback: false,
      status: 200,
      response: new Response(JSON.stringify(oaiShape), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Ai-Provider": "anthropic" },
      }),
    };
  }

  // Streaming: convert Anthropic SSE → OpenAI SSE
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            const rawLine = buffer.slice(0, idx).replace(/\r$/, "");
            buffer = buffer.slice(idx + 1);
            if (!rawLine.startsWith("data: ")) continue;
            const json = rawLine.slice(6).trim();
            if (!json) continue;
            try {
              const evt = JSON.parse(json);
              if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                send({ choices: [{ index: 0, delta: { content: evt.delta.text } }] });
              } else if (evt.type === "message_stop") {
                send({ choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
              }
            } catch { /* ignore partial */ }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error("[anthropic] stream error:", err);
      } finally {
        controller.close();
      }
    },
  });

  return {
    ok: true,
    shouldFallback: false,
    status: 200,
    response: new Response(stream, {
      status: 200,
      headers: { "Content-Type": "text/event-stream", "X-Ai-Provider": "anthropic" },
    }),
  };
}

// --------------------------- OpenAI ---------------------------
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function mapOpenAIModel(openaiModel?: string): string {
  if (!openaiModel) return "gpt-4o-mini";
  const m = openaiModel.toLowerCase();
  if (m.includes("nano") || m.includes("flash-lite") || m.includes("haiku") || m.includes("mini")) {
    return "gpt-4o-mini";
  }
  if (m.startsWith("gpt-")) return openaiModel;
  return "gpt-4o";
}

async function callOpenAI(body: OAIBody): Promise<ProviderResult> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return {
      ok: false,
      shouldFallback: true,
      status: 0,
      response: jsonError("OPENAI_API_KEY not configured", 500),
      errorText: "no key",
    };
  }

  const payload = {
    model: mapOpenAIModel(body.model),
    messages: body.messages,
    stream: !!body.stream,
    ...(typeof body.temperature === "number" ? { temperature: body.temperature } : {}),
    ...(body.max_tokens ? { max_tokens: body.max_tokens } : {}),
  };

  const upstream = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error(`[openai] ${upstream.status}:`, text.slice(0, 300));
    return {
      ok: false,
      shouldFallback: shouldTryNext(upstream.status),
      status: upstream.status,
      response: jsonError(text || "OpenAI request failed", upstream.status),
      errorText: text,
    };
  }

  if (!body.stream) {
    const data = await upstream.json();
    return {
      ok: true,
      shouldFallback: false,
      status: 200,
      response: new Response(JSON.stringify({ ...data, _provider: "openai" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Ai-Provider": "openai" },
      }),
    };
  }

  // OpenAI already streams in OpenAI format — pass-through
  return {
    ok: true,
    shouldFallback: false,
    status: 200,
    response: new Response(upstream.body, {
      status: 200,
      headers: { "Content-Type": "text/event-stream", "X-Ai-Provider": "openai" },
    }),
  };
}

// --------------------------- Gemini ---------------------------
function mapGeminiModel(openaiModel?: string): string {
  if (!openaiModel) return "gemini-2.5-flash";
  const m = openaiModel.toLowerCase();
  if (m.includes("nano") || m.includes("haiku") || m.includes("mini") || m.includes("flash-lite")) {
    return "gemini-2.5-flash-lite";
  }
  if (m.includes("pro") || m.includes("opus") || m.includes("gpt-5")) {
    return "gemini-2.5-pro";
  }
  return "gemini-2.5-flash";
}

async function callGemini(body: OAIBody): Promise<ProviderResult> {
  const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    return {
      ok: false,
      shouldFallback: true,
      status: 0,
      response: jsonError("GEMINI_API_KEY not configured", 500),
      errorText: "no key",
    };
  }

  const model = mapGeminiModel(body.model);
  const systemParts: string[] = [];
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];
  for (const m of body.messages || []) {
    if (m.role === "system") {
      systemParts.push(m.content);
    } else {
      contents.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      });
    }
  }

  const payload: Record<string, unknown> = {
    contents,
    ...(systemParts.length ? { systemInstruction: { parts: [{ text: systemParts.join("\n\n") }] } } : {}),
    generationConfig: {
      ...(typeof body.temperature === "number" ? { temperature: body.temperature } : {}),
      ...(body.max_tokens ? { maxOutputTokens: body.max_tokens } : {}),
    },
  };

  const action = body.stream ? "streamGenerateContent" : "generateContent";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}?key=${apiKey}${body.stream ? "&alt=sse" : ""}`;

  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error(`[gemini] ${upstream.status}:`, text.slice(0, 300));
    return {
      ok: false,
      shouldFallback: shouldTryNext(upstream.status),
      status: upstream.status,
      response: jsonError(text || "Gemini request failed", upstream.status),
      errorText: text,
    };
  }

  if (!body.stream) {
    const data = await upstream.json();
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((p: any) => p?.text || "")
      .join("");
    const oaiShape = {
      id: crypto.randomUUID(),
      object: "chat.completion",
      model,
      choices: [{
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: data?.candidates?.[0]?.finishReason?.toLowerCase() ?? "stop",
      }],
      usage: data?.usageMetadata,
      _provider: "gemini",
    };
    return {
      ok: true,
      shouldFallback: false,
      status: 200,
      response: new Response(JSON.stringify(oaiShape), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Ai-Provider": "gemini" },
      }),
    };
  }

  // Streaming: Gemini SSE → OpenAI SSE
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            const rawLine = buffer.slice(0, idx).replace(/\r$/, "");
            buffer = buffer.slice(idx + 1);
            if (!rawLine.startsWith("data: ")) continue;
            const json = rawLine.slice(6).trim();
            if (!json) continue;
            try {
              const evt = JSON.parse(json);
              const text = (evt?.candidates?.[0]?.content?.parts || [])
                .map((p: any) => p?.text || "")
                .join("");
              if (text) send({ choices: [{ index: 0, delta: { content: text } }] });
            } catch { /* ignore partial */ }
          }
        }
        send({ choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error("[gemini] stream error:", err);
      } finally {
        controller.close();
      }
    },
  });

  return {
    ok: true,
    shouldFallback: false,
    status: 200,
    response: new Response(stream, {
      status: 200,
      headers: { "Content-Type": "text/event-stream", "X-Ai-Provider": "gemini" },
    }),
  };
}

// --------------------------- DeepSeek ---------------------------
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

function mapDeepSeekModel(openaiModel?: string): string {
  if (!openaiModel) return "deepseek-chat";
  const m = openaiModel.toLowerCase();
  if (m.includes("reason") || m.includes("pro") || m.includes("opus") || m.includes("gpt-5")) {
    return "deepseek-reasoner";
  }
  return "deepseek-chat";
}

async function callDeepSeek(body: OAIBody): Promise<ProviderResult> {
  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) {
    return {
      ok: false,
      shouldFallback: true,
      status: 0,
      response: jsonError("DEEPSEEK_API_KEY not configured", 500),
      errorText: "no key",
    };
  }

  const payload = {
    model: mapDeepSeekModel(body.model),
    messages: body.messages,
    stream: !!body.stream,
    ...(typeof body.temperature === "number" ? { temperature: body.temperature } : {}),
    ...(body.max_tokens ? { max_tokens: body.max_tokens } : {}),
  };

  const upstream = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error(`[deepseek] ${upstream.status}:`, text.slice(0, 300));
    return {
      ok: false,
      shouldFallback: shouldTryNext(upstream.status),
      status: upstream.status,
      response: jsonError(text || "DeepSeek request failed", upstream.status),
      errorText: text,
    };
  }

  if (!body.stream) {
    const data = await upstream.json();
    return {
      ok: true,
      shouldFallback: false,
      status: 200,
      response: new Response(JSON.stringify({ ...data, _provider: "deepseek" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Ai-Provider": "deepseek" },
      }),
    };
  }

  // DeepSeek already streams in OpenAI SSE format — pass-through
  return {
    ok: true,
    shouldFallback: false,
    status: 200,
    response: new Response(upstream.body, {
      status: 200,
      headers: { "Content-Type": "text/event-stream", "X-Ai-Provider": "deepseek" },
    }),
  };
}

// --------------------------- Router ---------------------------
function jsonError(text: string, status: number): Response {
  return new Response(JSON.stringify({ error: text }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const PROVIDERS: Record<ProviderId, (body: OAIBody) => Promise<ProviderResult>> = {
  lovable: callLovable,
  anthropic: callAnthropic,
  openai: callOpenAI,
  gemini: callGemini,
  deepseek: callDeepSeek,
};

function getProviderOrder(): ProviderId[] {
  // Allow override via env: AI_PROVIDER_ORDER="lovable,openai,anthropic,gemini,deepseek"
  const raw = Deno.env.get("AI_PROVIDER_ORDER");
  if (raw) {
    const parsed = raw.split(",").map((s) => s.trim().toLowerCase()).filter(
      (s): s is ProviderId =>
        s === "lovable" || s === "anthropic" || s === "openai" ||
        s === "gemini" || s === "deepseek",
    );
    if (parsed.length) return parsed;
  }
  // Default: Lovable AI Gateway first (managed, free quota), then external providers.
  return ["lovable", "anthropic", "openai", "deepseek", "gemini"];
}

/**
 * OpenAI-compatible chat completion with automatic provider fallback.
 * Tries providers in order; switches on out-of-credit / auth / rate-limit / 5xx.
 */
export async function callChatCompletion(body: OAIBody): Promise<Response> {
  const order = getProviderOrder();
  const attempts: { provider: ProviderId; status: number; error?: string }[] = [];
  let lastResult: ProviderResult | null = null;

  for (const id of order) {
    try {
      const result = await PROVIDERS[id](body);
      lastResult = result;
      attempts.push({ provider: id, status: result.status, error: result.errorText?.slice(0, 200) });

      if (result.ok) {
        // Success — annotate and return
        const headers = new Headers(result.response.headers);
        headers.set("X-Ai-Provider", id);
        headers.set("X-Ai-Attempts", attempts.map((a) => `${a.provider}:${a.status}`).join(","));
        if (attempts.length > 1) {
          console.log(`[ai-router] succeeded via ${id} after ${attempts.length} attempts`);
        }
        return new Response(result.response.body, {
          status: result.response.status,
          headers,
        });
      }

      if (!result.shouldFallback) {
        // A real client error (e.g., 400 bad input) — don't try other providers
        return result.response;
      }

      console.warn(`[ai-router] ${id} failed (${result.status}), trying next provider`);
    } catch (err) {
      console.error(`[ai-router] ${id} threw:`, err);
      attempts.push({ provider: id, status: 0, error: err instanceof Error ? err.message : String(err) });
    }
  }

  // Every provider failed
  const summary = attempts.map((a) => `${a.provider}=${a.status}`).join(", ");
  console.error(`[ai-router] all providers exhausted: ${summary}`);
  return new Response(JSON.stringify({
    error: "All AI providers are currently unavailable",
    attempts,
  }), {
    status: lastResult?.status && lastResult.status >= 400 ? lastResult.status : 503,
    headers: { "Content-Type": "application/json", "X-Ai-Attempts": summary },
  });
}
