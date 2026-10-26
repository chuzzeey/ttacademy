import { jsPDF } from "jspdf"
import {
  academyEmailBannerUrl,
  academyLogoUrl,
  getEmailBodyBlocks,
} from "@/lib/email/templates"

type PdfImage = {
  data: string
  format: "JPEG" | "PNG"
  width: number
  height: number
}

export type EmailPdfImages = {
  logo: PdfImage
  banner: PdfImage
}

let emailPdfImagesPromise: Promise<EmailPdfImages> | undefined

async function loadImage(url: string): Promise<PdfImage> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Unable to load email PDF artwork (${response.status}).`)
  }

  const mimeType = response.headers.get("content-type")?.split(";")[0].trim()
  if (mimeType !== "image/jpeg" && mimeType !== "image/png") {
    throw new Error("Email PDF artwork must be a JPEG or PNG image.")
  }

  const data = `data:${mimeType};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`
  const doc = new jsPDF()
  const dimensions = doc.getImageProperties(data)
  return {
    data,
    format: mimeType === "image/jpeg" ? "JPEG" : "PNG",
    width: dimensions.width,
    height: dimensions.height,
  }
}

export async function loadEmailPdfImages(): Promise<EmailPdfImages> {
  if (!emailPdfImagesPromise) {
    emailPdfImagesPromise = Promise.all([
      loadImage(academyLogoUrl),
      loadImage(academyEmailBannerUrl),
    ]).then(([logo, banner]) => ({ logo, banner }))
  }

  try {
    return await emailPdfImagesPromise
  } catch (error) {
    emailPdfImagesPromise = undefined
    throw error
  }
}

export function createEmailPdf(
  body: string,
  design: { bannerHeadline: string; bannerSubtitle: string },
  images: EmailPdfImages,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 34
  const contentWidth = pageWidth - margin * 2
  const bottomLimit = pageHeight - 48
  let y = 0

  const green = [8, 116, 67] as const
  const darkGreen = [7, 90, 54] as const
  const ink = [35, 52, 43] as const
  const muted = [99, 116, 105] as const
  const detailsBg = [232, 234, 251] as const
  const detailsMuted = [100, 116, 139] as const

  const addContinuationHeader = () => {
    doc.setFillColor(248, 251, 249)
    doc.rect(0, 0, pageWidth, 40, "F")
    doc.addImage(images.logo.data, images.logo.format, margin, 9, 22, 22)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...darkGreen)
    doc.text("TECH TRAILBLAZER ACADEMY", margin + 30, 23)
    y = 56
  }

  const ensureSpace = (height: number) => {
    if (y + height > bottomLimit) {
      doc.addPage()
      addContinuationHeader()
    }
  }

  doc.setFillColor(250, 250, 250)
  doc.rect(0, 0, pageWidth, pageHeight, "F")
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(margin - 10, 20, contentWidth + 20, pageHeight - 40, 12, 12, "F")
  doc.addImage(images.logo.data, images.logo.format, pageWidth / 2 - 18, 37, 36, 36)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(...darkGreen)
  doc.text("TECH TRAILBLAZER ACADEMY", pageWidth / 2, 88, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...muted)
  doc.text("Learn. Grow. Succeed.", pageWidth / 2, 101, { align: "center" })

  doc.setDrawColor(...green)
  doc.setLineWidth(2)
  doc.line(pageWidth / 2 - 16, 117, pageWidth / 2 + 16, 117)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...green)
  doc.text("A MESSAGE FROM YOUR ACADEMY", pageWidth / 2, 134, { align: "center" })
  doc.setFontSize(19)
  doc.setTextColor(...darkGreen)
  const titleLines = doc.splitTextToSize(design.bannerHeadline, contentWidth - 30) as string[]
  doc.text(titleLines, pageWidth / 2, 157, { align: "center" })
  y = 157 + titleLines.length * 23
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...muted)
  const subtitleLines = doc.splitTextToSize(design.bannerSubtitle, contentWidth - 50) as string[]
  doc.text(subtitleLines, pageWidth / 2, y, { align: "center" })
  y += subtitleLines.length * 14 + 24

  for (const block of getEmailBodyBlocks(body)) {
    if (block.type === "paragraph") {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(...ink)
      const lines = doc.splitTextToSize(block.text, contentWidth - 24) as string[]
      ensureSpace(lines.length * 15 + 12)
      doc.text(lines, margin + 12, y)
      y += lines.length * 15 + 12
      continue
    }

    if (block.type === "bullet-list") {
      doc.setFontSize(9.5)
      for (const item of block.items) {
        const [heading, ...descriptionParts] = item.split(/:\s*/)
        const hasHeading = descriptionParts.length > 0
        const description = descriptionParts.join(": ")
        doc.setFont("helvetica", hasHeading ? "bold" : "normal")
        const headingText = hasHeading ? `${heading}: ` : ""
        const headingWidth = doc.getTextWidth(headingText)
        doc.setFont("helvetica", "normal")
        const descriptionLines = hasHeading
          ? doc.splitTextToSize(description, contentWidth - 46 - headingWidth) as string[]
          : doc.splitTextToSize(item, contentWidth - 46) as string[]
        const itemHeight = Math.max(1, descriptionLines.length) * 13 + 28
        ensureSpace(itemHeight)
        doc.setFillColor(...green)
        doc.circle(margin + 16, y - 3, 2, "F")
        doc.setTextColor(...ink)
        if (hasHeading) {
          doc.setFont("helvetica", "bold")
          doc.text(headingText, margin + 26, y)
          doc.setFont("helvetica", "normal")
          if (descriptionLines.length) {
            doc.text(descriptionLines[0], margin + 26 + headingWidth, y)
          }
          if (descriptionLines.length > 1) {
            doc.text(descriptionLines.slice(1), margin + 26 + headingWidth, y + 13)
          }
        } else {
          doc.text(descriptionLines, margin + 26, y)
        }
        y += itemHeight
      }
      y += 8
      continue
    }

    if (block.type === "course-dates") {
      const dateHeight = block.entries.length * 16 + 8
      ensureSpace(dateHeight)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(...green)
      for (const entry of block.entries) {
        doc.text(`${entry.label}: ${entry.value}`, margin + 12, y)
        y += 16
      }
      y += 8
      continue
    }

    if (block.type === "payment-link-placeholder") {
      ensureSpace(54)
      const buttonWidth = Math.min(contentWidth - 24, 250)
      const buttonX = (pageWidth - buttonWidth) / 2
      doc.setFillColor(...green)
      doc.roundedRect(buttonX, y, buttonWidth, 30, 6, 6, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(255, 255, 255)
      doc.text("Complete your application fee payment", pageWidth / 2, y + 19, { align: "center" })
      y += 39
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(...muted)
      doc.text("Korapay payment link will be added here.", pageWidth / 2, y, { align: "center" })
      y += 20
      continue
    }

    const detailsRows = block.entries.map((entry) => {
      if (entry.label === "Student ID") {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        const valueLines = doc.splitTextToSize(entry.value, contentWidth - 28) as string[]
        return { entry, valueLines, height: 34 + valueLines.length * 17 }
      }
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      const valueLines = doc.splitTextToSize(entry.value, contentWidth * 0.55) as string[]
      return { entry, valueLines, height: Math.max(26, valueLines.length * 12 + 16) }
    })
    const detailsHeight = 16 + detailsRows.reduce((height, row) => height + row.height, 0)
    ensureSpace(detailsHeight + 10)
    const detailsY = y
    doc.setFillColor(...detailsBg)
    doc.roundedRect(margin, detailsY, contentWidth, detailsHeight, 8, 8, "F")
    y += 8

    for (const { entry, valueLines, height } of detailsRows) {
      if (entry.label === "Student ID") {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(7)
        doc.setTextColor(...detailsMuted)
        doc.text(entry.label.toUpperCase(), pageWidth / 2, y + 8, { align: "center" })
        y += 19
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.setTextColor(...darkGreen)
        doc.text(valueLines, pageWidth / 2, y, { align: "center" })
        y += valueLines.length * 17
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(...detailsMuted)
        doc.text("Select and copy this ID", pageWidth / 2, y, { align: "center" })
        y += height - 19 - valueLines.length * 17
      } else {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.setTextColor(...detailsMuted)
        doc.text(entry.label, margin + 14, y + 8)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...darkGreen)
        doc.text(valueLines, margin + contentWidth - 14, y + 8, { align: "right" })
        y += height
      }
    }
    y = detailsY + detailsHeight + 12
  }

  const bannerWidth = Math.min(120, contentWidth / 3)
  const bannerHeight = Math.min(34, bannerWidth * images.banner.height / images.banner.width)
  const footerHeight = 74 + bannerHeight
  ensureSpace(footerHeight)
  y += 6
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...darkGreen)
  doc.text("Tech Trailblazer Academy", pageWidth / 2, y, { align: "center" })
  y += 12
  doc.addImage(
    images.banner.data,
    images.banner.format,
    (pageWidth - bannerWidth) / 2,
    y,
    bannerWidth,
    bannerHeight,
  )
  y += bannerHeight + 10
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...green)
  doc.text("X  ·  Instagram  ·  Facebook", pageWidth / 2, y, { align: "center" })
  y += 12
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...muted)
  doc.text("This message was sent by the Academy team. Reply to the email if you need assistance.", pageWidth / 2, y, {
    align: "center",
    maxWidth: contentWidth - 24,
  })

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...muted)
    doc.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 22, { align: "right" })
  }

  return Buffer.from(doc.output("arraybuffer"))
}
