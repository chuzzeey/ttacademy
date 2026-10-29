BEGIN;

DELETE FROM public.admin_profiles
WHERE lower(email) = 'adminb@atomic.io';

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

DROP POLICY IF EXISTS "Admins can receive student realtime updates" ON public.students;
DROP POLICY IF EXISTS "Admins receive student updates" ON public.students;
CREATE POLICY "Admins receive student updates"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (
    lower(auth.jwt() ->> 'email') = 'amahchibu@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins receive classroom management updates on rooms" ON public.classroom_rooms;
CREATE POLICY "Admins receive classroom management updates on rooms"
  ON public.classroom_rooms
  FOR SELECT
  TO authenticated
  USING (
    lower(auth.jwt() ->> 'email') = 'amahchibu@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins receive classroom management updates on teachers" ON public.classroom_teachers;
CREATE POLICY "Admins receive classroom management updates on teachers"
  ON public.classroom_teachers
  FOR SELECT
  TO authenticated
  USING (
    lower(auth.jwt() ->> 'email') = 'amahchibu@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins receive classroom management updates on students" ON public.classroom_students;
CREATE POLICY "Admins receive classroom management updates on students"
  ON public.classroom_students
  FOR SELECT
  TO authenticated
  USING (
    lower(auth.jwt() ->> 'email') = 'amahchibu@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  );

DO $$
BEGIN
  IF to_regclass('public.payment_proofs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins receive payment proof realtime updates" ON public.payment_proofs;
    CREATE POLICY "Admins receive payment proof realtime updates"
      ON public.payment_proofs
      FOR SELECT
      TO authenticated
      USING (
        lower(auth.jwt() ->> 'email') = 'amahchibu@gmail.com'
        OR EXISTS (
          SELECT 1 FROM public.admin_profiles
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
DECLARE
  function_definition TEXT;
BEGIN
  SELECT pg_get_functiondef('public.can_access_classroom(text)'::regprocedure)
  INTO function_definition;
  EXECUTE replace(function_definition, 'adminb@atomic.io', 'amahchibu@gmail.com');

  SELECT pg_get_functiondef('public.classroom_user_role(text)'::regprocedure)
  INTO function_definition;
  EXECUTE replace(function_definition, 'adminb@atomic.io', 'amahchibu@gmail.com');
END $$;

COMMIT;
