import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { requireAdmin } from "@/lib/supabase/require-admin"
import { emailTemplates, renderEmailText } from "@/lib/email/templates"
import { createEmailHtml, createSmtpTransport } from "@/lib/email/smtp"
import { formatEmailSocialLinks, plainTextFromEmailHtml, plainTextToEmailHtml, sanitizeEmailHtml } from "@/lib/email/sanitize"

type ReviewAction = "approved" | "rejected"

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;")
}

async function releaseReviewLock(supabase: Awaited<ReturnType<typeof createAdminClient>>, id: string) {
  const { error } = await supabase
    .from("payment_proofs")
    .update({ status: "pending", reviewed_by: null, reviewed_at: null })
    .eq("id", id)
    .eq("status", "processing")
  if (error) console.error("Payment proof review lock release failed:", error)
  return !error
}

export async function POST(request: NextRequest, { params }: { params: Promise<unknown> }) {
  const access = await requireAdmin()
  if (access.response) return access.response

  let transport: ReturnType<typeof createSmtpTransport> | undefined
  let supabase: Awaited<ReturnType<typeof createAdminClient>> | undefined
  let lockedProofId: string | null = null
  try {
    const routeParams = await params
    const id = routeParams && typeof routeParams === "object" && "id" in routeParams && typeof routeParams.id === "string"
      ? routeParams.id
      : ""
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "Invalid payment proof." }, { status: 400 })
    }
    const payload: unknown = await request.json()
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Choose whether to approve or reject this proof." }, { status: 400 })
    }
    const { action, reason } = payload as Record<string, unknown>
    if (action !== "approved" && action !== "rejected") {
      return NextResponse.json({ error: "Choose whether to approve or reject this proof." }, { status: 400 })
    }
    if (reason !== undefined && (typeof reason !== "string" || reason.length > 500)) {
      return NextResponse.json({ error: "The rejection note must be 500 characters or fewer." }, { status: 400 })
    }
    const rejectionReason = typeof reason === "string" && reason.trim()
      ? reason.trim()
      : "We were unable to verify the payment from the image provided. Please check that the receipt is clear and shows the payment details, then submit a new proof."
    const templateId = action === "approved" ? "payment-confirmation" : "payment-proof-rejection"
    const fallbackTemplate = emailTemplates.find(({ id: templateIdItem }) => templateIdItem === templateId)
    if (!fallbackTemplate) throw new Error(`Missing email template: ${templateId}`)

    supabase = await createAdminClient()
    const { data: proof, error: proofError } = await supabase
      .from("payment_proofs")
      .update({ status: "processing", reviewed_by: access.user.id, reviewed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "pending")
      .select("id,student_id,student_code,student_name,student_email,course,status")
      .maybeSingle()
    if (proofError) {
      console.error("Payment proof review lock failed:", proofError)
      return NextResponse.json({ error: "Unable to start reviewing this payment proof." }, { status: 500 })
    }
    if (!proof) {
      return NextResponse.json({ error: "This proof is no longer pending review. Refresh the list and check its status." }, { status: 409 })
    }
    lockedProofId = id

    const { data: savedTemplate, error: templateError } = await supabase
      .from("email_templates")
      .select("subject,body_html,banner_headline,banner_subtitle")
      .eq("id", templateId)
      .maybeSingle()
    if (templateError) {
      console.error("Payment proof notification template lookup failed:", templateError)
      await releaseReviewLock(supabase, id)
      lockedProofId = null
      return NextResponse.json({ error: "Unable to load the email template for this review." }, { status: 500 })
    }

    const student = {
      name: proof.student_name || "Learner",
      studentCode: proof.student_code,
      course: proof.course || "Tech Trailblazer Academy",
    }
    const body = fallbackTemplate.body.replaceAll("{{reason}}", rejectionReason)
    const personalizedBody = renderEmailText(body, student)
    const savedHtml = savedTemplate?.body_html
      ? sanitizeEmailHtml(savedTemplate.body_html)
      : plainTextToEmailHtml(fallbackTemplate.body)
    const safeHtmlStudent = {
      name: escapeHtml(student.name),
      studentCode: escapeHtml(student.studentCode),
      course: escapeHtml(student.course),
    }
    const personalizedHtml = renderEmailText(
      formatEmailSocialLinks(savedHtml.replaceAll("{{reason}}", escapeHtml(rejectionReason))),
      safeHtmlStudent,
    )
    const subject = savedTemplate?.subject || fallbackTemplate.subject
    const bannerHeadline = savedTemplate?.banner_headline || fallbackTemplate.name
    const bannerSubtitle = savedTemplate?.banner_subtitle || fallbackTemplate.description

    let deliveryStatus: "sent" | "failed" = "sent"
    let deliveryError: string | null = null
    let messageId: string | null = null
    try {
      transport = createSmtpTransport()
      const sent = await transport.transport.sendMail({
        from: { name: transport.sender.name, address: transport.sender.address },
        to: proof.student_email,
        subject,
        text: plainTextFromEmailHtml(personalizedHtml) || personalizedBody,
        html: createEmailHtml(personalizedBody, transport.replyTo, { bannerHeadline, bannerSubtitle }, student.course, personalizedHtml),
        replyTo: transport.replyTo,
      })
      messageId = sent.messageId || null
      if (sent.rejected.length > 0 || sent.accepted.length === 0) {
        deliveryStatus = "failed"
        deliveryError = "The SMTP server did not accept this recipient."
      }
    } catch (error) {
      deliveryStatus = "failed"
      deliveryError = error instanceof Error ? error.message : "SMTP delivery failed."
    }

    const { error: logError } = await supabase.from("email_delivery_logs").insert({
      recipient_student_id: proof.student_id,
      recipient_name: proof.student_name || "Learner",
      recipient_email: proof.student_email,
      student_code: proof.student_code,
      template_id: templateId,
      subject,
      body_text: personalizedBody,
      body_html: personalizedHtml,
      banner_headline: bannerHeadline,
      banner_subtitle: bannerSubtitle,
      status: deliveryStatus,
      error_message: deliveryError,
      smtp_message_id: messageId,
      sent_at: deliveryStatus === "sent" ? new Date().toISOString() : null,
      created_by: access.user.id,
    })
    if (logError) console.error("Payment proof notification email history insert failed:", logError)

    const { error: reviewError } = await supabase.rpc("finalize_payment_proof_review", {
      p_proof_id: id,
      p_action: action,
      p_reason: action === "rejected" ? rejectionReason : null,
      p_reviewed_by: access.user.id,
      p_notification_status: deliveryStatus,
      p_notification_template_id: templateId,
      p_notification_subject: subject,
      p_notification_error: deliveryError,
      p_notification_sent_at: deliveryStatus === "sent" ? new Date().toISOString() : null,
    })
    if (reviewError) {
      console.error("Payment proof review completion failed:", reviewError)
      await releaseReviewLock(supabase, id)
      lockedProofId = null
      return NextResponse.json({ error: "Email was processed, but the proof review status could not be saved." }, { status: 500 })
    }
    lockedProofId = null
    if (logError) {
      return NextResponse.json({
        reviewed: action,
        warning: "The proof decision and email were processed, but the email history could not be saved. Check the email logs before retrying.",
      })
    }
    if (deliveryStatus === "failed") {
      return NextResponse.json({
        reviewed: action,
        warning: `The proof was ${action}, but the notification email failed: ${deliveryError}`,
      }, { status: 200 })
    }
    return NextResponse.json({ reviewed: action, emailSent: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to review this payment proof."
    if (supabase && lockedProofId) await releaseReviewLock(supabase, lockedProofId)
    if (message.startsWith("SMTP is not configured.")) {
      return NextResponse.json({ error: message }, { status: 503 })
    }
    console.error("Payment proof review request failed:", error)
    return NextResponse.json({ error: "Unable to review this payment proof." }, { status: 500 })
  } finally {
    transport?.transport.close()
  }
}
