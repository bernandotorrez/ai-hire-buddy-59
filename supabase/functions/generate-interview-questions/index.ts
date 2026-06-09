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
    await requireRole(user.id, "recruiter");
    await enforceRateLimit(user.id, "generate-interview-questions", 30, 24);

    const { application_id, seniority = "mid" } = await req.json();
    if (!application_id) return jsonResponse({ error: "application_id_required" }, 400);

    const supabase = createServiceClient();
    const { data: app } = await supabase
      .from("applications")
      .select(
        "id, job_id, applicant_id, jobs!inner(title, description, requirements, recruiter_id)",
      )
      .eq("id", application_id)
      .single();
    if (!app) return jsonResponse({ error: "application_not_found" }, 404);

    const job = app.jobs as unknown as {
      title: string;
      description: string;
      requirements: string | null;
      recruiter_id: string;
    };
    if (job.recruiter_id !== user.id) return jsonResponse({ error: "forbidden" }, 403);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, headline, summary, skills, experience, education")
      .eq("id", app.applicant_id)
      .single();
    const raw = await callAi(
      [
        {
          role: "system",
          content:
            'Generate interview questions in Indonesian. Return STRICT JSON: { "technical": string[], "behavioral": string[], "situational": string[] }.',
        },
        {
          role: "user",
          content: `Seniority: ${seniority}\nJob: ${JSON.stringify(job)}\nCandidate: ${JSON.stringify(profile)}`,
        },
      ],
      true,
      0.35,
    );
    const questions = extractJson(raw);

    await supabase.from("interview_questions").insert({
      application_id,
      hr_id: user.id,
      job_id: app.job_id,
      seniority,
      questions_data: questions,
    });

    return jsonResponse({ questions });
  } catch (error) {
    if (rateLimitError(error)) return jsonResponse({ error: "rate_limit_exceeded" }, 429);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "generate_interview_questions_failed" },
      500,
    );
  }
});
