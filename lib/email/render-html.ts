import {
  academyEmailAccent,
  academyEmailBannerUrl,
  academyLogoUrl,
  getEmailBodyBlocks,
} from "@/lib/email/templates"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export type EmailDesign = {
  bannerHeadline: string
  bannerSubtitle: string
}

export function createEmailHtml(
  body: string,
  replyTo: string | undefined,
  design: EmailDesign,
  course?: string,
) {
  const contact = replyTo
    ? `<br>Contact: <a href="mailto:${escapeHtml(replyTo)}" style="color:#087443">${escapeHtml(replyTo)}</a>`
    : ""
  const emailBlocks = getEmailBodyBlocks(body).map((block) => {
    if (block.type === "paragraph") {
      const escapedText = escapeHtml(block.text)
      const escapedCourse = course ? escapeHtml(course.trim()) : ""
      const paragraph = escapedCourse
        ? escapedText.replaceAll(escapedCourse, `<strong style="font-weight:700;color:#183b2b">${escapedCourse}</strong>`)
        : escapedText
      return `<tr><td class="email-text-body email-paragraph" style="padding:0 18px 14px;font-size:15px;line-height:1.65;color:#34443a;overflow-wrap:anywhere">${paragraph}</td></tr>`
    }
    if (block.type === "bullet-list") {
      const items = block.items.map((item) => {
        const [heading, ...description] = item.split(/:\s*/)
        const content = description.length
          ? `<strong class="email-text-primary" style="font-weight:bold;color:#111827">${escapeHtml(heading)}:</strong> ${escapeHtml(description.join(": "))}`
          : escapeHtml(item)
        return `<tr><td valign="top" width="18" style="padding:0 0 32px;font-size:15px;line-height:1.6;color:${academyEmailAccent}">•</td><td class="email-text-body email-bullet-copy" style="padding:0 0 32px;font-size:14px;line-height:1.6;color:#34443a;overflow-wrap:anywhere">${content}</td></tr>`
      }).join("")
      return `<tr><td class="email-bullets-wrap" style="padding:0 18px 14px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${items}</table></td></tr>`
    }
    if (block.type === "course-dates") {
      const entries = block.entries.map(({ label, value }) => `<tr><td style="padding:0 10px 7px 0;font-size:14px;line-height:1.5;font-weight:bold;color:#087443">${escapeHtml(label)}:</td><td style="padding:0 0 7px;font-size:14px;line-height:1.5;font-weight:bold;color:#087443;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join("")
      return `<tr><td style="padding:0 22px 14px"><table role="presentation" cellspacing="0" cellpadding="0" border="0">${entries}</table></td></tr>`
    }
    if (block.type === "payment-link-placeholder") {
      return `<tr><td align="center" class="email-payment-wrap" style="padding:0 18px 18px">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#087443">
          <tr><td align="center" style="padding:13px 24px;font-size:14px;font-weight:bold;color:#ffffff">Complete your application fee payment</td></tr>
        </table>
        <div style="padding-top:8px;font-size:11px;line-height:1.5;color:#718078">Korapay payment link will be added here.</div>
      </td></tr>`
    }
    const entries = block.entries.map(({ label, value }) => label === "Student ID"
      ? `<tr>
        <td colspan="2" align="center" class="email-details-label" style="padding:13px 14px 4px;font-size:10px;font-weight:bold;letter-spacing:1px;color:#64748b">${escapeHtml(label)}</td>
      </tr>
      <tr>
        <td colspan="2" align="center" class="email-details-value" style="padding:0 14px 6px;font-size:20px;line-height:1.35;font-weight:900;letter-spacing:1px;color:#183b2b;overflow-wrap:anywhere">${escapeHtml(value)}</td>
      </tr>
      <tr><td colspan="2" align="center" class="email-details-label" style="padding:0 14px 14px;font-size:11px;color:#64748b">Select and copy this ID</td></tr>`
      : `<tr>
        <td width="38%" class="email-details-label email-detail-row-label" style="padding:9px 8px 9px 12px;font-size:12px;color:#64748b">${escapeHtml(label)}</td>
        <td align="right" class="email-details-value email-detail-row-value" style="padding:9px 12px 9px 8px;font-size:13px;font-weight:bold;color:#183b2b;overflow-wrap:anywhere">${escapeHtml(value)}</td>
      </tr>`).join("")
    return `<tr><td class="email-details-wrap" style="padding:2px 18px 18px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-details" bgcolor="#e8eafb" style="background-color:#e8eafb;border-radius:10px;border-collapse:separate">
        ${entries}
      </table>
    </td></tr>`
  }).join("")

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <style>
      :root { color-scheme: light only; supported-color-schemes: light; }
      body, .email-body { margin:0 !important; padding:0 !important; background-color:#fafafa !important; color:#20352a !important; color-scheme:light only; }
      .email-outer { background-color:#fafafa !important; color:#20352a !important; }
      .email-card, .email-header, .email-title, .email-content { background-color:#ffffff !important; color:#20352a !important; }
      .email-footer { background-color:#f7faf8 !important; color:#718078 !important; }
      .email-details { background-color:#e8eafb !important; color:#183b2b !important; border-radius:10px; }
      @media screen and (max-width:480px) {
        .email-shell-cell { padding:0 !important; }
        .email-header { padding:16px 16px 10px !important; }
        .email-logo { width:48px !important; height:48px !important; }
        .email-academy-name { font-size:14px !important; }
        .email-title { padding:4px 16px 8px !important; }
        .email-title h1 { font-size:20px !important; line-height:1.25 !important; overflow-wrap:anywhere !important; }
        .email-title p { margin-top:8px !important; font-size:14px !important; line-height:1.5 !important; }
        .email-content { padding:12px 16px 16px !important; }
        .email-paragraph { padding:0 0 12px !important; font-size:14px !important; line-height:24px !important; }
        .email-bullets-wrap { padding:0 0 16px !important; }
        .email-bullet-copy, .email-bullet-marker { font-size:14px !important; line-height:24px !important; }
        .email-bullet-copy, .email-bullet-marker { padding-bottom:32px !important; }
        .email-details-wrap { padding:0 0 16px !important; }
        .email-detail-row-label, .email-detail-row-value { display:block !important; width:auto !important; padding:5px 12px !important; text-align:left !important; }
        .email-detail-row-value { padding-top:0 !important; overflow-wrap:anywhere !important; }
        .email-payment-wrap { padding:0 0 16px !important; }
        .email-footer { padding:16px !important; }
      }
      u + .email-body .email-outer { background-color:#fafafa !important; }
      u + .email-body .email-card, u + .email-body .email-header, u + .email-body .email-title, u + .email-body .email-content { background-color:#ffffff !important; }
      u + .email-body .email-details { background-color:#e8eafb !important; }
      u + .email-body .email-footer { background-color:#fafafa !important; }
      @media (prefers-color-scheme: dark) {
        body, .email-body, .email-outer { background-color:#fafafa !important; color:#20352a !important; }
        .email-card, .email-header, .email-title, .email-content { background-color:#ffffff !important; color:#20352a !important; }
        .email-details { background-color:#e8eafb !important; color:#183b2b !important; }
        .email-footer { background-color:#f7faf8 !important; color:#718078 !important; }
        .email-text-primary { color:#183b2b !important; }
        .email-text-body { color:#34443a !important; }
        .email-text-muted { color:#718078 !important; }
        .email-details td { color:#183b2b !important; }
        .email-details .email-details-label { color:#64748b !important; }
      }
      [data-ogsc] body, [data-ogsc] .email-body, [data-ogsc] .email-outer { background-color:#fafafa !important; color:#20352a !important; }
      [data-ogsc] .email-card, [data-ogsc] .email-header, [data-ogsc] .email-title, [data-ogsc] .email-content { background-color:#ffffff !important; color:#20352a !important; }
      [data-ogsc] .email-details { background-color:#e8eafb !important; color:#183b2b !important; }
      [data-ogsc] .email-footer { background-color:#f7faf8 !important; color:#718078 !important; }
      [data-ogsc] .email-text-primary { color:#183b2b !important; }
      [data-ogsc] .email-text-body { color:#34443a !important; }
      [data-ogsc] .email-text-muted { color:#718078 !important; }
      [data-ogsc] .email-details td { color:#183b2b !important; }
      [data-ogsc] .email-details .email-details-label { color:#64748b !important; }
    </style>
  </head>
  <body class="email-body" style="margin:0;padding:0;background:#fafafa !important;font-family:Arial,Helvetica,sans-serif;color:#20352a !important;color-scheme:light only">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-outer" bgcolor="#fafafa" style="background-color:#fafafa !important">
      <tr><td align="center" class="email-shell-cell" style="padding:12px 0">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" bgcolor="#ffffff" style="width:100%;max-width:600px;background:#ffffff !important;color:#20352a !important">
          <tr><td align="center" class="email-header" bgcolor="#ffffff" style="padding:16px 16px 10px;background:#ffffff !important">
            <img class="email-logo" src="${escapeHtml(academyLogoUrl)}" alt="Tech Trailblazer Academy" width="56" height="56" style="display:block;width:56px;height:56px;border:0;object-fit:cover;border-radius:8px">
            <div class="email-text-primary email-academy-name" style="padding-top:8px;font-size:14px;font-weight:bold;letter-spacing:-.025em;color:#183b2b">Tech Trailblazer Academy</div>
            <div class="email-text-muted" style="padding-top:2px;font-size:10px;color:#64748b">Learn. Grow. Succeed.</div>
          </td></tr>
          <tr><td align="center" class="email-title" bgcolor="#ffffff" style="padding:4px 16px 8px;background:#ffffff !important">
            <h1 class="email-text-primary" style="margin:0;font-size:24px;line-height:1.25;font-weight:bold;letter-spacing:-.025em;color:#183b2b">${escapeHtml(design.bannerHeadline)}</h1>
            <p class="email-text-muted" style="margin:8px 0 0;font-size:14px;line-height:24px;color:#64748b">${escapeHtml(design.bannerSubtitle)}</p>
          </td></tr>
          <tr><td class="email-content" bgcolor="#ffffff" style="padding:12px 16px 16px;background:#ffffff !important">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-content" bgcolor="#ffffff" style="background:#ffffff !important">
              ${emailBlocks}
            </table>
          </td></tr>
          <tr><td align="center" class="email-footer" bgcolor="#fafafa" style="padding:16px;background:#fafafa">
            <div class="email-text-primary" style="font-size:11px;font-weight:bold;color:#183b2b">Tech Trailblazer Academy</div>
            <div class="email-text-muted" style="margin-top:4px;font-size:11px;line-height:20px;color:#64748b">Learn. Grow. Succeed.</div>
            <img src="${escapeHtml(academyEmailBannerUrl)}" alt="Tech Trailblazer Academy" width="140" style="display:block;width:100%;max-width:140px;height:auto;margin:12px auto 0;border:0">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:10px auto 0">
              <tr>
                <td align="center" valign="middle" width="34" height="34" style="width:34px;height:34px;border-radius:50%;background:#ecfdf5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-label="X" role="img" style="display:block">
                    <path fill="#166534" d="M18.9 1.15h3.68l-8.04 9.19L24 23.21h-7.41l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.8h2.04L6.49 3.29H4.3z"/>
                  </svg>
                </td>
                <td width="10" style="width:10px;font-size:1px">&nbsp;</td>
                <td align="center" valign="middle" width="34" height="34" style="width:34px;height:34px;border-radius:50%;background:#ecfdf5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" aria-label="Instagram" role="img" style="display:block">
                    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#166534" stroke-width="2"/>
                    <circle cx="12" cy="12" r="4" fill="none" stroke="#166534" stroke-width="2"/>
                    <circle cx="17.5" cy="6.5" r="1.25" fill="#166534"/>
                  </svg>
                </td>
                <td width="10" style="width:10px;font-size:1px">&nbsp;</td>
                <td align="center" valign="middle" width="34" height="34" style="width:34px;height:34px;border-radius:50%;background:#ecfdf5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" aria-label="Facebook" role="img" style="display:block">
                    <path fill="#166534" d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8z"/>
                  </svg>
                </td>
              </tr>
            </table>
            <div class="email-text-muted" style="margin-top:9px;font-size:11px;line-height:20px;color:#64748b">This message was sent to you by the Academy team. Please reply to this email if you need assistance.${contact}</div>
          </td></tr>
        </table>
        <div style="padding:10px 8px;font-size:10px;line-height:15px;color:#829087">You’re receiving this message because you’re a learner with Tech Trailblazer Academy.</div>
      </td></tr>
    </table>
  </body>
</html>`
}
