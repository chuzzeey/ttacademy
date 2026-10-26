import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { requireAdmin } from "@/lib/supabase/require-admin"
import { emailTemplates, ensurePersonalization, renderEmailText } from "@/lib/email/templates"
import { createEmailHtml, createSmtpTransport } from "@/lib/email/smtp"
import { createEmailPdf, loadEmailPdfImages, type EmailPdfImages } from "@/lib/email/pdf"

const maxRecipients = 100

export async function POST(request: NextRequest) {
  const access = await requireAdmin()
  if (access.response) return access.response

  let transport: ReturnType<typeof createSmtpTransport> | undefined
  try {
    const payload: unknown = await request.json()
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid email request" }, { status: 400 })
    }

    const { templateId, subject, body, studentIds, bannerHeadline, bannerSubtitle } = payload as Record<string, unknown>
    if (
      typeof templateId !== "string" ||
      !emailTemplates.some((template) => template.id === templateId) ||
      typeof subject !== "string" ||
      !subject.trim() ||
      subject.trim().length > 200 ||
      typeof body !== "string" ||
      !body.trim() ||
      body.length > 12000 ||
      typeof bannerHeadline !== "string" ||
      !bannerHeadline.trim() ||
      bannerHeadline.trim().length > 100 ||
      typeof bannerSubtitle !== "string" ||
      !bannerSubtitle.trim() ||
      bannerSubtitle.trim().length > 180 ||
      !Array.isArray(studentIds) ||
      studentIds.length < 1 ||
      studentIds.length > maxRecipients ||
      !studentIds.every((id) => typeof id === "string" && id.length > 0)
    ) {
      return NextResponse.json({ error: `Choose an email type, subject, message, and 1 to ${maxRecipients} valid recipients` }, { status: 400 })
    }

    const uniqueStudentIds = [...new Set(studentIds as string[])]
    if (uniqueStudentIds.length !== studentIds.length) {
      return NextResponse.json({ error: "The recipient list contains duplicates" }, { status: 400 })
    }

    transport = createSmtpTransport()
    let pdfImages: EmailPdfImages
    try {
      pdfImages = await loadEmailPdfImages()
    } catch (error) {
      console.error("Email PDF artwork loading failed:", error)
      return NextResponse.json({
        error: "Unable to prepare the branded PDF attachment. Check the academy logo and banner image URLs, then try again.",
      }, { status: 503 })
    }
    const supabase = await createAdminClient()
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id,student_code,name,email,course")
      .in("id", uniqueStudentIds)

    if (studentsError) {
      console.error("Email recipient lookup failed:", studentsError)
      return NextResponse.json({ error: "Unable to verify the selected recipients" }, { status: 500 })
    }
    if (!students || students.length !== uniqueStudentIds.length) {
      return NextResponse.json({ error: "One or more selected learners could not be found. Refresh the directory and try again." }, { status: 400 })
    }

    const results: { studentId: string; status: "sent" | "failed"; error?: string }[] = []
    for (const student of students) {
      const personalizedBody = renderEmailText(ensurePersonalization(body), {
        name: student.name || "Learner",
        studentCode: student.student_code,
        course: student.course || "Tech Trailblazer Academy",
      })
      const emailDesign = {
        bannerHeadline: bannerHeadline.trim(),
        bannerSubtitle: bannerSubtitle.trim(),
      }
      let status: "sent" | "failed" = "sent"
      let errorMessage: string | null = null
      let messageId: string | null = null

      try {
        const result = await transport.transport.sendMail({
          from: {
            name: transport.sender.name,
            address: transport.sender.address,
          },
          to: student.email,
          subject: subject.trim(),
          text: personalizedBody,
          html: createEmailHtml(personalizedBody, transport.replyTo, emailDesign, student.course || "Tech Trailblazer Academy"),
          replyTo: transport.replyTo,
          attachments: [{
            filename: `tech-trailblazer-academy-${student.student_code.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf`,
            content: createEmailPdf(personalizedBody, emailDesign, pdfImages),
            contentType: "application/pdf",
          }],
        })
        messageId = result.messageId || null
        if (result.rejected.length > 0 || result.accepted.length === 0) {
          status = "failed"
          errorMessage = "The SMTP server did not accept this recipient."
        }
      } catch (error) {
        status = "failed"
        errorMessage = error instanceof Error ? error.message : "SMTP delivery failed."
      }

      const { error: logError } = await supabase.from("email_delivery_logs").insert({
        recipient_student_id: student.id,
        recipient_name: student.name || "Learner",
        recipient_email: student.email,
        student_code: student.student_code,
        template_id: templateId,
        subject: subject.trim(),
        body_text: personalizedBody,
        banner_headline: bannerHeadline.trim(),
        banner_subtitle: bannerSubtitle.trim(),
        status,
        error_message: errorMessage,
        smtp_message_id: messageId,
        sent_at: status === "sent" ? new Date().toISOString() : null,
        created_by: access.user.id,
      })

      if (logError) {
        console.error("Email delivery log insert failed:", {
          recipient: student.id,
          status,
          message: logError.message,
        })
        return NextResponse.json({
          error: "Email processing stopped because delivery history could not be saved. Check SMTP logs before retrying to avoid duplicate messages.",
          results,
        }, { status: 500 })
      }
      results.push({
        studentId: student.id,
        status,
        ...(errorMessage ? { error: errorMessage } : {}),
      })
    }

    const sent = results.filter(({ status }) => status === "sent").length
    const failed = results.length - sent
    return NextResponse.json({ sent, failed, results }, { status: failed ? 207 : 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send email."
    if (message.startsWith("SMTP is not configured.")) {
      return NextResponse.json({ error: message }, { status: 503 })
    }
    console.error("Email send request failed:", error)
    return NextResponse.json({ error: "Unable to send email. Check the SMTP configuration and try again." }, { status: 500 })
  } finally {
    transport?.transport.close()
  }
}
