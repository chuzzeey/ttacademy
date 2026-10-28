import { socialLinks } from "@/lib/social-links"

const allowedTags = new Set([
  "A", "B", "BLOCKQUOTE", "BR", "DIV", "EM", "H1", "H2", "H3", "I", "IMG",
  "LI", "OL", "P", "S", "SPAN", "STRONG", "U", "UL",
])

const allowedAttributes = new Set(["alt", "href", "src", "style", "target", "rel", "width", "height"])
const korapayCheckoutUrl = "https://checkout.korapay.com/pay/IDtLOhlcCJIKaeb"
const whatsappCommunityUrl = "https://whatsapp.com/channel/0029Vb7yD0fBA1f1GHOHqJ2l"

function paymentButtonAnchorHtml() {
  return `<a class="korapay-pay-button" href="${korapayCheckoutUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 30px;border-radius:8px;background-color:#3b82f6;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:20px;text-align:center;text-decoration:none">💳 Pay here</a>`
}

function paymentButtonHtml() {
  return `<p style="margin:22px 0;text-align:center">${paymentButtonAnchorHtml()}</p>`
}

function whatsappCommunityButtonHtml() {
  return `<p style="margin:22px 0 0;text-align:center;font-family:Arial,Helvetica,sans-serif"><span style="display:block;margin-bottom:8px;font-size:13px;line-height:20px;color:#64748b">Stay updated!</span><a href="${whatsappCommunityUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;border-radius:8px;background-color:#25D366;color:#ffffff;font-size:14px;font-weight:bold;line-height:20px;text-align:center;text-decoration:none"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" style="display:inline-block;margin-right:7px;vertical-align:middle"><path fill="#ffffff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>Join our WhatsApp community</a></p>`
}

function socialLinksHtml() {
  const links = socialLinks.map(({ href, name, mark, handle }) =>
    `<p style="margin:0 0 12px;line-height:24px"><a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer" style="color:#166534;text-decoration:none"><span style="display:inline-block;width:25px;height:25px;margin-right:8px;border:1px solid #dce9df;border-radius:50%;background:#f7faf8;color:#166534;font-size:15px;font-weight:bold;line-height:25px;text-align:center;vertical-align:middle">${escapeText(mark)}</span><strong>${escapeText(name)}</strong><span style="margin-left:6px;color:#64748b;font-size:13px">${escapeText(handle)}</span></a></p>`,
  ).join("")
  return `<div style="margin:4px 0 18px">${links}</div>`
}

export function plainTextToEmailHtml(value: string) {
  const paragraphs = value.trim().split(/\n\s*\n/)
  return paragraphs.map((paragraph) => {
    const lines = paragraph.split(/\r?\n/)
    const blocks: string[] = []
    let textLines: string[] = []
    let listItems: string[] = []
    let listType: "ul" | "ol" | null = null
    const flushText = () => {
      if (textLines.length) blocks.push(`<p>${textLines.map(escapeText).join("<br>")}</p>`)
      textLines = []
    }
    const flushList = () => {
      if (listItems.length && listType) blocks.push(`<${listType}>${listItems.map((item) => `<li>${escapeText(item)}</li>`).join("")}</${listType}>`)
      listItems = []
      listType = null
    }
    for (const line of lines) {
      if (line.trim() === "{{social_links}}") {
        flushText()
        flushList()
        blocks.push(socialLinksHtml())
        continue
      }
      if (line.trim() === "{{korapay_payment_link}}") {
        flushText()
        flushList()
        blocks.push(paymentButtonHtml())
        continue
      }
      if (line.trim() === "{{whatsapp_community_link}}") {
        flushText()
        flushList()
        blocks.push(whatsappCommunityButtonHtml())
        continue
      }
      const bullet = line.match(/^\s*[•·]\s+(.*)$/)
      const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/)
      const currentType = bullet ? "ul" : numbered ? "ol" : null
      if (currentType) {
        flushText()
        if (listType && listType !== currentType) flushList()
        listType = currentType
        listItems.push((bullet || numbered)?.[1] || "")
      } else {
        flushList()
        textLines.push(line)
      }
    }
    flushList()
    flushText()
    return blocks.join("")
  }).join("")
}

export function formatEmailPaymentButton(html: string) {
  return html
    .replace(/\{\{korapay_payment_link\}\}/g, paymentButtonHtml())
    .replace(/<a\b[^>]*href=["']https:\/\/checkout\.korapay\.com\/pay\/IDtLOhlcCJIKaeb["'][^>]*>[\s\S]*?<\/a>/gi, paymentButtonAnchorHtml())
}

export function formatEmailWhatsAppCommunityLink(html: string) {
  return html.replace(/\{\{whatsapp_community_link\}\}/g, whatsappCommunityButtonHtml())
}

export function formatEmailSocialLinks(html: string) {
  return html.replace(/\{\{social_links\}\}/g, socialLinksHtml())
}

export function formatEmailBulletLines(html: string) {
  return html.replace(/<p>([\s\S]*?)<\/p>/gi, (paragraph, content: string) => {
    if (!/(?:^|<br\s*\/?>)\s*[•·]\s+/i.test(content)) return paragraph
    const blocks: string[] = []
    let textLines: string[] = []
    let listItems: string[] = []
    const flushText = () => {
      if (textLines.length) blocks.push(`<p>${textLines.join("<br>")}</p>`)
      textLines = []
    }
    const flushList = () => {
      if (listItems.length) blocks.push(`<ul>${listItems.map((item) => `<li>${item}</li>`).join("")}</ul>`)
      listItems = []
    }
    for (const line of content.split(/<br\s*\/?>/i)) {
      const bullet = line.match(/^\s*[•·]\s+(.*)$/)
      if (bullet) {
        flushText()
        listItems.push(bullet[1])
      } else {
        flushList()
        textLines.push(line)
      }
    }
    flushList()
    flushText()
    return blocks.join("")
  })
}

export function sanitizeEmailHtml(input: string) {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|meta|link)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (whole, tagName: string, attributes: string) => {
      const tag = tagName.toUpperCase()
      if (!allowedTags.has(tag)) return ""
      if (whole.startsWith("</")) return `</${tagName.toLowerCase()}>`
      const safeAttributes = [...attributes.matchAll(/([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)]
        .filter(([, name]) => allowedAttributes.has(name.toLowerCase()))
        .map(([, name, doubleQuoted, singleQuoted, unquoted]) => {
          const value = doubleQuoted ?? singleQuoted ?? unquoted ?? ""
          if (name.toLowerCase() === "href" || name.toLowerCase() === "src") {
            if (!/^(https?:|mailto:|data:image\/(?:png|jpe?g|gif|webp);base64,)/i.test(value)) return ""
          }
          if (name.toLowerCase() === "style" && /(?:expression|javascript|behavior|url\s*\(\s*javascript)/i.test(value)) return ""
          return ` ${name.toLowerCase()}="${escapeAttribute(value)}"`
        }).join("")
      return `<${tagName.toLowerCase()}${safeAttributes}>`
    })
}

function escapeText(value: string) {
  const escaped = value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
    .replace(/~([^~]+)~/g, "<s>$1</s>")
  return escaped.replace(/https?:\/\/[^\s<]+/gi, (url) => `<a href="${url}">${url}</a>`)
}

function escapeAttribute(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

export function plainTextFromEmailHtml(html: string) {
  return sanitizeEmailHtml(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-3]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
