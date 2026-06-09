import { callAi, extractJson, rateLimitError } from "../_shared/ai.ts";
import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { enforceRateLimit, requireUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    const user = await requireUser(req);
    await enforceRateLimit(user.id, "parse-cv", 10, 1);

    const body = await req.json();
    const cvText = String(body.cvText ?? "").slice(0, 50000);
    if (cvText.trim().length < 20) return jsonResponse({ error: "cv_text_required" }, 400);

    const raw = await callAi(
      [
        {
          role: "system",
          content:
            'Extract resume data. Return STRICT JSON: { "full_name": string, "headline": string, "email": string, "phone": string, "location": string, "summary": string, "skills": string[], "experience": array, "education": array }.',
        },
        { role: "user", content: cvText },
      ],
      true,
      0.2,
    );

    return jsonResponse(extractJson(raw));
  } catch (error) {
    if (rateLimitError(error)) return jsonResponse({ error: "rate_limit_exceeded" }, 429);
    return jsonResponse({ error: error instanceof Error ? error.message : "parse_cv_failed" }, 500);
  }
});
