import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Gauge,
  MessageSquareText,
  MousePointerClick,
  Search,
  Sparkles,
  Target,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Hire Buddy - Apply smarter, hire faster" },
      {
        name: "description",
        content:
          "AI Hire Buddy helps candidates build stronger applications and helps recruiters shortlist, interview, and decide with clearer AI signals.",
      },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "92%", label: "match signal in the demo shortlist" },
  { value: "10 min", label: "from raw CV to ready-to-apply profile" },
  { value: "8", label: "AI workflows across candidate and HR journeys" },
];

const candidateActions = [
  "Upload a CV and let AI build the first profile draft",
  "Generate a role-specific cover letter before applying",
  "See skill gaps and a practical learning plan",
];

const recruiterActions = [
  "Generate job descriptions from role basics",
  "Review candidates with explainable AI match summaries",
  "Create interview questions and pipeline insights",
];

const demoActions = [
  {
    key: "parse",
    label: "Parse CV",
    icon: Upload,
    title: "A CV becomes a reusable profile.",
    detail:
      "AI extracts skills, experience, education, headline, and summary so candidates can apply without rebuilding forms.",
    meter: 84,
    chips: ["React", "UX Research", "SaaS", "SQL"],
  },
  {
    key: "match",
    label: "Match role",
    icon: Target,
    title: "Recruiters see signal before opening every file.",
    detail:
      "Match score explains strengths and gaps, giving HR a fairer starting point for shortlisting.",
    meter: 92,
    chips: ["Strong fit", "3 gaps", "Interview ready"],
  },
  {
    key: "coach",
    label: "Coach next step",
    icon: MessageSquareText,
    title: "Candidates get practical guidance.",
    detail:
      "Career advice and skill-gap analysis turn the next application into a focused action plan.",
    meter: 76,
    chips: ["30-day plan", "Cover letter", "Skill gap"],
  },
];

const featureCards = [
  {
    icon: Upload,
    title: "CV Parser",
    body: "Transform raw CV text into profile fields, skills, education, and work history.",
    tone: "bg-sky-500",
  },
  {
    icon: Gauge,
    title: "AI Match Score",
    body: "Prioritize candidates with explainable fit summaries, strengths, and gaps.",
    tone: "bg-emerald-500",
  },
  {
    icon: WandSparkles,
    title: "AI Writing Suite",
    body: "Generate cover letters, job descriptions, career advice, and interview prompts.",
    tone: "bg-violet-500",
  },
  {
    icon: BarChart3,
    title: "Talent Insights",
    body: "Summarize applicant pools so recruiters know what to do next.",
    tone: "bg-amber-500",
  },
];

const workflow = [
  {
    icon: Search,
    title: "Discover",
    body: "Candidates browse open roles. Recruiters publish jobs with clearer requirements.",
  },
  {
    icon: Bot,
    title: "Understand",
    body: "AI parses candidate context and compares it against the actual job description.",
  },
  {
    icon: ClipboardList,
    title: "Move",
    body: "Apply, shortlist, interview, update status, and keep the hiring trail visible.",
  },
];

