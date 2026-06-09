import { callAi, rateLimitError } from "../_shared/ai.ts";
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
    await requireRole(user.id, "recruiter");
    await enforceRateLimit(user.id, "generate-candidate-insights", 10, 1);

    const { job_id } = await req.json();
    if (!job_id) return jsonResponse({ error: "job_id_required" }, 400);

    const supabase = createServiceClient();
    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, recruiter_id, description, requirements")
      .eq("id", job_id)
      .single();
    if (!job) return jsonResponse({ error: "job_not_found" }, 404);
    if (job.recruiter_id !== user.id) return jsonResponse({ error: "forbidden" }, 403);

    const { data: applications } = await supabase
      .from("applications")
      .select("status, match_score, profiles:applicant_id(headline, skills, location)")
      .eq("job_id", job_id);

    const insights = await callAi([
      {
        role: "system",
        content:
          "You are a talent analytics assistant. Summarize candidate pool insights in Indonesian. Avoid exposing private personal details. Return plain text only.",
      },
      {
        role: "user",
        content: `Job: ${JSON.stringify(job)}\nApplications: ${JSON.stringify(applications ?? [])}`,
      },
    ]);

    await supabase
      .from("ai_insights_cache")
      .upsert({ job_id, insights, updated_at: new Date().toISOString() }, { onConflict: "job_id" });
    return jsonResponse({ insights });
  } catch (error) {
    if (rateLimitError(error)) return jsonResponse({ error: "rate_limit_exceeded" }, 429);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "generate_candidate_insights_failed" },
      500,
    );
  }
});
