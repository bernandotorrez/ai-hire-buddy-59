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
    await enforceRateLimit(user.id, "match-cv", 50, 1);

    const { application_id } = await req.json();
    if (!application_id) return jsonResponse({ error: "application_id_required" }, 400);

    const supabase = createServiceClient();
    const { data: app, error } = await supabase
      .from("applications")
      .select("id, applicant_id, jobs!inner(title, description, requirements, recruiter_id)")
      .eq("id", application_id)
      .single();
    if (error || !app) return jsonResponse({ error: "application_not_found" }, 404);

    const job = app.jobs as unknown as {
      title: string;
      description: string;
      requirements: string | null;
      recruiter_id: string;
    };
    if (job.recruiter_id !== user.id) return jsonResponse({ error: "forbidden" }, 403);

    await supabase.from("applications").update({ status: "reviewed" }).eq("id", application_id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, headline, summary, skills, experience, education, cv_text")
      .eq("id", app.applicant_id)
      .single();

    const raw = await callAi(
      [
        {
          role: "system",
          content:
            'You are an expert recruiter. Return STRICT JSON: { "score": number, "summary": string, "strengths": string[], "gaps": string[] }.',
        },
        {
          role: "user",
          content: `Job: ${JSON.stringify(job)}\nCandidate: ${JSON.stringify(profile)}`,
        },
      ],
      true,
      0.2,
    );
    const parsed = extractJson(raw) as {
      score?: number;
      summary?: string;
      strengths?: string[];
      gaps?: string[];
    };
    const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));
    const summary = [
      parsed.summary,
      parsed.strengths?.length ? `Strengths: ${parsed.strengths.join(", ")}` : "",
      parsed.gaps?.length ? `Gaps: ${parsed.gaps.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    await supabase
      .from("applications")
      .update({ match_score: score, match_summary: summary })
      .eq("id", application_id);
    return jsonResponse({ score, summary });
  } catch (error) {
    if (rateLimitError(error)) return jsonResponse({ error: "rate_limit_exceeded" }, 429);
    return jsonResponse({ error: error instanceof Error ? error.message : "match_cv_failed" }, 500);
  }
});
