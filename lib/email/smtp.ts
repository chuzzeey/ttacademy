import nodemailer from "nodemailer"
import { createEmailHtml } from "@/lib/email/render-html"

const academyName = "Tech Trailblazer Academy"

export { createEmailHtml }

export function getEmailSender() {
  const configuredFrom = process.env.SMTP_FROM?.trim() || ""
  const formattedFrom = configuredFrom.match(/^(?:"([^"]+)"|([^<]+))\s*<([^<>]+)>$/)
  const address = formattedFrom?.[3]?.trim() || configuredFrom || process.env.SMTP_USER?.trim()
  const configuredName = process.env.SMTP_FROM_NAME?.trim() || formattedFrom?.[1] || formattedFrom?.[2]?.trim()
  const name = (configuredName || academyName).replace(/[\r\n]/g, " ")
  return {
    name,
    address,
    replyTo: process.env.SMTP_REPLY_TO?.trim() || "",
  }
}

function getMissingSmtpSettings() {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS
  const portValue = process.env.SMTP_PORT?.trim() || "587"
  const port = Number(portValue)
  const sender = getEmailSender()
  return [
    !host && "SMTP_HOST",
    !user && "SMTP_USER",
    !pass && "SMTP_PASS",
    (!Number.isInteger(port) || port < 1 || port > 65535) && "SMTP_PORT",
    !sender.address && "SMTP_FROM",
  ].filter((value): value is string => Boolean(value))
}

export function isSmtpConfigured() {
  return getMissingSmtpSettings().length === 0
}

export function createSmtpTransport() {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS
  const portValue = process.env.SMTP_PORT?.trim() || "587"
  const port = Number(portValue)
  const missing = getMissingSmtpSettings()
  if (missing.length) {
    throw new Error(`SMTP is not configured. Set ${missing.join(", ")}.`)
  }

  const sender = getEmailSender()

  return {
    transport: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
    sender,
    replyTo: sender.replyTo || undefined,
  }
}
