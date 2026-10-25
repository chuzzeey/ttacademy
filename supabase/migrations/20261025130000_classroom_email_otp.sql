BEGIN;

ALTER TABLE public.classroom_rooms
  ADD COLUMN IF NOT EXISTS teacher_email TEXT,
  ADD COLUMN IF NOT EXISTS teacher_display_name TEXT;

CREATE TABLE IF NOT EXISTS public.classroom_login_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login_type TEXT NOT NULL CHECK (login_type IN ('student', 'teacher')),
  email TEXT NOT NULL,
  course_slug TEXT NOT NULL REFERENCES public.classroom_courses (slug) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  CONSTRAINT classroom_login_challenge_student_identity CHECK (
    (login_type = 'student' AND student_id IS NOT NULL)
    OR (login_type = 'teacher' AND student_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS classroom_login_challenges_email_created_idx
  ON public.classroom_login_challenges (lower(email), login_type, created_at DESC);

ALTER TABLE public.classroom_login_challenges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.classroom_login_challenges FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.classroom_login_challenges TO service_role;

COMMIT;
