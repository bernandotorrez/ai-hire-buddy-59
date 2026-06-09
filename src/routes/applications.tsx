import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { matchApplicationWithAi } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Sparkles, Target, Briefcase } from "lucide-react";

export const Route = createFileRoute("/applications")({
  head: () => ({ meta: [{ title: "Applications — WarmHire" }] }),
  component: ApplicationsPage,
});

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

function SeekerApplications() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [apps, setApps] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase
      .from("applications")
      .select("id, status, created_at, cover_letter, jobs(id, title, company, location)")
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setApps(data ?? []));
  }, [user]);

  return (
    <>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">My Applications</h1>
      <p className="mt-1 text-muted-foreground">Track every role you've applied to.</p>
      <div className="mt-8 grid gap-4">
        {apps.length === 0 && <Card className="p-8 text-center text-muted-foreground">No applications yet. <Link to="/jobs" className="text-primary underline">Browse jobs</Link></Card>}
        {apps.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link to="/jobs/$id" params={{ id: a.jobs.id }} className="font-display text-lg font-semibold hover:text-primary">
                  {a.jobs.title}
                </Link>
                <p className="text-sm text-muted-foreground">{a.jobs.company} · {a.jobs.location ?? ""}</p>
              </div>
              <Badge variant="secondary">{a.status}</Badge>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<any[]>([]);
  const [matching, setMatching] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("applications")
      .select(`
        id, status, match_score, match_summary, cover_letter, created_at,
        jobs!inner(id, title, recruiter_id),
        profiles:applicant_id(id, full_name, headline, email, skills, summary, cv_url)
      `)
      .eq("jobs.recruiter_id", user.id)
      .order("created_at", { ascending: false });
    setRows(data ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const runMatch = async (id: string) => {
    setMatching(id);
    try {
      const res = await matchFn({ data: { applicationId: id } });
      toast.success(`Match score: ${res.score}%`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Match failed");
    } finally {
      setMatching(null);
    }
  };

  const matchAll = async () => {
    const pending = rows.filter((r) => r.match_score == null);
    for (const r of pending) {
      await runMatch(r.id);
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
          <Link to="/post-job"><Button variant="outline"><Briefcase className="mr-2 h-4 w-4" />Post a job</Button></Link>
          <Button onClick={matchAll} className="shadow-warm" disabled={rows.every((r) => r.match_score != null)}>
            <Sparkles className="mr-2 h-4 w-4" />AI Match All
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {rows.length === 0 && <Card className="p-10 text-center text-muted-foreground">No applications yet.</Card>}
        {rows.map((r) => (
          <Card key={r.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold">{r.profiles?.full_name || "Unnamed candidate"}</h3>
                  {r.profiles?.headline && <span className="text-sm text-muted-foreground">· {r.profiles.headline}</span>}
                </div>
                <p className="text-sm text-muted-foreground">Applied for <span className="font-medium text-foreground">{r.jobs.title}</span> · {r.profiles?.email}</p>

                {r.profiles?.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {r.profiles.skills.slice(0, 8).map((s: string) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                )}

                {r.cover_letter && (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-muted-foreground">Cover letter</summary>
                    <p className="mt-2 whitespace-pre-wrap text-foreground/90">{r.cover_letter}</p>
                  </details>
                )}

                {r.match_summary && (
                  <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                      <Target className="h-4 w-4" /> AI Match Analysis
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-foreground/90">{r.match_summary}</p>
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col items-center gap-2 sm:w-40">
                {r.match_score != null ? (
                  <ScoreRing score={r.match_score} />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-muted text-xs text-muted-foreground">No score</div>
                )}
                <Button
                  size="sm"
                  variant={r.match_score != null ? "outline" : "default"}
                  className={r.match_score == null ? "shadow-warm" : ""}
                  onClick={() => runMatch(r.id)}
                  disabled={matching === r.id}
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  {matching === r.id ? "Matching…" : r.match_score != null ? "Re-match" : "AI Match"}
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
  const color = score >= 75 ? "text-success" : score >= 50 ? "text-primary" : "text-muted-foreground";
  const ringColor = score >= 75 ? "stroke-success" : score >= 50 ? "stroke-primary" : "stroke-muted-foreground";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r="36" className="fill-none stroke-muted" strokeWidth="6" />
        <circle cx="40" cy="40" r="36" className={`fill-none ${ringColor}`} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${color}`}>
        <span className="text-2xl font-bold">{score}%</span>
        <span className="text-[10px] uppercase tracking-wide">match</span>
      </div>
    </div>
  );
}
