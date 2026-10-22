BEGIN;

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
      lower(COALESCE(auth.jwt() ->> 'email', '')) = 'adminb@atomic.io'
      OR EXISTS (
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

CREATE OR REPLACE FUNCTION public.classroom_user_role(p_course_slug TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT CASE
    WHEN lower(COALESCE(auth.jwt() ->> 'email', '')) = 'adminb@atomic.io'
      OR EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid())
      THEN 'admin'
    WHEN EXISTS (
      SELECT 1
      FROM public.classroom_teachers AS t
      JOIN public.classroom_rooms AS r USING (course_slug)
      WHERE t.user_id = auth.uid()
        AND t.course_slug = p_course_slug
        AND t.status = 'approved'
        AND r.is_locked = FALSE
    ) THEN 'teacher'
    WHEN public.can_access_classroom(p_course_slug) THEN 'student'
    ELSE NULL
  END;
$$;

COMMIT;
