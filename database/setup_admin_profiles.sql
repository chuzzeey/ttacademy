-- Run this in the Supabase SQL Editor to prepare registration and admin data.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  course TEXT NOT NULL,
  sex TEXT,
  country TEXT,
  state TEXT,
  employment_status TEXT,
  has_laptop TEXT,
  reason TEXT,
  payment_status TEXT NOT NULL DEFAULT 'Not Paid Yet',
  payment_plan TEXT NOT NULL DEFAULT 'Not Paid Yet',
  restricted BOOLEAN NOT NULL DEFAULT FALSE,
  pin TEXT DEFAULT '123456',
  reg_date TEXT,
  reg_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS course TEXT,
  ADD COLUMN IF NOT EXISTS reg_date TEXT,
  ADD COLUMN IF NOT EXISTS sex TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS employment_status TEXT,
  ADD COLUMN IF NOT EXISTS has_laptop TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'Not Paid Yet',
  ADD COLUMN IF NOT EXISTS payment_plan TEXT NOT NULL DEFAULT 'Not Paid Yet',
  ADD COLUMN IF NOT EXISTS restricted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT '123456',
  ADD COLUMN IF NOT EXISTS reg_time TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Older student schemas required fields the current registration form does not send.
DO $$
DECLARE
  target_column TEXT;
BEGIN
  FOREACH target_column IN ARRAY ARRAY[
    'gender',
    'state_of_residence',
    'learning_track',
    'how_did_you_hear',
    'has_laptop_and_internet',
    'current_employment_status',
    'wants_scholarship',
    'why_learn_this_skill',
    'timestamp'
  ] LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns AS c
      WHERE c.table_schema = 'public'
        AND c.table_name = 'students'
        AND c.column_name = target_column
    ) THEN
      EXECUTE format('ALTER TABLE public.students ALTER COLUMN %I DROP NOT NULL', target_column);
    END IF;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_email ON public.students (email);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
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
  USING (LOWER(auth.jwt() ->> 'email') = 'amahchibu@gmail.com');

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT 'Admin';

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read their own profile" ON public.admin_profiles;
CREATE POLICY "Admins can read their own profile"
  ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.admin_profiles TO authenticated;

DELETE FROM public.admin_profiles
WHERE lower(email) <> 'amahchibu@gmail.com';

INSERT INTO public.admin_profiles (user_id, email, full_name)
SELECT
  id,
  lower(email),
  coalesce(nullif(raw_user_meta_data ->> 'name', ''), 'Admin')
FROM auth.users
WHERE lower(email) = 'amahchibu@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

COMMIT;
