import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ParseCvInput = z.object({
  cvText: z.string().min(20).max(50000),
});

export const parseCvWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => ParseCvInput.parse(input))
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

type MatchApplicationRecord = {
  applicant_id: string;
  job_id: string;
  jobs: {
    title: string;
    description: string;
    requirements: string | null;
    recruiter_id: string;
  };
};

type SupabaseWriteClient = {
  from: (table: string) => {
    insert: (value: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
};

export const matchApplicationWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => MatchInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { callSumopod, extractJson } = await import("./sumopod.server");

    // Verify recruiter owns the job for this application
    const { data: app, error: appErr } = await supabase
      .from("applications")
      .select(
        "id, job_id, applicant_id, jobs!inner(title, description, requirements, recruiter_id)",
      )
      .eq("id", data.applicationId)
      .single();
    if (appErr || !app) throw new Error("Application not found");
    const application = app as unknown as MatchApplicationRecord;
    const job = application.jobs;
    if (job.recruiter_id !== userId) throw new Error("Not authorized for this job");

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("full_name, headline, summary, skills, experience, education, cv_text")
      .eq("id", application.applicant_id)
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

const JobActionInput = z.object({
  jobId: z.string().uuid(),
});

const ApplicationActionInput = z.object({
  applicationId: z.string().uuid(),
  seniority: z.enum(["junior", "mid", "senior"]).default("mid"),
});

const JobDescriptionInput = z.object({
  title: z.string().min(3).max(120),
  company: z.string().min(2).max(120).optional().default(""),
  location: z.string().max(120).optional().default(""),
  employmentType: z.string().max(80).optional().default("Full-time"),
  seniority: z.enum(["junior", "mid", "senior", "lead"]).default("mid"),
  mustHaveSkills: z.string().max(800).optional().default(""),
});

const CareerAdvisorInput = z.object({
  question: z.string().min(5).max(1200),
});

export const generateCoverLetterWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => JobActionInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { callSumopod } = await import("./sumopod.server");

    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("title, company, location, description, requirements")
      .eq("id", data.jobId)
      .single();
    if (jobErr || !job) throw new Error("Job not found");

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("full_name, headline, summary, skills, experience, education, cv_text")
      .eq("id", userId)
      .single();
    if (profErr || !profile)
      throw new Error("Complete your profile before generating a cover letter");

    return callSumopod(
      [
        {
          role: "system",
          content:
            "You are a concise career assistant. Write a professional Indonesian cover letter tailored to the role. Keep it under 260 words, specific, confident, and honest. Return plain text only.",
        },
        {
          role: "user",
          content: `JOB
Title: ${job.title}
Company: ${job.company}
Location: ${job.location ?? ""}
Description: ${job.description}
Requirements: ${job.requirements ?? ""}

CANDIDATE
Name: ${profile.full_name ?? ""}
Headline: ${profile.headline ?? ""}
Summary: ${profile.summary ?? ""}
Skills: ${(profile.skills ?? []).join(", ")}
Experience: ${JSON.stringify(profile.experience ?? [])}
Education: ${JSON.stringify(profile.education ?? [])}
CV excerpt: ${(profile.cv_text ?? "").slice(0, 2500)}`,
        },
      ],
      { temperature: 0.4 },
    );
  });

export const generateJobDescriptionWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => JobDescriptionInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { callSumopod, extractJson } = await import("./sumopod.server");

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (!roles?.some((r) => r.role === "recruiter" || r.role === "admin")) {
      throw new Error("Only recruiters can generate job descriptions");
    }

    const raw = await callSumopod(
      [
        {
          role: "system",
          content:
            'You are an HR writing assistant. Return STRICT JSON only: { "description": string, "requirements": string }. Use Indonesian, clear sections, measurable responsibilities, and realistic requirements.',
        },
        {
          role: "user",
          content: `Create a job post for:
Title: ${data.title}
Company: ${data.company}
Location: ${data.location}
Employment type: ${data.employmentType}
Seniority: ${data.seniority}
Must-have skills: ${data.mustHaveSkills || "Not specified"}`,
        },
      ],
      { jsonMode: true, temperature: 0.35 },
    );

    const parsed = extractJson(raw) as Record<string, unknown>;
    return {
      description: String(parsed.description ?? ""),
      requirements: String(parsed.requirements ?? ""),
    };
  });

