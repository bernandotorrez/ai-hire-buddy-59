type Message = { role: "system" | "user" | "assistant"; content: string };

export async function callAi(messages: Message[], jsonMode = false, temperature = 0.3) {
  const apiKey = Deno.env.get("AI_SUMOPOD_API_KEY") ?? Deno.env.get("SUMOPOD_API_KEY");
  if (!apiKey) throw new Error("AI key is not configured");

  const res = await fetch("https://ai.sumopod.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gemini/gemini-2.5-flash-lite",
      messages,
      temperature,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`AI error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned no content");
  return String(content);
}

export function extractJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) return JSON.parse(fenced[1]);
    const object = text.match(/\{[\s\S]*\}/);
    if (object) return JSON.parse(object[0]);
  }
  throw new Error("Could not parse JSON from AI response");
}

export function rateLimitError(error: unknown) {
  return error instanceof Error && error.message === "rate_limit_exceeded";
}
