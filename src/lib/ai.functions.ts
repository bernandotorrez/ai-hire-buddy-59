import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ParseCvInput = z.object({
  cvText: z.string().min(20).max(50000),
});

export const parseCvWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ParseCvInput.parse(input))
  .handler(async ({ data }) => {
    const { callSumopod, extractJson } = await import("./sumopod.server");

    const system = `You are an expert resume parser. Extract structured information from the resume text.
Return STRICT JSON only with this schema:
{
  "full_name": string,
  "headline": string,
  "email": string,
  "phone": string,
  "location": string,
  "summary": string,
  "skills": string[],
  "experience": [{ "title": string, "company": string, "start": string, "end": string, "description": string }],
  "education": [{ "degree": string, "school": string, "start": string, "end": string }]
}
Use empty strings or empty arrays when missing. Do not include any prose outside JSON.`;

    const raw = await callSumopod(
      [
        { role: "system", content: system },
        { role: "user", content: `Resume text:\n\n${data.cvText}` },
      ],
      { jsonMode: true },
    );
    const parsed = extractJson(raw) as Record<string, unknown>;
    return {
      full_name: String(parsed.full_name ?? ""),
      headline: String(parsed.headline ?? ""),
      email: String(parsed.email ?? ""),
      phone: String(parsed.phone ?? ""),
      location: String(parsed.location ?? ""),
      summary: String(parsed.summary ?? ""),
      skills: Array.isArray(parsed.skills) ? (parsed.skills as string[]) : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
    };
  });

const MatchInput = z.object({
  applicationId: z.string().uuid(),
});

export const matchApplicationWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MatchInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { callSumopod, extractJson } = await import("./sumopod.server");

    // Verify recruiter owns the job for this application
    const { data: app, error: appErr } = await supabase
      .from("applications")
      .select("id, job_id, applicant_id, jobs!inner(title, description, requirements, recruiter_id)")
      .eq("id", data.applicationId)
      .single();
    if (appErr || !app) throw new Error("Application not found");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = (app as any).jobs;
    if (job.recruiter_id !== userId) throw new Error("Not authorized for this job");

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select("full_name, headline, summary, skills, experience, education, cv_text")
      .eq("id", (app as any).applicant_id)
      .single();
    if (profErr || !profile) throw new Error("Applicant profile not found");

    const system = `You are an expert technical recruiter. Compare the candidate against the job and return STRICT JSON:
{ "score": number (0-100), "summary": string (2-3 sentences), "strengths": string[], "gaps": string[] }
Score must reflect skills match, experience relevance, and requirements coverage.`;

    const userPrompt = `JOB
Title: ${job.title}
Description: ${job.description}
Requirements: ${job.requirements ?? "N/A"}

CANDIDATE
Name: ${profile.full_name ?? ""}
Headline: ${profile.headline ?? ""}
Summary: ${profile.summary ?? ""}
Skills: ${(profile.skills ?? []).join(", ")}
Experience: ${JSON.stringify(profile.experience ?? [])}
Education: ${JSON.stringify(profile.education ?? [])}
CV text (excerpt): ${(profile.cv_text ?? "").slice(0, 3000)}`;

    const raw = await callSumopod(
      [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      { jsonMode: true },
    );
    const parsed = extractJson(raw) as {
      score?: number;
      summary?: string;
      strengths?: string[];
      gaps?: string[];
    };
    const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));
    const summary = [
      parsed.summary ?? "",
      parsed.strengths?.length ? `Strengths: ${parsed.strengths.join(", ")}` : "",
      parsed.gaps?.length ? `Gaps: ${parsed.gaps.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const { error: upErr } = await supabase
      .from("applications")
      .update({ match_score: score, match_summary: summary })
      .eq("id", data.applicationId);
    if (upErr) throw new Error(upErr.message);

    return { score, summary };
  });
