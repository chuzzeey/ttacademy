-- ============================================================
-- PASTE THIS IN SUPABASE SQL EDITOR (https://supabase.com/dashboard)
-- This creates the students table that both the landing page
-- and the dashboard use.
-- ============================================================

-- 1. Drop the old table if you were using student_registrations before
DROP TABLE IF EXISTS public.student_registrations;

-- 2. Create the students table (if it doesn't already exist)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  reg_date TEXT NOT NULL,
  reg_time TEXT,
  payment_plan TEXT NOT NULL DEFAULT 'Not Paid Yet',
  amount_paid NUMERIC DEFAULT 0,
  balance_remaining NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'None' CHECK (status IN ('None', 'Awaiting', 'Confirmed')),
  timestamp TEXT NOT NULL,
  gender TEXT NOT NULL,
  state_of_residence TEXT NOT NULL,
  learning_track TEXT NOT NULL,
  how_did_you_hear TEXT NOT NULL,
  has_laptop_and_internet TEXT NOT NULL,
  current_employment_status TEXT NOT NULL,
  wants_scholarship TEXT NOT NULL DEFAULT 'no',
  why_learn_this_skill TEXT NOT NULL,
  last_progress TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_students_course ON public.students(course);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

-- 4. Enable Row Level Security and allow all access
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access to students" ON public.students;
CREATE POLICY "Allow full access to students" ON public.students FOR ALL USING (true);

-- Done! Your landing page wizard form will now save data here.