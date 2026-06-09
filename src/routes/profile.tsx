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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { parseCvWithAi } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Sparkles, Upload, FileText } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — WarmHire" }] }),
  component: ProfilePage,
});

type Profile = {
  id: string;
  full_name: string | null;
  headline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  skills: string[] | null;
  cv_url: string | null;
  cv_text: string | null;
};

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  // Use worker from CDN matching version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
  }
  return text;
}

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const parseCv = useServerFn(parseCvWithAi);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setProfile(data as Profile);
    });
  }, [user]);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      // Extract text
      let cvText = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        cvText = await extractPdfText(file);
      } else {
        cvText = await file.text();
      }
      if (cvText.trim().length < 20) throw new Error("Could not extract text from this file");

      // Upload to storage
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("cvs").upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      toast.success("CV uploaded — parsing with AI…");
      setParsing(true);

      const parsed = await parseCv({ data: { cvText: cvText.slice(0, 45000) } });

      // Save to profile
      const update = {
        full_name: parsed.full_name || profile?.full_name,
        headline: parsed.headline || profile?.headline,
        email: parsed.email || profile?.email,
        phone: parsed.phone || profile?.phone,
        location: parsed.location || profile?.location,
        summary: parsed.summary || profile?.summary,
        skills: parsed.skills,
        experience: parsed.experience,
        education: parsed.education,
        cv_url: path,
        cv_text: cvText.slice(0, 45000),
      };
      const { data, error } = await supabase.from("profiles").update(update).eq("id", user.id).select().single();
      if (error) throw error;
      setProfile(data as Profile);
      toast.success("Profile auto-filled by AI!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process CV");
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      headline: profile.headline,
      phone: profile.phone,
      location: profile.location,
      summary: profile.summary,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved!");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">My Profile</h1>
        <p className="mt-1 text-muted-foreground">Upload your CV and let AI build your profile in seconds.</p>

        {/* CV Upload */}
        <Card className="mt-8 p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-warm text-primary-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">AI CV Parser</h2>
              <p className="mt-1 text-sm text-muted-foreground">Upload a PDF or TXT. AI will extract your skills, experience and education.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10">
                  <Upload className="h-4 w-4" />
                  {uploading ? (parsing ? "AI parsing…" : "Uploading…") : "Upload CV (PDF/TXT)"}
                  <input type="file" accept=".pdf,.txt" className="hidden" onChange={handleCvUpload} disabled={uploading} />
                </label>
                {profile?.cv_url && (
                  <span className="inline-flex items-center gap-1 text-sm text-success">
                    <FileText className="h-4 w-4" /> CV on file
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Editable details */}
        <Card className="mt-6 p-6 shadow-soft">
          <h2 className="mb-4 font-display text-lg font-semibold">Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input value={profile?.full_name ?? ""} onChange={(e) => setProfile((p) => p && { ...p, full_name: e.target.value })} />
            </div>
            <div>
              <Label>Headline</Label>
              <Input placeholder="e.g. Senior Frontend Engineer" value={profile?.headline ?? ""} onChange={(e) => setProfile((p) => p && { ...p, headline: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile?.email ?? ""} disabled />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={profile?.phone ?? ""} onChange={(e) => setProfile((p) => p && { ...p, phone: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Location</Label>
              <Input value={profile?.location ?? ""} onChange={(e) => setProfile((p) => p && { ...p, location: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Summary</Label>
              <Textarea rows={4} value={profile?.summary ?? ""} onChange={(e) => setProfile((p) => p && { ...p, summary: e.target.value })} />
            </div>
          </div>

          {profile?.skills && profile.skills.length > 0 && (
            <div className="mt-6">
              <Label>Skills (from AI)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button onClick={saveProfile} disabled={saving} className="shadow-warm">{saving ? "Saving…" : "Save changes"}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
