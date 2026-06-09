import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AIInsightsSkeleton,
  ApplicantTableSkeleton,
  ApplicationCardSkeleton,
  MatchScoreSkeleton,
} from "@/components/loading-skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useApplicantsRealtime } from "@/hooks/use-applicants-realtime";
import { useApplicationsRealtime } from "@/hooks/use-applications-realtime";
import {
  generateCandidateInsightsWithAi,
  generateInterviewQuestionsWithAi,
  matchApplicationWithAi,
} from "@/lib/ai.functions";
import { toast } from "sonner";
import { Briefcase, Sparkles, Target } from "lucide-react";

export const Route = createFileRoute("/applications")({
  head: () => ({ meta: [{ title: "Applications - AI Hire Buddy" }] }),
  component: ApplicationsPage,
});

const statuses = ["submitted", "reviewed", "interviewed", "accepted", "rejected"] as const;

type SupabaseWriteClient = {
  from: (table: string) => {
    insert: (value: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
};

function ApplicationsPage() {
  const { user, isRecruiter, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (!user) return null;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {isRecruiter ? <RecruiterDashboard /> : <SeekerApplications />}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "accepted"
      ? "bg-success text-success-foreground"
      : status === "rejected"
        ? "bg-destructive text-destructive-foreground"
        : status === "interviewed"
          ? "bg-accent text-accent-foreground"
          : status === "reviewed"
            ? "bg-primary/10 text-primary"
            : "";
  return (
    <Badge className={tone} variant={tone ? "default" : "secondary"}>
      {status}
    </Badge>
  );
}

function SeekerApplications() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [apps, setApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const loadApps = useCallback(async () => {
    if (!user) return;
    setLoadingApps(true);
    await supabase
      .from("applications")
      .select("id, status, created_at, cover_letter, jobs(id, title, company, location)")
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setApps(data ?? []));
    setLoadingApps(false);
  }, [user]);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  useApplicationsRealtime(user?.id, loadApps);

  return (
    <>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">My Applications</h1>
      <p className="mt-1 text-muted-foreground">Track every role you have applied to.</p>
      <div className="mt-8 grid gap-4">
        {loadingApps &&
          Array.from({ length: 3 }).map((_, index) => <ApplicationCardSkeleton key={index} />)}
        {!loadingApps && apps.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            No applications yet.{" "}
            <Link to="/jobs" className="text-primary underline">
              Browse jobs
            </Link>
          </Card>
        )}
        {!loadingApps &&
          apps.map((application) => (
            <Card key={application.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link
                    to="/jobs/$id"
                    params={{ id: application.jobs.id }}
                    className="font-display text-lg font-semibold hover:text-primary"
                  >
                    {application.jobs.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {application.jobs.company} - {application.jobs.location ?? "Remote / Flexible"}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>
            </Card>
          ))}
      </div>
    </>
  );
}

function RecruiterDashboard() {
  const { user } = useAuth();
  const matchFn = useServerFn(matchApplicationWithAi);
  const interviewFn = useServerFn(generateInterviewQuestionsWithAi);
  const insightsFn = useServerFn(generateCandidateInsightsWithAi);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<any[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [matching, setMatching] = useState<string | null>(null);
  const [questioning, setQuestioning] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Record<string, string>>({});
  const [insights, setInsights] = useState("");
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoadingRows(true);
    const { data } = await supabase
      .from("applications")
      .select(
        `
        id, status, match_score, match_summary, cover_letter, created_at,
        jobs!inner(id, title, recruiter_id),
        profiles:applicant_id(id, full_name, headline, email, skills, summary, cv_url)
      `,
      )
      .eq("jobs.recruiter_id", user.id)
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoadingRows(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useApplicantsRealtime(user?.id, load);

  const runMatch = async (id: string) => {
    setMatching(id);
    try {
      const res = await matchFn({ data: { applicationId: id } });
      toast.success(`Match score: ${res.score}%`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Match failed");
    } finally {
      setMatching(null);
    }
  };

  const matchAll = async () => {
    const pending = rows.filter((row) => row.match_score == null);
    for (const row of pending) {
      await runMatch(row.id);
    }
  };

  const updateStatus = async (id: string, oldStatus: string, status: string) => {
    if (!user) return;
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    const writer = supabase as unknown as SupabaseWriteClient;
    const { error: logError } = await writer.from("application_status_logs").insert({
      application_id: id,
      changed_by: user.id,
      old_status: oldStatus,
      new_status: status,
    });
    if (logError) toast.error(logError.message);
    toast.success("Application status updated");
    await load();
  };

  const generateQuestions = async (id: string) => {
    setQuestioning(id);
    try {
      const text = await interviewFn({ data: { applicationId: id, seniority: "mid" } });
      setQuestions((current) => ({ ...current, [id]: text.trim() }));
      toast.success("Interview questions generated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate interview questions",
      );
    } finally {
      setQuestioning(null);
    }
  };

  const generateInsights = async () => {
    setInsightsLoading(true);
    try {
      const text = await insightsFn();
      setInsights(text.trim());
      setInsightsOpen(true);
      toast.success("Candidate insights ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate candidate insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Hiring Dashboard</h1>
          <p className="mt-1 text-muted-foreground">All applicants to your job postings.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/post-job">
            <Button variant="outline">
              <Briefcase className="mr-2 h-4 w-4" /> Post a job
            </Button>
          </Link>
          <Button
            onClick={matchAll}
            className="shadow-warm"
            disabled={rows.every((row) => row.match_score != null)}
          >
            <Sparkles className="mr-2 h-4 w-4" /> AI Match All
          </Button>
        </div>
      </div>

      <Card className="mt-8 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">AI Candidate Insights</h2>
            <p className="text-sm text-muted-foreground">
              Summarize the current applicant pool and suggested next actions.
            </p>
          </div>
          <div className="flex gap-2">
            {insights && (
              <Button variant="outline" onClick={() => setInsightsOpen((open) => !open)}>
                {insightsOpen ? "Hide" : "Show"}
              </Button>
            )}
            <Button onClick={generateInsights} disabled={insightsLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {insightsLoading
                ? "Generating..."
                : insights
                  ? "Refresh insights"
                  : "Generate insights"}
            </Button>
          </div>
        </div>
        {insightsLoading && <AIInsightsSkeleton />}
        {insights && insightsOpen && !insightsLoading && (
          <div className="mt-4 whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm text-foreground/90">
            {insights}
          </div>
        )}
      </Card>

      <div className="mt-8 grid gap-4">
        {loadingRows && <ApplicantTableSkeleton />}
        {!loadingRows && rows.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">No applications yet.</Card>
        )}
        {!loadingRows &&
          rows.map((row) => (
            <Card key={row.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">
                      {row.profiles?.full_name || "Unnamed candidate"}
                    </h3>
                    {row.profiles?.headline && (
                      <span className="text-sm text-muted-foreground">
                        - {row.profiles.headline}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Applied for{" "}
                    <span className="font-medium text-foreground">{row.jobs.title}</span> -{" "}
                    {row.profiles?.email}
                  </p>

                  {row.profiles?.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {row.profiles.skills.slice(0, 8).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {row.cover_letter && (
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer text-muted-foreground">
                        Cover letter
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap text-foreground/90">
                        {row.cover_letter}
                      </p>
                    </details>
                  )}

                  {row.match_summary && (
                    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                        <Target className="h-4 w-4" /> AI Match Analysis
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-foreground/90">
                        {row.match_summary}
                      </p>
                    </div>
                  )}

                  {questions[row.id] && (
                    <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
                      <div className="mb-2 text-sm font-medium">AI Interview Questions</div>
                      <div className="whitespace-pre-wrap text-sm text-foreground/90">
                        {questions[row.id]}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex w-full flex-col items-center gap-2 sm:w-44">
                  <Select
                    value={row.status}
                    onValueChange={(value) => updateStatus(row.id, row.status, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {matching === row.id ? (
                    <MatchScoreSkeleton />
                  ) : row.match_score != null ? (
                    <ScoreRing score={row.match_score} />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-muted text-xs text-muted-foreground">
                      No score
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant={row.match_score != null ? "outline" : "default"}
                    className={row.match_score == null ? "shadow-warm" : ""}
                    onClick={() => runMatch(row.id)}
                    disabled={matching === row.id}
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    {matching === row.id
                      ? "Matching..."
                      : row.match_score != null
                        ? "Re-match"
                        : "AI Match"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateQuestions(row.id)}
                    disabled={questioning === row.id}
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    {questioning === row.id ? "Generating..." : "Interview Qs"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 75 ? "text-success" : score >= 50 ? "text-primary" : "text-muted-foreground";
  const ringColor =
    score >= 75 ? "stroke-success" : score >= 50 ? "stroke-primary" : "stroke-muted-foreground";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r="36" className="fill-none stroke-muted" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r="36"
          className={`fill-none ${ringColor}`}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${color}`}>
        <span className="text-2xl font-bold">{score}%</span>
        <span className="text-[10px] uppercase">match</span>
      </div>
    </div>
  );
}
