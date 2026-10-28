import {
  academyEmailAccent,
  academyEmailBannerUrl,
  academyLogoUrl,
  getEmailBodyBlocks,
} from "@/lib/email/templates"
import { formatEmailBulletLines, formatEmailPaymentButton, formatEmailSocialLinks, formatEmailWhatsAppCommunityLink, sanitizeEmailHtml } from "@/lib/email/sanitize"
import { socialLinks } from "@/lib/social-links"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function applyEmailSpacing(html: string) {
  const styles: Record<string, string> = {
    p: "margin:0 0 22px;line-height:1.75",
    h1: "margin:0 0 20px;line-height:1.25",
    h2: "margin:0 0 20px;line-height:1.35",
    h3: "margin:0 0 20px;line-height:1.35",
    ul: "margin:0 0 22px;padding-left:24px",
    ol: "margin:0 0 22px;padding-left:24px",
    li: "margin-bottom:12px;line-height:1.75",
  }
  return html.replace(/<(p|h1|h2|h3|ul|ol|li)(\s[^>]*)?>/gi, (tag, name: string, attributes = "") => {
    const spacing = styles[name.toLowerCase()]
    const styleMatch = attributes.match(/\sstyle="([^"]*)"/i)
    if (styleMatch) {
      const style = `${styleMatch[1].replace(/;?\s*$/, ";")}${spacing}`
      return `<${name}${attributes.replace(styleMatch[0], ` style="${escapeHtml(style)}"`)}>`
    }
    return `<${name}${attributes} style="${spacing}">`
  })
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
  bodyHtml?: string,
) {
  const contact = replyTo
    ? `<br>Contact: <a href="mailto:${escapeHtml(replyTo)}" style="color:#087443">${escapeHtml(replyTo)}</a>`
    : ""
  const emailBlocks = bodyHtml
    ? `<tr><td class="email-rich-body" style="padding:0 18px 18px;font-size:15px;line-height:1.75;color:#34443a;overflow-wrap:anywhere">${applyEmailSpacing(formatEmailSocialLinks(formatEmailWhatsAppCommunityLink(formatEmailPaymentButton(formatEmailBulletLines(sanitizeEmailHtml(bodyHtml))))))}</td></tr>`
    : getEmailBodyBlocks(body).map((block) => {
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
  const emailSocialIcons = socialLinks.map(({ href, name, svg }, index) => `
    <td align="center" valign="top" width="58" style="width:58px">
      <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="Tech Trailblazer Academy on ${escapeHtml(name)}" style="display:block;width:56px;color:#166534;text-align:center;text-decoration:none">
        <span style="display:inline-block;width:36px;height:36px;border:1px solid #dce9df;border-radius:50%;background:#ffffff;text-align:center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="${escapeHtml(name)}" style="display:inline-block;margin:9px auto 0;vertical-align:top">${svg}</svg>
        </span>
        <span style="display:block;padding-top:4px;font-size:9px;line-height:12px;color:#166534">${escapeHtml(name)}</span>
      </a>
    </td>${index < socialLinks.length - 1 ? '<td width="4" style="width:4px;font-size:1px">&nbsp;</td>' : ""}`).join("")

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
      .email-rich-body p { margin:0 0 22px; line-height:1.75; }
      .email-rich-body h1, .email-rich-body h2, .email-rich-body h3 { margin:0 0 20px; color:#183b2b; font-weight:bold; line-height:1.35; }
      .email-rich-body h1 { font-size:24px; line-height:1.25; }
      .email-rich-body h2 { font-size:20px; }
      .email-rich-body h3 { font-size:17px; }
      .email-rich-body ul, .email-rich-body ol { margin:0 0 22px; padding-left:24px; }
      .email-rich-body li { margin-bottom:12px; line-height:1.75; }
      .email-rich-body a { color:#087443; text-decoration:underline; }
      .email-rich-body a[href*="checkout.korapay.com"] { position:relative;display:inline-block;overflow:hidden;background-color:#3b82f6 !important;color:#ffffff !important;text-decoration:none !important; }
      .email-rich-body a[href*="checkout.korapay.com"]::after { position:absolute;inset:-20% auto -20% -60%;width:35%;background:linear-gradient(90deg,transparent,rgba(226,232,240,.75),transparent);content:"";opacity:0;pointer-events:none;transform:skewX(-20deg); }
      .email-rich-body a[href*="checkout.korapay.com"]:hover { background-color:#60a5fa !important; }
      .email-rich-body a[href*="checkout.korapay.com"]:hover::after { opacity:1;animation:korapay-button-shimmer 1.1s ease-in-out infinite alternate; }
      @keyframes korapay-button-shimmer { from { transform:translateX(0) skewX(-20deg); } to { transform:translateX(430%) skewX(-20deg); } }
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
              <tr>${emailSocialIcons}</tr>
            </table>
            <div class="email-text-muted" style="margin-top:9px;font-size:11px;line-height:20px;color:#64748b">This message was sent to you by the Academy team. Please reply to this email if you need assistance.${contact}</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}
