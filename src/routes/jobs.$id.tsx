import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { JobCardSkeleton } from "@/components/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { analyzeSkillGapWithAi, generateCoverLetterWithAi } from "@/lib/ai.functions";
import { toast } from "sonner";
import { ArrowLeft, Briefcase, Building2, MapPin, Sparkles, Target } from "lucide-react";

export const Route = createFileRoute("/jobs/$id")({
  head: () => ({ meta: [{ title: "Job Detail - AI Hire Buddy" }] }),
  component: JobDetail,
});

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  description: string;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  recruiter_id: string;
};

type SupabaseWriteClient = {
  from: (table: string) => {
    insert: (value: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const left = min ? `$${(min / 1000).toFixed(0)}k` : "";
  const right = max ? `$${(max / 1000).toFixed(0)}k` : "";
  return `${left}${min && max ? " - " : ""}${right}`;
}

function JobDetail() {
  const { id } = Route.useParams();
  const { user, isSeeker, isRecruiter } = useAuth();
  const navigate = useNavigate();
  const generateCoverLetter = useServerFn(generateCoverLetterWithAi);
  const analyzeSkillGap = useServerFn(analyzeSkillGapWithAi);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverLetterGenerated, setCoverLetterGenerated] = useState(false);
  const [analyzingGap, setAnalyzingGap] = useState(false);
  const [skillGap, setSkillGap] = useState("");

  useEffect(() => {
    supabase
      .from("jobs")
      .select(
        "id, title, company, location, employment_type, description, requirements, salary_min, salary_max, recruiter_id",
      )
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setJob(data as Job | null);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("applications")
      .select("id")
      .eq("job_id", id)
      .eq("applicant_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setAlreadyApplied(!!data);
      });
  }, [user, id]);

  const apply = async () => {
    if (!user) return navigate({ to: "/auth" });
    setSubmitting(true);
    const { data, error } = await supabase
      .from("applications")
      .insert({
        job_id: id,
        applicant_id: user.id,
        cover_letter: coverLetter,
      })
      .select("id")
      .single();
    if (!error && data?.id && coverLetter.trim()) {
      const writer = supabase as unknown as SupabaseWriteClient;
      const { error: coverError } = await writer.from("cover_letters").insert({
        application_id: data.id,
        author_id: user.id,
        content: coverLetter.trim(),
        language: "id",
        is_ai_generated: coverLetterGenerated,
      });
      if (coverError) {
        toast.error(coverError.message);
      }
    }
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Application submitted");
    setAlreadyApplied(true);
  };

  const handleGenerateCoverLetter = async () => {
    if (!user) return navigate({ to: "/auth" });
    setGeneratingCover(true);
    try {
      const text = await generateCoverLetter({ data: { jobId: id } });
      setCoverLetter(text.trim());
      setCoverLetterGenerated(true);
      toast.success("Cover letter generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate cover letter");
    } finally {
      setGeneratingCover(false);
    }
  };

  const handleAnalyzeSkillGap = async () => {
    if (!user) return navigate({ to: "/auth" });
    setAnalyzingGap(true);
    try {
      const text = await analyzeSkillGap({ data: { jobId: id } });
      setSkillGap(text.trim());
      toast.success("Skill gap analysis ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to analyze skill gap");
    } finally {
      setAnalyzingGap(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <JobCardSkeleton />
          <Card className="mt-6 p-8 shadow-soft">
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-24 w-full" />
            </div>
          </Card>
        </div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-10">Job not found.</div>
      </>
    );
  }

  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          to="/jobs"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <Card className="p-8 shadow-soft">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{job.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" /> {job.company}
            </span>
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
            )}
            {job.employment_type && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" /> {job.employment_type}
              </span>
            )}
            {salary && <Badge variant="secondary">{salary}</Badge>}
          </div>

          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold">Job description</h2>
            <p className="mt-2 whitespace-pre-wrap text-foreground/90">{job.description}</p>
          </section>

          {job.requirements && (
            <section className="mt-6">
              <h2 className="font-display text-lg font-semibold">Requirements</h2>
              <p className="mt-2 whitespace-pre-wrap text-foreground/90">{job.requirements}</p>
            </section>
          )}
        </Card>

        {!isRecruiter && (
          <Card className="mt-6 p-8 shadow-soft">
            <h2 className="font-display text-xl font-semibold">Apply for this role</h2>
            {alreadyApplied ? (
              <p className="mt-3 text-success">You have already applied to this job. Good luck!</p>
            ) : !user ? (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Sign in as a job seeker to apply with your AI profile.
                </p>
                <Link to="/auth">
                  <Button className="mt-3 shadow-warm">Sign in to apply</Button>
                </Link>
              </div>
            ) : !isSeeker ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Your account is not a job-seeker account.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingCover}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {generatingCover ? "Generating..." : "Generate cover letter"}
                  </Button>
                  <Button variant="outline" onClick={handleAnalyzeSkillGap} disabled={analyzingGap}>
                    <Target className="mr-2 h-4 w-4" />
                    {analyzingGap ? "Analyzing..." : "Analyze skill gap"}
                  </Button>
                </div>
                <Textarea
                  rows={5}
                  placeholder="Cover letter (optional) - tell the recruiter why you are a great fit."
                  value={coverLetter}
                  onChange={(event) => {
                    setCoverLetter(event.target.value);
                    setCoverLetterGenerated(false);
                  }}
                />
                {skillGap && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                      <Target className="h-4 w-4" /> AI Skill Gap Analysis
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-foreground/90">{skillGap}</div>
                  </div>
                )}
                <Button className="shadow-warm" onClick={apply} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit application"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Your profile and CV will be shared with the recruiter automatically.
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
