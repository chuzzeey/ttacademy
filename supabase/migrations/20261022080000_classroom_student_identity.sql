BEGIN;

ALTER TABLE public.classroom_students
  ADD COLUMN IF NOT EXISTS auth_user_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'classroom_students_auth_user_id_fkey'
      AND conrelid = 'public.classroom_students'::regclass
  ) THEN
    ALTER TABLE public.classroom_students
      ADD CONSTRAINT classroom_students_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users (id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS classroom_students_auth_user_id_key
  ON public.classroom_students (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_classroom_student_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_slug TEXT;
BEGIN
  SELECT c.slug INTO target_slug
  FROM public.classroom_courses AS c
  WHERE lower(c.title) = lower(trim(NEW.course))
    OR c.slug = trim(both '-' FROM regexp_replace(lower(trim(NEW.course)), '[^a-z0-9]+', '-', 'g'))
  ORDER BY CASE WHEN lower(c.title) = lower(trim(NEW.course)) THEN 0 ELSE 1 END
  LIMIT 1;

  INSERT INTO public.classroom_students (student_id, course_slug, status)
  SELECT NEW.id, target_slug, CASE WHEN COALESCE(NEW.restricted, FALSE) THEN 'restricted' ELSE 'pending' END
  WHERE target_slug IS NOT NULL
  ON CONFLICT (student_id) DO UPDATE
  SET course_slug = EXCLUDED.course_slug,
      status = CASE WHEN COALESCE(NEW.restricted, FALSE) THEN 'restricted' ELSE 'pending' END,
      updated_at = NOW();

  RETURN NEW;
END;
$$;

UPDATE public.classroom_students AS cs
SET course_slug = c.slug
FROM public.students AS s
JOIN public.classroom_courses AS c
  ON lower(c.title) = lower(trim(s.course))
  OR c.slug = trim(both '-' FROM regexp_replace(lower(trim(s.course)), '[^a-z0-9]+', '-', 'g'))
WHERE cs.student_id = s.id
  AND cs.course_slug <> c.slug;

CREATE OR REPLACE FUNCTION public.can_access_classroom(p_course_slug TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM public.admin_profiles AS a
        WHERE a.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.classroom_teachers AS t
        JOIN public.classroom_rooms AS r USING (course_slug)
        WHERE t.user_id = auth.uid()
          AND t.course_slug = p_course_slug
          AND t.status = 'approved'
          AND r.is_locked = FALSE
      )
      OR EXISTS (
        SELECT 1
        FROM public.classroom_students AS cs
        JOIN public.students AS s ON s.id = cs.student_id
        JOIN public.classroom_rooms AS r ON r.course_slug = cs.course_slug
        WHERE cs.auth_user_id = auth.uid()
          AND cs.course_slug = p_course_slug
          AND cs.status = 'approved'
          AND COALESCE(s.restricted, FALSE) = FALSE
          AND lower(COALESCE(s.payment_status, '')) IN ('fully paid', '1st installment', '2nd installment')
          AND r.is_locked = FALSE
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.classroom_user_name(p_course_slug TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT full_name FROM public.admin_profiles WHERE user_id = auth.uid()),
    (SELECT display_name FROM public.classroom_teachers
      WHERE user_id = auth.uid() AND course_slug = p_course_slug AND status = 'approved'),
    (SELECT s.name FROM public.classroom_students AS cs
      JOIN public.students AS s ON s.id = cs.student_id
      WHERE cs.auth_user_id = auth.uid()
        AND cs.course_slug = p_course_slug
        AND cs.status = 'approved'
        AND COALESCE(s.restricted, FALSE) = FALSE
        AND lower(COALESCE(s.payment_status, '')) IN ('fully paid', '1st installment', '2nd installment')),
    auth.jwt() ->> 'email',
    'Classroom member'
  );
$$;

DROP POLICY IF EXISTS "Students read their own classroom approval" ON public.classroom_students;
CREATE POLICY "Students read their own classroom approval"
  ON public.classroom_students FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

COMMIT;
