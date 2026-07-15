-- Fix PIN column - ensure it exists and has correct default
-- Run this in Supabase SQL Editor

-- First, check if column exists and add it if not
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT '123456';

-- Update ALL existing students to have the default PIN '123456'
-- This overrides any old PIN values (like '0000')
UPDATE public.students 
SET pin = '123456';

-- Add index for faster PIN lookups
CREATE INDEX IF NOT EXISTS idx_students_pin ON public.students(pin);

-- Verify the update - all PINs should now be '123456'
SELECT id, name, email, pin FROM public.students LIMIT 10;
