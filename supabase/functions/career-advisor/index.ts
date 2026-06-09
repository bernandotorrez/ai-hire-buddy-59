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
    await enforceRateLimit(user.id, "career-advisor", 15, 24);

    const { question } = await req.json();
    if (!question || String(question).length > 1000)
      return jsonResponse({ error: "question_required" }, 400);

    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, headline, summary, skills, experience, education")
      .eq("id", user.id)
      .single();
    const { data: jobs } = await supabase
      .from("jobs")
      .select("title, company, location, requirements")
      .eq("status", "open")
      .limit(20);

    const answer = await callAi([
      {
        role: "system",
        content:
          "You are an Indonesian career advisor. Give practical next steps, target roles, and prioritized skill recommendations. Return plain text only.",
      },
      {
        role: "user",
        content: `Question: ${question}\nProfile: ${JSON.stringify(profile)}\nOpen jobs: ${JSON.stringify(jobs ?? [])}`,
      },
    ]);

    await supabase.from("ai_career_consultations").insert({ user_id: user.id, question, answer });
    const { data: oldRows } = await supabase
      .from("ai_career_consultations")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(10, 100);
    if (oldRows?.length) {
      await supabase
        .from("ai_career_consultations")
        .delete()
        .in(
          "id",
          oldRows.map((row) => row.id),
        );
    }

    return jsonResponse({ answer });
  } catch (error) {
    if (rateLimitError(error)) return jsonResponse({ error: "rate_limit_exceeded" }, 429);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "career_advisor_failed" },
      500,
    );
  }
});
