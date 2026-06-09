
CREATE POLICY "Users can upload own CV" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read own CV" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own CV" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own CV" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Recruiters can read applicant CVs" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'cvs' AND
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE j.recruiter_id = auth.uid()
        AND a.applicant_id::text = (storage.foldername(name))[1]
    )
  );
