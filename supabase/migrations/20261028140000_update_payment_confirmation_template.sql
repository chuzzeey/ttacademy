BEGIN;

UPDATE public.email_templates
SET body_html = '<p>Hi {{name}},</p>
<p>We are pleased to inform you that we have received your payment (N50,000 only) toward becoming a <strong>{{course}}</strong> student at Tech Trailblazer Academy.</p>
<p>Your spot has been confirmed and reserved. We are thrilled to have you join us! We will share your onboarding details, schedule, and next steps shortly.</p>
<p>Follow us on Instagram: <a href="https://www.instagram.com/techtrailblazeracademy?mdxt=MXg5dWkydmo4cXJ6&amp;utm_source=qr">Tech Trailblazer Academy on Instagram</a><br>
Follow us on TikTok: <a href="https://www.tiktok.com/@techacademy4all?_r=1&amp;_t=ZS-9AsoRfOnEXv">Tech Trailblazer Academy on TikTok</a><br>
Follow us on X: <a href="https://x.com/techacademy4all?s=11">Tech Trailblazer Academy on X</a><br>
Follow us on Facebook: <a href="https://www.facebook.com/share/1BJMaL2UzV/?mibextid=wwXIfr">Tech Trailblazer Academy on Facebook</a></p>
<p>If you have any questions in the meantime, feel free to reply to this email or leave us a message on WhatsApp: +234 803 482 6276 (<a href="https://wa.me/2348034826276">Chat with us on WhatsApp</a>).</p>
<p>Best regards,<br>
Tech Trailblazer Academy Team</p>'
WHERE id = 'payment-confirmation';

COMMIT;
