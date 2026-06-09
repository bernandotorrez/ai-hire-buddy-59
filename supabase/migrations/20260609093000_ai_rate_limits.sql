CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, function_name, window_start)
);

ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.ai_rate_limits TO service_role;

CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_user_function_window
  ON public.ai_rate_limits(user_id, function_name, window_start DESC);

CREATE POLICY "Service role manages AI rate limits" ON public.ai_rate_limits
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_ai_rate_limits_updated_at
  BEFORE UPDATE ON public.ai_rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
