import { callAi, extractJson, rateLimitError } from "../_shared/ai.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { enforceRateLimit, requireRole, requireUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    const user = await requireUser(req);
    await requireRole(user.id, "recruiter");
    await enforceRateLimit(user.id, "generate-job-description", 20, 24);

    const body = await req.json();
    const raw = await callAi(
      [
        {
          role: "system",
          content:
            'Create an Indonesian job description. Return STRICT JSON: { "description": string, "requirements": string, "responsibilities": string[], "required_qualifications": string[], "benefits": string[] }.',
        },
        { role: "user", content: JSON.stringify(body) },
      ],
      true,
      0.35,
    );

    return jsonResponse(extractJson(raw));
  } catch (error) {
    if (rateLimitError(error)) return jsonResponse({ error: "rate_limit_exceeded" }, 429);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "generate_job_description_failed" },
      500,
    );
  }
});
