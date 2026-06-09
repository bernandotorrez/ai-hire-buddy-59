import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { generateJobDescriptionWithAi } from "@/lib/ai.functions";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/post-job")({
  head: () => ({ meta: [{ title: "Post a Job - AI Hire Buddy" }] }),
  component: PostJob,
});

function PostJob() {
  const { user, isRecruiter, loading } = useAuth();
  const navigate = useNavigate();
  const generateDescription = useServerFn(generateJobDescriptionWithAi);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    employment_type: "Full-time",
    seniority: "mid" as "junior" | "mid" | "senior" | "lead",
    must_have_skills: "",
    description: "",
    requirements: "",
    salary_min: "",
    salary_max: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const generate = async () => {
    if (!form.title.trim()) return toast.error("Enter a job title first");
    setGenerating(true);
    try {
      const result = await generateDescription({
        data: {
          title: form.title,
          company: form.company,
          location: form.location,
          employmentType: form.employment_type,
          seniority: form.seniority,
          mustHaveSkills: form.must_have_skills,
        },
      });
      setForm((current) => ({
        ...current,
        description: result.description || current.description,
        requirements: result.requirements || current.requirements,
      }));
      toast.success("Job description generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate job description");
    } finally {
      setGenerating(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        recruiter_id: user.id,
        title: form.title,
        company: form.company,
        location: form.location || null,
        employment_type: form.employment_type || null,
        description: form.description,
        requirements: form.requirements || null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Job posted");
    navigate({ to: "/jobs/$id", params: { id: data.id } });
  };

  if (!user) return null;
  if (!loading && !isRecruiter) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Recruiters only</h1>
          <p className="mt-2 text-muted-foreground">This page is for recruiter accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Post a new job</h1>
        <p className="mt-1 text-muted-foreground">
          Draft the role manually or let AI prepare the first version.
        </p>

        <Card className="mt-8 p-6 shadow-soft">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  required
                  value={form.company}
                  onChange={(event) => setForm({ ...form, company: event.target.value })}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </div>
              <div>
                <Label>Employment type</Label>
                <Input
                  value={form.employment_type}
                  onChange={(event) => setForm({ ...form, employment_type: event.target.value })}
                />
              </div>
              <div>
                <Label>Seniority</Label>
                <Select
                  value={form.seniority}
                  onValueChange={(value) =>
                    setForm({ ...form, seniority: value as typeof form.seniority })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Must-have skills</Label>
                <Input
                  value={form.must_have_skills}
                  onChange={(event) => setForm({ ...form, must_have_skills: event.target.value })}
                />
              </div>
              <div>
                <Label>Salary min (USD)</Label>
                <Input
                  type="number"
                  value={form.salary_min}
                  onChange={(event) => setForm({ ...form, salary_min: event.target.value })}
                />
              </div>
              <div>
                <Label>Salary max (USD)</Label>
                <Input
                  type="number"
                  value={form.salary_max}
                  onChange={(event) => setForm({ ...form, salary_max: event.target.value })}
                />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={generate} disabled={generating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {generating ? "Generating..." : "Generate with AI"}
            </Button>
            <div>
              <Label>Description</Label>
              <Textarea
                required
                rows={7}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            <div>
              <Label>Requirements</Label>
              <Textarea
                rows={6}
                value={form.requirements}
                onChange={(event) => setForm({ ...form, requirements: event.target.value })}
              />
            </div>
            <Button type="submit" className="shadow-warm" disabled={submitting}>
              {submitting ? "Posting..." : "Post job"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
