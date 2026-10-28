BEGIN;

UPDATE public.email_templates
SET body_html = overlay(
  body_html
  placing '<p style="margin:22px 0;text-align:center"><a href="https://checkout.korapay.com/pay/IDtLOhlcCJIKaeb" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 30px;border-radius:8px;background-color:#2563eb;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:20px;text-align:center;text-decoration:none">Pay here</a></p>'
  from strpos(lower(body_html), CASE
    WHEN position('complete your tuition fee payment' in lower(body_html)) > 0
      THEN 'complete your tuition fee payment'
    ELSE 'application fee payment'
  END)
    + strpos(
      substr(lower(body_html), strpos(lower(body_html), CASE
        WHEN position('complete your tuition fee payment' in lower(body_html)) > 0
          THEN 'complete your tuition fee payment'
        ELSE 'application fee payment'
      END)),
      '</p>'
    )
    + 3
)
WHERE id = 'welcome'
  AND (
    position('complete your tuition fee payment' in lower(body_html)) > 0
    OR position('application fee payment' in lower(body_html)) > 0
  )
  AND position('checkout.korapay.com/pay/IDtLOhlcCJIKaeb' in body_html) = 0;

COMMIT;
