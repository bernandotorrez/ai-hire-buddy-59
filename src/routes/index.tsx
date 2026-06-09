import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, FileSearch, Target, Upload, Briefcase, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WarmHire — Hire smarter with AI" },
      { name: "description", content: "AI-powered job board: parse CVs automatically and match candidates to jobs instantly." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/40 via-background to-cream" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Powered by AI · Sumopod Gemini
            </div>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Hire warmly.<br />
              <span className="bg-gradient-warm bg-clip-text text-transparent">Match smartly.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              A friendly job board where job seekers upload their CV once and AI fills out their profile —
              and recruiters get an instant match score for every applicant.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/jobs">
                <Button size="lg" className="shadow-warm">
                  <Briefcase className="mr-2 h-5 w-5" /> Browse Jobs
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  Post a Job <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">How WarmHire works</h2>
          <p className="mt-3 text-muted-foreground">Three steps. Two sides. One AI helping both.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Upload, title: "Upload your CV", body: "Job seekers upload a PDF or paste text. AI extracts skills, experience and education automatically." },
            { icon: FileSearch, title: "Apply in one click", body: "Browse open roles and apply with your auto-built profile — no forms to fill." },
            { icon: Target, title: "AI match scoring", body: "Recruiters see a % match for every applicant with a clear AI summary of strengths and gaps." },
          ].map((f) => (
            <Card key={f.title} className="border-border/60 p-7 shadow-soft transition-transform hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-warm text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-warm p-10 text-center shadow-warm sm:p-16">
          <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
            Ready to find your match?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
            Join as a job seeker or recruiter. It's free to get started.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="shadow-soft">
                Create an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WarmHire · Built with AI on Lovable
      </footer>
    </div>
  );
}
