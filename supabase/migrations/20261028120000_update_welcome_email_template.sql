BEGIN;

UPDATE public.email_templates
SET body_html = '<p>Hi {{name}},</p>
<p>Your journey to becoming a UI/UX Designer at <strong>TECH TRAILBLAZER ACADEMY</strong> is about to begin, and we''re excited to have you on board!</p>
<p>Here are your enrollment details:</p>
<ul>
  <li><strong>Student ID:</strong> {{student_id}}</li>
  <li><strong>Course:</strong> {{course}}</li>
  <li><strong>Tuition Fee:</strong> N50,000</li>
  <li><strong>Discounted Fee:</strong> <s>N476,000</s></li>
  <li><strong>Tuition Balance:</strong> N50,000</li>
  <li><strong>Start Date:</strong> January 20, 2027</li>
  <li><strong>End Date:</strong> May 20, 2027</li>
  <li><strong>Duration:</strong> 4 months</li>
  <li><strong>Schedule:</strong> 4 days a week</li>
  <li><strong>Delivery Mode:</strong> Online (live classes or self-paced recordings)</li>
</ul>
<p>If you haven’t already, please complete your tuition fee payment of N50,000 to confirm your scholarship and reserve your place. Use the payment link or button provided by the Academy.</p>
<p>We’re excited to welcome you to TECH TRAILBLAZER ACADEMY and support you throughout your learning journey!</p>'
WHERE id = 'welcome';

COMMIT;
