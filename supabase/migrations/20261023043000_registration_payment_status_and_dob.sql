ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'Not Paid Yet',
  ADD COLUMN IF NOT EXISTS payment_plan TEXT NOT NULL DEFAULT 'Not Paid Yet';

ALTER TABLE public.students
  ALTER COLUMN payment_status SET DEFAULT 'Not Paid Yet',
  ALTER COLUMN payment_plan SET DEFAULT 'Not Paid Yet';

GRANT SELECT ON public.students TO authenticated;

DROP POLICY IF EXISTS "Allow full access to students" ON public.students;
DROP POLICY IF EXISTS "Admins can receive student realtime updates" ON public.students;
CREATE POLICY "Admins can receive student realtime updates"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (LOWER(auth.jwt() ->> 'email') = 'adminb@atomic.io');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'students'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
  END IF;
END $$;
