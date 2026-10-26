import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { requireAdmin } from "@/lib/supabase/require-admin"
import { getEmailSender, isSmtpConfigured } from "@/lib/email/smtp"

export async function GET() {
  try {
    const access = await requireAdmin()
    if (access.response) return access.response

    const sender = getEmailSender()
    const senderStatus = {
      name: sender.name,
      address: sender.address ?? "",
      replyTo: sender.replyTo,
      configured: isSmtpConfigured(),
    }
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from("email_delivery_logs")
      .select("id,recipient_name,recipient_email,student_code,template_id,subject,body_text,banner_headline,banner_subtitle,status,error_message,smtp_message_id,sent_at,created_at")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Email history query failed:", error)
      const message = error.code === "PGRST205"
        ? "Email history is not set up in Supabase yet. Apply migration 20261026140000_email_delivery_logs.sql, then refresh this page."
        : "Unable to load email history. Check the Supabase connection and try again."
      return NextResponse.json({
        error: message,
        data: [],
        sender: senderStatus,
      }, {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      })
    }

    return NextResponse.json({
      data: data ?? [],
      sender: senderStatus,
    }, {
      headers: { "Cache-Control": "private, no-store" },
    })
  } catch (error) {
    console.error("Email history request failed:", error)
    return NextResponse.json({ error: "Unable to load email history" }, { status: 500 })
  }
}
