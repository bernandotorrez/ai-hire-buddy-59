// Server-only Sumopod AI client
// Endpoint: https://ai.sumopod.com (OpenAI-compatible)
// Model: gemini/gemini-2.5-flash-lite

const SUMOPOD_BASE_URL = "https://ai.sumopod.com/v1";
const SUMOPOD_MODEL = "gemini/gemini-2.5-flash-lite";

export interface SumopodMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callSumopod(
  messages: SumopodMessage[],
  opts: { jsonMode?: boolean; temperature?: number } = {},
): Promise<string> {
  const apiKey = process.env.SUMOPOD_API_KEY;
  if (!apiKey) throw new Error("SUMOPOD_API_KEY is not configured");

  const res = await fetch(`${SUMOPOD_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: SUMOPOD_MODEL,
      messages,
      temperature: opts.temperature ?? 0.2,
      ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sumopod API error ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Sumopod returned no content");
  return content;
}

export function extractJson(text: string): unknown {
  // Try direct parse, then fenced code block, then first {...} block
  try {
    return JSON.parse(text);
  } catch {
    /* fallthrough */
  }
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {
      /* fallthrough */
    }
  }
  const brace = text.match(/\{[\s\S]*\}/);
  if (brace) {
    try {
      return JSON.parse(brace[0]);
    } catch {
      /* fallthrough */
    }
  }
  throw new Error("Could not parse JSON from AI response");
}
