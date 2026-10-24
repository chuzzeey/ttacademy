BEGIN;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS student_code TEXT;

CREATE OR REPLACE FUNCTION public.generate_student_code()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SET search_path = public, pg_temp
AS $$
DECLARE
  candidate TEXT;
  attempts INTEGER := 0;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('public.students.student_code')::BIGINT);

  LOOP
    attempts := attempts + 1;
    IF attempts > 1000 THEN
      RAISE EXCEPTION 'Unable to generate a unique student code';
    END IF;

    candidate := 'TTA-'
      || LPAD(FLOOR(RANDOM() * 100000)::INTEGER::TEXT, 5, '0')
      || CHR(65 + FLOOR(RANDOM() * 26)::INTEGER);

    IF NOT EXISTS (
      SELECT 1
      FROM public.students
      WHERE student_code = candidate
    ) THEN
      RETURN candidate;
    END IF;
  END LOOP;
END;
$$;

DO $$
DECLARE
  student_record RECORD;
BEGIN
  FOR student_record IN
    SELECT id
    FROM public.students
    WHERE student_code IS NULL OR BTRIM(student_code) = ''
    ORDER BY id
  LOOP
    UPDATE public.students
    SET student_code = public.generate_student_code()
    WHERE id = student_record.id;
  END LOOP;
END;
$$;

ALTER TABLE public.students
  ALTER COLUMN student_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS students_student_code_key
  ON public.students (student_code);

CREATE OR REPLACE FUNCTION public.assign_student_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.student_code := public.generate_student_code();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_student_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_student_code() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS assign_student_code_before_insert ON public.students;
CREATE TRIGGER assign_student_code_before_insert
  BEFORE INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_student_code();

COMMIT;