export const generateInterviewQuestionsWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => ApplicationActionInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { callSumopod } = await import("./sumopod.server");

    const { data: app, error } = await supabase
      .from("applications")
      .select(
        "id, job_id, applicant_id, jobs!inner(title, description, requirements, recruiter_id)",
      )
      .eq("id", data.applicationId)
      .single();
    if (error || !app) throw new Error("Application not found");
    const application = app as unknown as MatchApplicationRecord;
    const job = application.jobs;
    if (job.recruiter_id !== userId) throw new Error("Not authorized for this application");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, headline, summary, skills, experience, education")
      .eq("id", application.applicant_id)
      .single();

    const text = await callSumopod(
      [
        {
          role: "system",
          content:
            "You are a recruiter interview designer. Generate 10 practical interview questions in Indonesian. Group them into Technical, Behavioral, and Role Fit. Include 2 follow-up probes. Return plain markdown.",
        },
        {
          role: "user",
          content: `Seniority: ${data.seniority}
Job: ${job.title}
Description: ${job.description}
Requirements: ${job.requirements ?? ""}
Candidate: ${JSON.stringify(profile ?? {})}`,
        },
      ],
      { temperature: 0.35 },
    );

    const writer = supabase as unknown as SupabaseWriteClient;
    await writer.from("interview_questions").insert({
      application_id: data.applicationId,
      hr_id: userId,
      job_id: application.job_id,
      seniority: data.seniority,
      questions_data: { markdown: text },
    });

    return text;
  });

export const getCareerAdviceWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => CareerAdvisorInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { callSumopod } = await import("./sumopod.server");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, headline, summary, skills, experience, education")
      .eq("id", userId)
      .single();
    const { data: jobs } = await supabase
      .from("jobs")
      .select("title, company, location, requirements")
      .eq("status", "open")
      .limit(8);

    const answer = await callSumopod(
      [
        {
          role: "system",
          content:
            "You are an Indonesian career path advisor. Give actionable, personalized advice with clear next steps, realistic role targets, and skill priorities. Keep it concise.",
        },
        {
          role: "user",
          content: `Question: ${data.question}
Profile: ${JSON.stringify(profile ?? {})}
Relevant open jobs: ${JSON.stringify(jobs ?? [])}`,
        },
      ],
      { temperature: 0.45 },
    );

    const writer = supabase as unknown as SupabaseWriteClient;
    await writer.from("ai_career_consultations").insert({
      user_id: userId,
      question: data.question,
      answer,
    });

    return answer;
  });

export const analyzeSkillGapWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => JobActionInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { callSumopod } = await import("./sumopod.server");

    const { data: job } = await supabase
      .from("jobs")
      .select("title, description, requirements")
      .eq("id", data.jobId)
      .single();
    const { data: profile } = await supabase
      .from("profiles")
      .select("headline, summary, skills, experience, education")
      .eq("id", userId)
      .single();
    if (!job || !profile) throw new Error("Profile or job data is incomplete");

    return callSumopod(
      [
        {
          role: "system",
          content:
            "You are a skill gap analyst. Compare a candidate profile against a role. Return concise Indonesian markdown with: Match Snapshot, Strong Skills, Missing Skills, 30-Day Learning Plan, and Application Tips.",
        },
        {
          role: "user",
          content: `Job: ${JSON.stringify(job)}
Candidate: ${JSON.stringify(profile)}`,
        },
      ],
      { temperature: 0.3 },
    );
  });

export const generateCandidateInsightsWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { callSumopod } = await import("./sumopod.server");

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (!roles?.some((role) => role.role === "recruiter" || role.role === "admin")) {
      throw new Error("Only recruiters can generate candidate insights");
    }

    const { data: applications, error } = await supabase
      .from("applications")
      .select(
        `
        id, status, match_score, created_at,
        jobs!inner(id, title, recruiter_id),
        profiles:applicant_id(headline, skills, location)
      `,
      )
      .eq("jobs.recruiter_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    const insights = await callSumopod(
      [
        {
          role: "system",
          content:
            "You are a talent analytics assistant. Summarize the recruiter's applicant pool in Indonesian. Avoid private personal details. Include pipeline health, notable skill clusters, risks, and next actions. Return concise plain text only.",
        },
        { role: "user", content: JSON.stringify(applications ?? []) },
      ],
      { temperature: 0.35 },
    );

    return insights;
  });
