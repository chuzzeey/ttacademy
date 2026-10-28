import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { requireAdmin } from "@/lib/supabase/require-admin"
import { emailTemplates } from "@/lib/email/templates"
import { plainTextToEmailHtml, sanitizeEmailHtml } from "@/lib/email/sanitize"

export async function GET() {
  const access = await requireAdmin()
  if (access.response) return access.response
  const supabase = await createAdminClient()
  const { data, error } = await supabase.from("email_templates").select("id,name,description,subject,body_html,banner_headline,banner_subtitle")
  if (error && error.code !== "PGRST205") {
    console.error("Email template query failed:", error)
    return NextResponse.json({ error: "Unable to load email templates." }, { status: 500 })
  }
  const savedTemplates = new Map((data ?? []).map((template) => [template.id, template]))
  return NextResponse.json({
    data: emailTemplates.map((template) => {
      const saved = savedTemplates.get(template.id)
      return saved ?? {
        id: template.id,
        name: template.name,
        description: template.description,
        subject: template.subject,
        body_html: plainTextToEmailHtml(template.body),
        banner_headline: template.name,
        banner_subtitle: template.description,
      }
    }),
  })
}

export async function PUT(request: NextRequest) {
  const access = await requireAdmin()
  if (access.response) return access.response
  const payload = await request.json() as Record<string, unknown>
  const template = emailTemplates.find((item) => item.id === payload.id)
  if (
    !template ||
    typeof payload.subject !== "string" || !payload.subject.trim() || payload.subject.length > 200 ||
    typeof payload.bodyHtml !== "string" || !payload.bodyHtml.trim() || payload.bodyHtml.length > 50000 ||
    typeof payload.bannerHeadline !== "string" || !payload.bannerHeadline.trim() || payload.bannerHeadline.length > 100 ||
    typeof payload.bannerSubtitle !== "string" || !payload.bannerSubtitle.trim() || payload.bannerSubtitle.length > 180
  ) {
    return NextResponse.json({ error: "A valid template, subject, title, subtitle, and email body are required." }, { status: 400 })
  }
  const supabase = await createAdminClient()
  const { error } = await supabase.from("email_templates").upsert({
    id: template.id,
    name: template.name,
    description: template.description,
    subject: payload.subject.trim(),
    body_html: sanitizeEmailHtml(payload.bodyHtml),
    banner_headline: payload.bannerHeadline.trim(),
    banner_subtitle: payload.bannerSubtitle.trim(),
    updated_by: access.user.id,
    updated_at: new Date().toISOString(),
  })
  if (error) {
    console.error("Email template save failed:", error)
    return NextResponse.json({ error: "Unable to save this template. Apply the email templates migration and try again." }, { status: 500 })
  }
  return NextResponse.json({ saved: true })
}
