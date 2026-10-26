export type EmailTemplate = {
  id: string
  name: string
  description: string
  subject: string
  body: string
}

export const academyEmailAccent = "#087443"
export const academyLogoUrl = "https://res.cloudinary.com/djdbcoyot/image/upload/v1792461501/f71wqoiubyqksegyfftn.jpg"
export const academyEmailBannerUrl = "https://res.cloudinary.com/djdbcoyot/image/upload/v1792461169/ts7byne6svvjsif1pfua.png"

export const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome email",
    description: "Welcome a learner and share what to expect next.",
    subject: "Welcome to Tech Trailblazer Academy!",
    body: "Hi {{name}},\n\nYour journey in {{course}} at TECH TRAILBLAZER ACADEMY is about to begin, and we're excited to have you on board!\n\nYour student ID is included below for easy reference:\nStudent ID: {{student_id}}\n\nHere's what you can look forward to during your learning journey:\n• Beginner-Friendly Learning: Start from the fundamentals and build your skills step by step, with no prior experience required.\n• Flexible Online Classes: Attend live interactive sessions or learn at your own pace with high-quality recorded lessons. Classes run 3–4 days a week, with regular assessments throughout your 4-month program (or 3 months, depending on your chosen course).\n• Student Community & Networking: Connect with fellow students, mentors, and alumni through our vibrant community channels, networking events, and student hangouts.\n• Assessments & Personalized Feedback: Measure your progress through quizzes, assignments, and constructive feedback from experienced mentors.\n• Capstone Project: Put your knowledge into practice by working on a real-world project that strengthens your portfolio and demonstrates your skills to employers.\n• Career & Job Placement Support: Receive personalized guidance with your CV, LinkedIn profile, portfolio, and interview preparation, and gain access to internship and job opportunities.\n• Alumni Network: Join a growing community of graduates who continue to learn, collaborate, and thrive in various tech industries.\n\nStart date: 20 January 2027\nEnd date: 20 May 2027\n\nIf you haven't already completed your application fee payment, use the button below to secure your spot for the program.\n{{korapay_payment_link}}\n\nAt TECH TRAILBLAZER ACADEMY, you're not just enrolling in a course; you're joining a community dedicated to helping you build in-demand skills, grow your professional network, and launch a successful career in tech.\n\nWe look forward to welcoming you!",
  },
  {
    id: "payment-confirmation",
    name: "Payment confirmation",
    description: "Confirm a learner's payment and enrollment status.",
    subject: "Payment confirmation - Tech Trailblazer Academy",
    body: "We’re pleased to confirm that your payment for Tech Trailblazer Academy has been received and recorded. Thank you for completing this step in your enrollment. We appreciate your trust in our team and look forward to supporting you throughout your course.\n\nEnrollment reference:\nCourse: {{course}}\nStudent ID: {{student_id}}\n\nPlease retain this email as confirmation for your records. Our team will share any relevant course access information and upcoming updates with you through your registered email address. If you believe this confirmation was sent in error or have a question about your enrollment, please reply to this message so we can assist.\n\nThank you once again. We look forward to having you with us.",
  },
  {
    id: "payment-reminder",
    name: "Payment reminder",
    description: "Remind a learner about an outstanding payment.",
    subject: "A reminder about your course payment",
    body: "We hope you’re doing well. Our records indicate that a payment for your Tech Trailblazer Academy enrollment may still be outstanding. We’re reaching out with a friendly reminder so you have an opportunity to review your payment status.\n\nEnrollment reference:\nCourse: {{course}}\nStudent ID: {{student_id}}\n\nIf you have already completed your payment, please reply to this email with any relevant confirmation details so our team can review and update your record. If you have questions or need assistance understanding the next steps, please get in touch by replying to this message.\n\nThank you for your attention, and for being part of the Tech Trailblazer Academy learning community.",
  },
  {
    id: "installment-update",
    name: "Installment update",
    description: "Share an update about an installment payment.",
    subject: "Update on your installment payment",
    body: "We’re getting in touch regarding the installment arrangement associated with your enrollment at Tech Trailblazer Academy. Please review your latest payment information and keep this message with your records.\n\nEnrollment reference:\nCourse: {{course}}\nStudent ID: {{student_id}}\n\nFor the most up-to-date information about your installment status or any amount due, please contact our team directly by replying to this email. If you have already made a recent payment, you’re welcome to share the confirmation so we can help verify that your record is up to date.\n\nThank you for your continued communication and for learning with Tech Trailblazer Academy. We’re happy to assist with any questions.",
  },
  {
    id: "class-kickoff",
    name: "Class kickoff",
    description: "Help a learner prepare for the start of class.",
    subject: "Your class is about to kick off!",
    body: "We’re pleased to let you know that your class kickoff is approaching. The Tech Trailblazer Academy team is looking forward to welcoming you and supporting you as you begin learning with your cohort.\n\nClass reference:\nCourse: {{course}}\nStudent ID: {{student_id}}\n\nBefore your class begins, please check your inbox regularly for course access details, schedule information, and any preparation guidance shared by the team. We recommend keeping your student ID available when you contact us so we can assist you efficiently. If you have already received your kickoff instructions, please refer to those details for the most current information.\n\nIf you have a question or need help preparing, reply to this email and our team will be happy to help. We look forward to seeing you in class!",
  },
]

