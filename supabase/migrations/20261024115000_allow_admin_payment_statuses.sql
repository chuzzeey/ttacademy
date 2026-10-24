BEGIN;

ALTER TABLE public.students
  DROP CONSTRAINT IF EXISTS students_payment_plan_check;

ALTER TABLE public.students
  ADD CONSTRAINT students_payment_plan_check
  CHECK (
    payment_plan = ANY (ARRAY[
      'Select a plan',
      'Not Paid Yet',
      'Not Paid',
      'Fully Paid',
      '1st installment',
      '2nd installment',
      '1st Installment',
      '2nd Installment'
    ]::TEXT[])
  );

COMMIT;