function Home() {
  const [activeDemo, setActiveDemo] = useState(demoActions[1].key);
  const demo = useMemo(
    () => demoActions.find((item) => item.key === activeDemo) ?? demoActions[1],
    [activeDemo],
  );

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar />

      <main>
        <section className="relative border-b border-border/60 bg-[linear-gradient(180deg,oklch(0.99_0.006_245),oklch(0.965_0.018_205)_62%,oklch(0.985_0.006_255))]">
          <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.96fr_1.04fr] lg:py-16">
            <div className="max-w-3xl">
              <Badge className="mb-5 gap-2 border-primary/15 bg-white/80 px-3 py-1.5 text-primary shadow-soft backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                AI hiring workspace for both sides
              </Badge>

              <h1 className="font-display text-4xl font-extrabold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
                Apply smarter. Hire faster. Keep the human spark.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                AI Hire Buddy turns job search and recruitment into a guided, high-signal flow:
                better profiles, stronger applications, explainable match scores, and recruiter
                actions that feel delightfully fast.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 bg-gradient-warm px-6 shadow-warm">
                  <Link to="/jobs">
                    <Briefcase className="h-5 w-5" />
                    Browse Jobs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 bg-white/80 px-6">
                  <Link to="/auth">
                    <MousePointerClick className="h-5 w-5" />
                    Try the AI flow
                  </Link>
                </Button>
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-white/80 bg-white/72 p-4 shadow-soft backdrop-blur transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="font-display text-2xl font-extrabold text-primary">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[1.25rem] border border-white/80 bg-white/86 p-3 shadow-[0_28px_70px_-36px_oklch(0.28_0.06_245_/_0.42)] backdrop-blur">
                <div className="rounded-lg border border-border/70 bg-card p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-display text-sm font-bold">Live product preview</div>
                        <div className="text-xs text-muted-foreground">AI signal studio</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      Interactive
                    </Badge>
                  </div>

                  <div className="mb-4 grid gap-2 sm:grid-cols-3">
                    {demoActions.map((action) => (
                      <button
                        key={action.key}
                        type="button"
                        onClick={() => setActiveDemo(action.key)}
                        className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-all ${
                          activeDemo === action.key
                            ? "border-primary bg-primary text-primary-foreground shadow-warm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <action.icon className="h-4 w-4" />
                        {action.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
                    <div className="space-y-3">
                      {[
                        ["Product Designer", "92% match", "bg-emerald-500"],
                        ["Frontend Engineer", "84% match", "bg-sky-500"],
                        ["People Ops Lead", "76% match", "bg-amber-500"],
                      ].map(([role, match, color]) => (
                        <div
                          key={role}
                          className="rounded-lg border border-border bg-background p-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-display text-sm font-semibold">{role}</div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                18 candidates analyzed
                              </div>
                            </div>
                            <Target className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${color}`}
                              style={{ width: match }}
                            />
                          </div>
                          <div className="mt-2 text-xs font-semibold text-foreground">{match}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-border bg-[linear-gradient(160deg,white,oklch(0.955_0.02_190))] p-4">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <div className="font-display text-lg font-bold">{demo.title}</div>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {demo.detail}
                          </p>
                        </div>
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-rose-100 font-display text-xl font-extrabold text-rose-700">
                          {demo.meter}
                        </div>
                      </div>

                      <div className="mb-4 h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-warm transition-all duration-500"
                          style={{ width: `${demo.meter}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {demo.chips.map((chip) => (
                          <Badge key={chip} variant="outline" className="bg-white/70">
                            {chip}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-4 rounded-lg border border-primary/15 bg-primary/10 p-3 text-sm text-foreground">
                        <div className="mb-1 flex items-center gap-2 font-display font-semibold">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Buddy says
                        </div>
                        This is the moment customers feel the product: one click turns messy hiring
                        data into a next step.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <Badge variant="outline" className="mb-4 bg-white">
                Built from the PRD journey
              </Badge>
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                Two journeys, one delightful workspace.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                Candidates get confidence and clarity. Recruiters get structured signals and faster
                decision loops.
              </p>
            </div>

            <Tabs defaultValue="candidate" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-lg bg-muted p-1">
                <TabsTrigger value="candidate" className="gap-2 py-2.5">
                  <Upload className="h-4 w-4" />
                  Candidate
                </TabsTrigger>
                <TabsTrigger value="recruiter" className="gap-2 py-2.5">
                  <BarChart3 className="h-4 w-4" />
                  Recruiter
                </TabsTrigger>
              </TabsList>
              <TabsContent value="candidate" className="mt-4">
                <PersonaPanel
                  accent="bg-sky-500"
                  title="Apply like every role has a personal coach."
                  actions={candidateActions}
                  cta="Create profile"
                  to="/auth"
                />
              </TabsContent>
              <TabsContent value="recruiter" className="mt-4">
                <PersonaPanel
                  accent="bg-emerald-500"
                  title="Shortlist with sharper signals before the first call."
                  actions={recruiterActions}
                  cta="Start hiring"
                  to="/auth"
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="border-y border-border/60 bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                  AI tools customers can feel immediately.
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                  Every feature points to a concrete action, from a better CV profile to a better
                  interview plan.
                </p>
              </div>
              <Button asChild variant="outline" className="w-fit bg-background">
                <Link to="/jobs">
                  Explore open roles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((feature) => (
                <Card
                  key={feature.title}
                  className="group border-border/70 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-warm"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg text-white ${feature.tone}`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            {workflow.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-lg border border-border bg-card p-6 shadow-soft"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-4xl font-extrabold text-muted">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 lg:pb-20">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.25rem] border border-primary/15 bg-[linear-gradient(135deg,oklch(0.24_0.05_255),oklch(0.36_0.11_210))] p-6 text-white shadow-warm sm:p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Badge className="mb-4 gap-2 border-white/15 bg-white/12 text-white">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Ready for your next hiring move
                </Badge>
                <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                  Make the first click feel like progress.
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-white/78">
                  Browse jobs, build a smarter profile, or open the recruiter flow and let AI remove
                  repetitive work from your shortlist.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button
                  asChild
                  size="lg"
                  className="h-12 bg-white px-6 text-primary hover:bg-white/92"
                >
                  <Link to="/jobs">
                    Browse Jobs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/30 bg-white/10 px-6 text-white hover:bg-white/18 hover:text-white"
                >
                  <Link to="/auth">
                    Get Started
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        (c) {new Date().getFullYear()} AI Hire Buddy
      </footer>
    </div>
  );
}

function PersonaPanel({
  accent,
  title,
  actions,
  cta,
  to,
}: {
  accent: string;
  title: string;
  actions: string[];
  cta: string;
  to: "/auth" | "/jobs";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="flex gap-4">
        <div className={`mt-1 h-12 w-2 shrink-0 rounded-full ${accent}`} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl font-bold leading-7">{title}</h3>
          <div className="mt-4 grid gap-2">
            {actions.map((action) => (
              <div key={action} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{action}</span>
              </div>
            ))}
          </div>
          <Button asChild className="mt-5">
            <Link to={to}>
              {cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
