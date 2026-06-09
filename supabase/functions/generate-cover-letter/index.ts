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
    await requireRole(user.id, "job_seeker");
    await enforceRateLimit(user.id, "generate-cover-letter", 20, 24);

    const { job_id, language = "id" } = await req.json();
    if (!job_id) return jsonResponse({ error: "job_id_required" }, 400);

    const supabase = createServiceClient();
    const { data: job } = await supabase
      .from("jobs")
      .select("title, company, location, description, requirements")
      .eq("id", job_id)
      .single();
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, headline, summary, skills, experience, education, cv_text")
      .eq("id", user.id)
      .single();

    const content = await callAi([
      {
        role: "system",
        content: `Write a concise ${language === "en" ? "English" : "Indonesian"} cover letter under 260 words. Return plain text only.`,
      },
      {
        role: "user",
        content: `Job: ${JSON.stringify(job)}\nCandidate: ${JSON.stringify(profile)}`,
      },
    ]);

    return jsonResponse({ content });
  } catch (error) {
    if (rateLimitError(error)) return jsonResponse({ error: "rate_limit_exceeded" }, 429);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "generate_cover_letter_failed" },
      500,
    );
  }
});
