-- PRD foundation completion: additive tables, indexes, RLS, and CV bucket.
-- This keeps the current MVP schema intact while adding the missing audit and AI tables.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false,
  5242880,
  ARRAY[
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.profile_educations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_year INTEGER,
  end_year INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profile_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.application_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'id' CHECK (language IN ('id', 'en')),
  is_ai_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (application_id, author_id)
);

CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  hr_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  seniority TEXT NOT NULL CHECK (seniority IN ('junior', 'mid', 'senior')),
  questions_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_career_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE UNIQUE,
  insights TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON public.jobs(recruiter_id);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_match_score ON public.applications(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_educations_profile_id ON public.profile_educations(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_experiences_profile_id ON public.profile_experiences(profile_id);
CREATE INDEX IF NOT EXISTS idx_application_status_logs_application_id ON public.application_status_logs(application_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cover_letters_application_id ON public.cover_letters(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_application_id ON public.interview_questions(application_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_career_consultations_user_created ON public.ai_career_consultations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_cache_job_id ON public.ai_insights_cache(job_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_cache_updated_at ON public.ai_insights_cache(updated_at DESC);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_career_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights_cache ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.companies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_educations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_experiences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_status_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cover_letters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_career_consultations TO authenticated;
GRANT SELECT ON public.ai_insights_cache TO authenticated;
GRANT ALL ON public.profile_educations, public.profile_experiences, public.application_status_logs, public.cover_letters, public.interview_questions, public.ai_career_consultations, public.ai_insights_cache TO service_role;

CREATE POLICY "Public can view active companies" ON public.companies
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Recruiters can manage own companies" ON public.companies
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK ((owner_id = auth.uid() AND public.has_role(auth.uid(), 'recruiter')) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users manage own educations" ON public.profile_educations
  FOR ALL TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users manage own experiences" ON public.profile_experiences
  FOR ALL TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Involved users view status logs" ON public.application_status_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = application_id
        AND (a.applicant_id = auth.uid() OR j.recruiter_id = auth.uid())
    )
  );

CREATE POLICY "Recruiters can write status logs for own jobs" ON public.application_status_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    changed_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = application_id
        AND j.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Applicants and recruiters view cover letters" ON public.cover_letters
  FOR SELECT TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = application_id
        AND j.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Applicants manage own cover letters" ON public.cover_letters
  FOR ALL TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Recruiters manage interview questions for own jobs" ON public.interview_questions
  FOR ALL TO authenticated
  USING (
    hr_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.recruiter_id = auth.uid())
  )
  WITH CHECK (
    hr_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.recruiter_id = auth.uid())
  );

CREATE POLICY "Users manage own career consultations" ON public.ai_career_consultations
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Recruiters view insights for own jobs" ON public.ai_insights_cache
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.recruiter_id = auth.uid()));

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cover_letters_updated_at
  BEFORE UPDATE ON public.cover_letters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