export function ensurePersonalization(body: string) {
  let personalizedBody = body.trim()
  if (!personalizedBody.includes("{{first_name}}") && !personalizedBody.includes("{{name}}")) {
    personalizedBody = `Hello {{first_name}},\n\n${personalizedBody}`
  }
  if (!personalizedBody.includes("{{student_id}}")) {
    personalizedBody = `${personalizedBody}\n\nStudent ID: {{student_id}}`
  }
  if (!/\b(kind regards|best regards|sincerely)\b/i.test(personalizedBody)) {
    personalizedBody = `${personalizedBody}\n\nKind regards,\nTech Trailblazer Academy Team`
  }
  return personalizedBody
}

export function renderEmailText(
  body: string,
  student: { name: string; studentCode: string; course: string },
) {
  const firstName = student.name.trim().split(/\s+/)[0] || student.name
  return ensurePersonalization(body)
    .replaceAll("{{first_name}}", firstName)
    .replaceAll("{{name}}", student.name)
    .replaceAll("{{student_id}}", student.studentCode)
    .replaceAll("{{course}}", student.course)
}

export type EmailBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullet-list"; items: string[] }
  | { type: "payment-link-placeholder" }
  | { type: "course-dates"; entries: { label: string; value: string }[] }
  | { type: "details"; entries: { label: string; value: string }[] }

export function getEmailBodyBlocks(body: string): EmailBodyBlock[] {
  const blocks: EmailBodyBlock[] = []
  let paragraph: string[] = []
  let bulletItems: string[] = []
  let courseDates: { label: string; value: string }[] = []
  let details: { label: string; value: string }[] = []

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ") })
    paragraph = []
  }
  const flushBullets = () => {
    if (bulletItems.length) blocks.push({ type: "bullet-list", items: bulletItems })
    bulletItems = []
  }
  const flushCourseDates = () => {
    if (courseDates.length) blocks.push({ type: "course-dates", entries: courseDates })
    courseDates = []
  }
  const flushDetails = () => {
    if (details.length) blocks.push({ type: "details", entries: details })
    details = []
  }

  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) {
      flushParagraph()
      flushBullets()
      flushCourseDates()
      flushDetails()
      continue
    }
    if (trimmed === "{{korapay_payment_link}}") {
      flushParagraph()
      flushBullets()
      flushCourseDates()
      flushDetails()
      blocks.push({ type: "payment-link-placeholder" })
      continue
    }
    const date = trimmed.match(/^(Start date|End date):\s*(.*)$/i)
    if (date) {
      flushParagraph()
      flushBullets()
      flushDetails()
      courseDates.push({
        label: date[1].toLowerCase() === "start date" ? "Start date" : "End date",
        value: date[2],
      })
      continue
    }
    const detail = trimmed.match(/^(Course|Student ID):\s*(.*)$/i)
    if (detail) {
      flushParagraph()
      flushBullets()
      flushCourseDates()
      details.push({
        label: detail[1].toLowerCase() === "course" ? "Course" : "Student ID",
        value: detail[2],
      })
    } else if (trimmed.startsWith("• ")) {
      flushParagraph()
      flushCourseDates()
      flushDetails()
      bulletItems.push(trimmed.slice(2))
    } else {
      flushBullets()
      flushCourseDates()
      flushDetails()
      paragraph.push(trimmed)
    }
  }

  flushParagraph()
  flushBullets()
  flushCourseDates()
  flushDetails()
  return blocks
}
