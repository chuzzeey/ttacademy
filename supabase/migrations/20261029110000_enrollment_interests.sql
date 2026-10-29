BEGIN;

CREATE TABLE IF NOT EXISTS public.enrollment_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 160),
  email TEXT NOT NULL CHECK (char_length(email) <= 254),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 24),
  course TEXT NOT NULL,
  goals TEXT CHECK (goals IS NULL OR char_length(goals) <= 3000),
  consent BOOLEAN NOT NULL CHECK (consent),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS enrollment_interests_created_at_idx
  ON public.enrollment_interests (created_at DESC);
CREATE INDEX IF NOT EXISTS enrollment_interests_email_idx
  ON public.enrollment_interests (email);

ALTER TABLE public.enrollment_interests ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON TABLE public.enrollment_interests TO service_role;

COMMIT;
