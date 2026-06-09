import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Building2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/$id")({
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

function JobDetail() {
  const { id } = Route.useParams();
  const { user, isSeeker, isRecruiter } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    supabase.from("jobs").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setJob(data as Job | null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!user) return;
    supabase.from("applications").select("id").eq("job_id", id).eq("applicant_id", user.id).maybeSingle().then(({ data }) => {
      setAlreadyApplied(!!data);
    });
  }, [user, id]);

  const apply = async () => {
    if (!user) return navigate({ to: "/auth" });
    setSubmitting(true);
    const { error } = await supabase.from("applications").insert({ job_id: id, applicant_id: user.id, cover_letter: coverLetter });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Application submitted!");
    setAlreadyApplied(true);
  };

  if (loading) return (<><Navbar /><div className="mx-auto max-w-4xl px-4 py-10">Loading…</div></>);
  if (!job) return (<><Navbar /><div className="mx-auto max-w-4xl px-4 py-10">Job not found.</div></>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link to="/jobs" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <Card className="p-8 shadow-soft">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{job.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {job.company}</span>
            {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>}
            {job.employment_type && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.employment_type}</span>}
            {(job.salary_min || job.salary_max) && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                {job.salary_min ? `$${(job.salary_min/1000).toFixed(0)}k` : ""}
                {job.salary_min && job.salary_max ? " – " : ""}
                {job.salary_max ? `$${(job.salary_max/1000).toFixed(0)}k` : ""}
              </Badge>
            )}
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
              <p className="mt-3 text-success">You've already applied to this job. Good luck!</p>
            ) : !user ? (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Sign in as a job seeker to apply with your AI profile.</p>
                <Link to="/auth"><Button className="mt-3 shadow-warm">Sign in to apply</Button></Link>
              </div>
            ) : !isSeeker ? (
              <p className="mt-3 text-sm text-muted-foreground">Your account isn't a job-seeker account.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <Textarea
                  rows={5}
                  placeholder="Cover letter (optional) — tell the recruiter why you're a great fit."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
                <Button className="shadow-warm" onClick={apply} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit application"}
                </Button>
                <p className="text-xs text-muted-foreground">Your profile and CV will be shared with the recruiter automatically.</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
