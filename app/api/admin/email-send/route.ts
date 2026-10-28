import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { requireAdmin } from "@/lib/supabase/require-admin"
import { emailTemplates, ensurePersonalization, renderEmailText } from "@/lib/email/templates"
import { formatEmailSocialLinks } from "@/lib/email/sanitize"
import { createEmailHtml, createSmtpTransport } from "@/lib/email/smtp"
import { plainTextFromEmailHtml, sanitizeEmailHtml } from "@/lib/email/sanitize"
import { createEmailPdf, loadEmailPdfImages, type EmailPdfImages } from "@/lib/email/pdf"

const maxRecipients = 100

export async function POST(request: NextRequest) {
  const access = await requireAdmin()
  if (access.response) return access.response

  let transport: ReturnType<typeof createSmtpTransport> | undefined
  let streamOwnsTransport = false
  try {
    const payload: unknown = await request.json()
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid email request" }, { status: 400 })
    }

    const { templateId, subject, body, bodyHtml, studentIds, bannerHeadline, bannerSubtitle } = payload as Record<string, unknown>
    if (
      typeof templateId !== "string" ||
      !emailTemplates.some((template) => template.id === templateId) ||
      typeof subject !== "string" ||
      !subject.trim() ||
      subject.trim().length > 200 ||
      typeof body !== "string" ||
      !body.trim() ||
      body.length > 12000 ||
      (bodyHtml !== undefined && (typeof bodyHtml !== "string" || bodyHtml.length > 50000)) ||
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

    const emailDesign = {
      bannerHeadline: bannerHeadline.trim(),
      bannerSubtitle: bannerSubtitle.trim(),
    }
    const encoder = new TextEncoder()
    let streamCancelled = false
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamOwnsTransport = true
        const results: { studentId: string; status: "sent" | "failed"; error?: string }[] = []
        let nextStudent = 0
        let completed = 0
        let sent = 0
        let failed = 0
        let fatalError = ""
        let pdfImages: EmailPdfImages
        const emit = (event: Record<string, unknown>) => {
          if (!streamCancelled) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
        }
        const worker = async () => {
          while (!fatalError) {
            const index = nextStudent++
            const student = students[index]
            if (!student) return
            const personalizedBody = renderEmailText(ensurePersonalization(body), {
              name: student.name || "Learner",
              studentCode: student.student_code,
              course: student.course || "Tech Trailblazer Academy",
            })
            const personalizedHtml = typeof bodyHtml === "string"
              ? renderEmailText(formatEmailSocialLinks(sanitizeEmailHtml(bodyHtml)), {
                name: student.name || "Learner",
                studentCode: student.student_code,
                course: student.course || "Tech Trailblazer Academy",
              })
              : undefined
            let status: "sent" | "failed" = "sent"
            let errorMessage: string | null = null
            let messageId: string | null = null

            try {
              const result = await transport!.transport.sendMail({
                from: {
                  name: transport!.sender.name,
                  address: transport!.sender.address,
                },
                to: student.email,
                subject: subject.trim(),
                text: personalizedHtml ? plainTextFromEmailHtml(personalizedHtml) : personalizedBody,
                html: createEmailHtml(
                  personalizedBody,
                  transport!.replyTo,
                  emailDesign,
                  student.course || "Tech Trailblazer Academy",
                  personalizedHtml,
                ),
                replyTo: transport!.replyTo,
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

            let logFailure: string | null = null
            try {
              const { error: logError } = await supabase.from("email_delivery_logs").insert({
                recipient_student_id: student.id,
                recipient_name: student.name || "Learner",
                recipient_email: student.email,
                student_code: student.student_code,
                template_id: templateId,
                subject: subject.trim(),
                body_text: personalizedBody,
                body_html: personalizedHtml,
                banner_headline: bannerHeadline.trim(),
                banner_subtitle: bannerSubtitle.trim(),
                status,
                error_message: errorMessage,
                smtp_message_id: messageId,
                sent_at: status === "sent" ? new Date().toISOString() : null,
                created_by: access.user.id,
              })
              logFailure = logError?.message || null
            } catch (error) {
              logFailure = error instanceof Error ? error.message : "Unknown database error."
            }

            if (logFailure) {
              console.error("Email delivery log insert failed:", {
                recipient: student.id,
                status,
                message: logFailure,
              })
              fatalError = "Email processing stopped because delivery history could not be saved. Check SMTP logs before retrying to avoid duplicate messages."
              return
            }

            results.push({
              studentId: student.id,
              status,
              ...(errorMessage ? { error: errorMessage } : {}),
            })
            completed += 1
            if (status === "sent") sent += 1
            else failed += 1
            emit({ type: "progress", completed, total: students.length, sent, failed })
          }
        }

        void (async () => {
          emit({ type: "stage", stage: "Preparing branded emails…" })
          try {
            pdfImages = await loadEmailPdfImages()
          } catch (error) {
            console.error("Email PDF artwork loading failed:", error)
            emit({
              type: "complete",
              sent,
              failed,
              results,
              error: "Unable to prepare the branded PDF attachment. Check the academy logo and banner image URLs, then try again.",
            })
            if (!streamCancelled) controller.close()
            transport?.transport.close()
            return
          }
          emit({ type: "stage", stage: "Sending emails…" })
          emit({ type: "progress", completed, total: students.length, sent, failed })
          await Promise.all(
            Array.from({ length: Math.min(5, students.length) }, () => worker()),
          )
          emit({
            type: "complete",
            sent,
            failed,
            results,
            ...(fatalError ? { error: fatalError } : {}),
          })
          if (!streamCancelled) controller.close()
          transport?.transport.close()
        })().catch((error: unknown) => {
          console.error("Email delivery stream failed:", error)
          emit({ type: "complete", sent, failed, results, error: "Email delivery stopped unexpectedly." })
          if (!streamCancelled) controller.close()
          transport?.transport.close()
        })
      },
      cancel() {
        streamCancelled = true
      },
    })
    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send email."
    if (message.startsWith("SMTP is not configured.")) {
      return NextResponse.json({ error: message }, { status: 503 })
    }
    console.error("Email send request failed:", error)
    return NextResponse.json({ error: "Unable to send email. Check the SMTP configuration and try again." }, { status: 500 })
  } finally {
    if (!streamOwnsTransport) transport?.transport.close()
  }
}
