import { socialLinks } from "@/lib/social-links"

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
    body: "Hi {{name}},\n\nYour journey to becoming a *{{course}}* at *TECH TRAILBLAZER ACADEMY* is about to begin, and we're excited to have you on board!\n\nHere are your enrollment details:\n• Student ID: {{student_id}}\n• Course: *{{course}}*\n• Tuition Fee: *N50,000*\n• Discounted Fee: ~N476,000~\n• Tuition Balance: *N50,000*\n• Start Date: *January 20, 2027*\n• End Date: *May 20, 2027*\n• Duration: *4 months*\n• Schedule: *4 days a week*\n• Delivery Mode: *Online* (live classes or self-paced recordings)\n\nIf you haven’t already, please complete your tuition fee payment of N50,000 to confirm your scholarship and reserve your place.\n{{korapay_payment_link}}\n\nWe’re excited to welcome you to TECH TRAILBLAZER ACADEMY and support you throughout your learning journey!\n{{whatsapp_community_link}}",
  },
  {
    id: "payment-confirmation",
    name: "Payment confirmation",
    description: "Confirm a learner's payment and enrollment status.",
    subject: "Payment confirmation - Tech Trailblazer Academy",
    body: "Hi {{name}},\n\nWe are pleased to inform you that we have received your payment (N50,000 only) toward becoming a *{{course}}* student at Tech Trailblazer Academy.\n\nYour spot has been confirmed and reserved. We are thrilled to have you join us! We will share your onboarding details, schedule, and next steps shortly.\n\nFollow us:\n{{social_links}}\n\nIf you have any questions in the meantime, feel free to reply to this email or leave us a message on WhatsApp: +234 803 482 6276 (https://wa.me/2348034826276).\n\nBest regards,\nTech Trailblazer Academy Team",
  },
  {
    id: "payment-proof-rejection",
    name: "Payment proof update",
    description: "Let a learner know their payment proof needs another look.",
    subject: "Action needed: please resubmit your payment proof",
    body: "Hi {{name}},\n\nThank you for sending your payment proof for *{{course}}*. We were unable to confirm the payment from the image provided.\n\nReview note: {{reason}}\n\nPlease check that your receipt image is clear and shows the payment details, then submit a new proof from our website. If you believe this was sent in error, reply to this email and our team will be happy to help.\n\nBest regards,\nTech Trailblazer Academy Team",
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
    .replaceAll("{{social_links}}", socialLinks.map(({ name, handle, href }) => `${name}: ${handle} — ${href}`).join("\n"))
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
