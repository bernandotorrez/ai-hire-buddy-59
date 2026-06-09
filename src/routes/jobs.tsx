import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JobCardSkeleton } from "@/components/loading-skeletons";
import { Briefcase, Building2, MapPin, Search } from "lucide-react";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Browse Jobs - AI Hire Buddy" },
      { name: "description", content: "Discover open roles and apply with your AI-built profile." },
    ],
  }),
  component: JobsList,
});

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const left = min ? `$${(min / 1000).toFixed(0)}k` : "";
  const right = max ? `$${(max / 1000).toFixed(0)}k` : "";
  return `${left}${min && max ? " - " : ""}${right}`;
}

function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("jobs")
      .select(
        "id, title, company, location, employment_type, description, salary_min, salary_max, created_at",
      )
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setJobs((data ?? []) as Job[]);
        setLoading(false);
      });
  }, []);

  const filtered = jobs.filter((job) => {
    const search = q.toLowerCase();
    return (
      !search ||
      job.title.toLowerCase().includes(search) ||
      job.company.toLowerCase().includes(search) ||
      (job.location ?? "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Open positions</h1>
            <p className="mt-1 text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "role" : "roles"} ready for AI-assisted
              applications.
            </p>
          </div>
          <div className="relative sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title, company, location"
              className="pl-9"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            No jobs found. Check back soon.
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((job) => {
              const salary = formatSalary(job.salary_min, job.salary_max);
              return (
                <Link key={job.id} to="/jobs/$id" params={{ id: job.id }} className="block">
                  <Card className="group p-6 transition-all hover:-translate-y-0.5 hover:shadow-warm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="font-display text-xl font-bold transition-colors group-hover:text-primary">
                          {job.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm text-foreground/80">
                          {job.description}
                        </p>
                      </div>
                      {salary && <Badge variant="secondary">{salary}</Badge>}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
