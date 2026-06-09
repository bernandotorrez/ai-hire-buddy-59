import { callAi, extractJson, rateLimitError } from "../_shared/ai.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import {
  createServiceClient,
  enforceRateLimit,
  requireRole,
  requireUser,
} from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    const user = await requireUser(req);
    await requireRole(user.id, "job_seeker");
    await enforceRateLimit(user.id, "analyze-skill-gap", 20, 24);

    const { job_id } = await req.json();
    if (!job_id) return jsonResponse({ error: "job_id_required" }, 400);

    const supabase = createServiceClient();
    const { data: job } = await supabase
      .from("jobs")
      .select("title, description, requirements")
      .eq("id", job_id)
      .single();
    const { data: profile } = await supabase
      .from("profiles")
      .select("headline, summary, skills, experience, education")
      .eq("id", user.id)
      .single();

    const raw = await callAi(
      [
        {
          role: "system",
          content:
            'Analyze skill gap. Return STRICT JSON: { "matched_skills": string[], "gap_skills": [{ "skill": string, "estimated_time": string, "resource_types": string[] }], "learning_plan": string[] }.',
        },
        {
          role: "user",
          content: `Job: ${JSON.stringify(job)}\nCandidate: ${JSON.stringify(profile)}`,
        },
      ],
      true,
      0.3,
    );

    return jsonResponse(extractJson(raw));
  } catch (error) {
    if (rateLimitError(error)) return jsonResponse({ error: "rate_limit_exceeded" }, 429);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "analyze_skill_gap_failed" },
      500,
    );
  }
});
