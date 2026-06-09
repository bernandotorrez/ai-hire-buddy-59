import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/post-job")({
  head: () => ({ meta: [{ title: "Post a Job — WarmHire" }] }),
  component: PostJob,
});

function PostJob() {
  const { user, isRecruiter, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", company: "", location: "", employment_type: "Full-time",
    description: "", requirements: "", salary_min: "", salary_max: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("jobs").insert({
      recruiter_id: user.id,
      title: form.title,
      company: form.company,
      location: form.location || null,
      employment_type: form.employment_type || null,
      description: form.description,
      requirements: form.requirements || null,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
    }).select().single();
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Job posted!");
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
        <p className="mt-1 text-muted-foreground">Fill in the details. Candidates will be matched by AI.</p>

        <Card className="mt-8 p-6 shadow-soft">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Company</Label>
                <Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <Label>Employment type</Label>
                <Input value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} />
              </div>
              <div>
                <Label>Salary min (USD)</Label>
                <Input type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
              </div>
              <div>
                <Label>Salary max (USD)</Label>
                <Input type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea required rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Requirements</Label>
              <Textarea rows={5} placeholder="Skills, experience, must-haves…" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
            </div>
            <Button type="submit" className="shadow-warm" disabled={submitting}>
              {submitting ? "Posting…" : "Post job"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
