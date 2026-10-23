-- Run this migration in the Supabase SQL Editor after the current students
-- schema is installed. The dashboard calls this function through service_role.

CREATE INDEX IF NOT EXISTS idx_students_created_at
  ON public.students (created_at DESC);

CREATE OR REPLACE FUNCTION public.admin_dashboard_analytics(p_period TEXT DEFAULT '30d')
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  local_today DATE := (NOW() AT TIME ZONE 'Africa/Lagos')::DATE;
  range_start DATE;
  previous_start DATE;
  previous_end DATE;
  bucket_grain TEXT;
  bucket_start TIMESTAMP;
  bucket_end TIMESTAMP;
  total_students BIGINT;
  period_students BIGINT;
  previous_students BIGINT;
  students_with_state BIGINT;
  location_label TEXT;
  trend_data JSONB;
  location_data JSONB;
  course_data JSONB;
  sex_data JSONB;
  payment_data JSONB;
  weekday_data JSONB;
  recent_data JSONB;
BEGIN
  IF p_period NOT IN ('7d', '30d', '90d', '12m', 'all') THEN
    RAISE EXCEPTION 'Invalid analytics period';
  END IF;

  CASE p_period
    WHEN '7d' THEN
      range_start := local_today - 6;
      previous_start := range_start - 7;
      previous_end := range_start - 1;
      bucket_grain := 'day';
    WHEN '30d' THEN
      range_start := local_today - 29;
      previous_start := range_start - 30;
      previous_end := range_start - 1;
      bucket_grain := 'day';
    WHEN '90d' THEN
      range_start := local_today - 89;
      previous_start := range_start - 90;
      previous_end := range_start - 1;
      bucket_grain := 'week';
    WHEN '12m' THEN
      range_start := DATE_TRUNC('month', local_today - INTERVAL '11 months')::DATE;
      previous_start := (range_start - INTERVAL '12 months')::DATE;
      previous_end := range_start - 1;
      bucket_grain := 'month';
    WHEN 'all' THEN
      SELECT COALESCE(
        MIN((created_at AT TIME ZONE 'Africa/Lagos')::DATE),
        local_today
      )
      INTO range_start
      FROM public.students;
      previous_start := NULL;
      previous_end := NULL;
      bucket_grain := 'month';
  END CASE;

  IF p_period = '90d' THEN
    bucket_start := DATE_TRUNC('week', range_start::TIMESTAMP);
  ELSIF p_period IN ('12m', 'all') THEN
    bucket_start := DATE_TRUNC('month', range_start::TIMESTAMP);
  ELSE
    bucket_start := range_start::TIMESTAMP;
  END IF;

  IF p_period = '90d' THEN
    bucket_end := DATE_TRUNC('week', local_today::TIMESTAMP);
  ELSIF p_period IN ('12m', 'all') THEN
    bucket_end := DATE_TRUNC('month', local_today::TIMESTAMP);
  ELSE
    bucket_end := local_today::TIMESTAMP;
  END IF;

  SELECT COUNT(*) INTO total_students FROM public.students;

  SELECT COUNT(*)
  INTO period_students
  FROM public.students
  WHERE created_at IS NOT NULL
    AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE BETWEEN range_start AND local_today;

  IF previous_start IS NULL THEN
    previous_students := NULL;
  ELSE
    SELECT COUNT(*)
    INTO previous_students
    FROM public.students
    WHERE created_at IS NOT NULL
      AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE BETWEEN previous_start AND previous_end;
  END IF;

  WITH buckets AS (
    SELECT GENERATE_SERIES(bucket_start, bucket_end, ('1 ' || bucket_grain)::INTERVAL) AS bucket
  ),
  registrations AS (
    SELECT DATE_TRUNC(
      bucket_grain,
      created_at AT TIME ZONE 'Africa/Lagos'
    ) AS bucket
    FROM public.students
    WHERE created_at IS NOT NULL
      AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE BETWEEN range_start AND local_today
  )
  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'period', TO_CHAR(bucket_counts.bucket, 'YYYY-MM-DD'),
        'registrations', bucket_counts.registrations
      ) ORDER BY bucket_counts.bucket
    ),
    '[]'::JSONB
  )
  INTO trend_data
  FROM (
    SELECT buckets.bucket, COUNT(registrations.bucket) AS registrations
    FROM buckets
    LEFT JOIN registrations USING (bucket)
    GROUP BY buckets.bucket
  ) AS bucket_counts;

  SELECT COUNT(*)
  INTO students_with_state
  FROM public.students
  WHERE created_at IS NOT NULL
    AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE BETWEEN range_start AND local_today
    AND NULLIF(BTRIM(state), '') IS NOT NULL;

  location_label := CASE WHEN students_with_state > 0 THEN 'State' ELSE 'Country' END;

  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT('label', label, 'count', count)
      ORDER BY count DESC, label
    ),
    '[]'::JSONB
  )
  INTO location_data
  FROM (
    SELECT
      COALESCE(
        NULLIF(BTRIM(CASE WHEN students_with_state > 0 THEN state ELSE country END), ''),
        'Not provided'
      ) AS label,
      COUNT(*) AS count
    FROM public.students
    WHERE created_at IS NOT NULL
      AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE BETWEEN range_start AND local_today
    GROUP BY label
  ) AS locations;

  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT('label', label, 'count', count)
      ORDER BY count DESC, label
    ),
    '[]'::JSONB
  )
  INTO course_data
  FROM (
    SELECT COALESCE(NULLIF(BTRIM(course), ''), 'Unspecified') AS label, COUNT(*) AS count
    FROM public.students
    WHERE created_at IS NOT NULL
      AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE BETWEEN range_start AND local_today
    GROUP BY label
  ) AS courses;

  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT('label', label, 'count', count)
      ORDER BY count DESC, label
    ),
    '[]'::JSONB
  )
  INTO sex_data
  FROM (
    SELECT COALESCE(NULLIF(BTRIM(sex), ''), 'Not recorded') AS label, COUNT(*) AS count
    FROM public.students
    WHERE created_at IS NOT NULL
      AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE BETWEEN range_start AND local_today
    GROUP BY label
  ) AS sexes;

  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT('label', label, 'count', count)
      ORDER BY count DESC, label
    ),
    '[]'::JSONB
  )
  INTO payment_data
  FROM (
    SELECT
      CASE
        WHEN LOWER(BTRIM(payment_status)) IN ('not paid', 'not paid yet') THEN 'Not Paid Yet'
        ELSE COALESCE(NULLIF(BTRIM(payment_status), ''), 'Not recorded')
      END AS label,
      COUNT(*) AS count
    FROM public.students
    WHERE created_at IS NOT NULL
      AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE BETWEEN range_start AND local_today
    GROUP BY label
  ) AS payments;

  WITH weekdays AS (
    SELECT GENERATE_SERIES(1, 7) AS weekday
  ),
  registrations AS (
    SELECT EXTRACT(ISODOW FROM created_at AT TIME ZONE 'Africa/Lagos')::INT AS weekday, COUNT(*) AS count
    FROM public.students
    WHERE created_at IS NOT NULL
      AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE BETWEEN range_start AND local_today
    GROUP BY weekday
  )
  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'label', TO_CHAR(DATE '2001-01-01' + weekdays.weekday - 1, 'Dy'),
        'count', COALESCE(registrations.count, 0)
      )
      ORDER BY weekdays.weekday
    ),
    '[]'::JSONB
  )
  INTO weekday_data
  FROM weekdays
  LEFT JOIN registrations USING (weekday);

  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', recent.id,
        'name', recent.name,
        'course', recent.course,
        'country', recent.country,
        'state', recent.state,
        'paymentStatus', recent.payment_status,
        'createdAt', recent.created_at
      )
      ORDER BY recent.created_at DESC
    ),
    '[]'::JSONB
  )
  INTO recent_data
  FROM (
    SELECT id, name, course, country, state, payment_status, created_at
    FROM public.students
    WHERE created_at IS NOT NULL
      AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE BETWEEN range_start AND local_today
    ORDER BY created_at DESC
    LIMIT 8
  ) AS recent;

  RETURN JSONB_BUILD_OBJECT(
    'period', p_period,
    'rangeStart', range_start,
    'rangeEnd', local_today,
    'totalStudents', total_students,
    'periodRegistrations', period_students,
    'previousPeriodRegistrations', previous_students,
    'locationLabel', location_label,
    'trend', trend_data,
    'locations', location_data,
    'courses', course_data,
    'sexDistribution', sex_data,
    'paymentStatuses', payment_data,
    'weekdays', weekday_data,
    'recentRegistrations', recent_data
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_analytics(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_analytics(TEXT) TO service_role;
