// Anthropic Claude adapter — exposes an OpenAI-compatible `chat/completions` interface
// so existing edge functions/clients keep working without changes.
//
// Accepts an OpenAI-style request body and returns a Response whose body is either
// (a) JSON shaped like { choices: [{ message: { content } }] }, or
// (b) SSE chunks shaped like `data: { choices:[{ delta:{ content } }] }\n\n` ending with `data: [DONE]`.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

function mapModel(openaiModel?: string): string {
  if (!openaiModel) return DEFAULT_MODEL;
  const m = openaiModel.toLowerCase();
  if (m.includes("pro") || m.includes("opus") || m.includes("gpt-5") && !m.includes("mini") && !m.includes("nano")) {
    return "claude-sonnet-4-5-20250929";
  }
  if (m.includes("flash-lite") || m.includes("nano") || m.includes("haiku")) {
    return "claude-haiku-4-5-20251001";
  }
  return DEFAULT_MODEL;
}

interface OAIMessage { role: "system" | "user" | "assistant"; content: string }
interface OAIBody {
  model?: string;
  messages: OAIMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export async function callChatCompletion(body: OAIBody): Promise<Response> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Split system prompts from chat messages
  const systemParts: string[] = [];
  const messages: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of body.messages || []) {
    if (m.role === "system") systemParts.push(m.content);
    else messages.push({ role: m.role, content: m.content });
  }

  const payload: Record<string, unknown> = {
    model: mapModel(body.model),
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
    console.error("Anthropic error:", upstream.status, text);
    // Map upstream codes to similar semantics as before
    let status = upstream.status;
    if (status === 529) status = 429; // overloaded -> rate-limit-ish
    return new Response(JSON.stringify({ error: text || "Anthropic request failed" }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

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
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: text },
          finish_reason: data?.stop_reason ?? "stop",
        },
      ],
      usage: data?.usage ?? undefined,
    };
    return new Response(JSON.stringify(oaiShape), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Streaming: convert Anthropic SSE → OpenAI SSE chunks
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";

      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

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
                send({
                  choices: [{ index: 0, delta: { content: evt.delta.text } }],
                });
              } else if (evt.type === "message_stop") {
                send({ choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
              }
            } catch {
              // ignore partial
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error("Anthropic stream error:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}
