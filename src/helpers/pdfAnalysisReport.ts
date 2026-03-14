import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib"

import type { PdfAnalysisOutput } from "@/schemas/pdfAnalysisSchema"

type ReportMeta = {
  jobTitle?: string
  companyName?: string
  sourceFileName?: string
  analyzedAt?: string
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN_X = 48
const TOP_MARGIN = 60
const BOTTOM_MARGIN = 50
const LINE_GAP = 5

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return [""]

  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    const width = font.widthOfTextAtSize(candidate, size)

    if (width <= maxWidth) {
      current = candidate
      continue
    }

    if (current) {
      lines.push(current)
      current = word
      continue
    }

    let chunk = ""
    for (const ch of word) {
      const next = `${chunk}${ch}`
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        chunk = next
      } else {
        if (chunk) lines.push(chunk)
        chunk = ch
      }
    }
    current = chunk
  }

  if (current) lines.push(current)
  return lines
}

function ensurePage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  cursorY: number,
  requiredHeight: number
): { page: PDFPage; cursorY: number } {
  if (cursorY - requiredHeight >= BOTTOM_MARGIN) {
    return { page, cursorY }
  }

  const nextPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  return { page: nextPage, cursorY: PAGE_HEIGHT - TOP_MARGIN }
}

function drawWrappedLineBlock(params: {
  pdfDoc: PDFDocument
  page: PDFPage
  cursorY: number
  text: string
  font: PDFFont
  size: number
  color: ReturnType<typeof rgb>
  maxWidth: number
  lineHeight: number
  offsetX: number
}): { page: PDFPage; cursorY: number } {
  const lines = wrapText(params.text, params.font, params.size, params.maxWidth)
  let page = params.page
  let cursorY = params.cursorY

  for (const line of lines) {
    const ensured = ensurePage(params.pdfDoc, page, cursorY, params.lineHeight)
    page = ensured.page
    cursorY = ensured.cursorY

    page.drawText(line, {
      x: params.offsetX,
      y: cursorY,
      size: params.size,
      font: params.font,
      color: params.color
    })

    cursorY -= params.lineHeight
  }

  return { page, cursorY }
}

type FeedbackCategoryKey = Exclude<keyof PdfAnalysisOutput, "overallScore">

function categoryToLabel(key: FeedbackCategoryKey): string {
  if (key === "toneAndStyle") return "Tone & Style"
  if (key === "content") return "Content"
  if (key === "structure") return "Structure"
  return "Skills"
}

export async function buildPdfAnalysisReport(
  feedback: PdfAnalysisOutput,
  meta: ReportMeta
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let cursorY = PAGE_HEIGHT - TOP_MARGIN

  const contentWidth = PAGE_WIDTH - MARGIN_X * 2
  const headingColor = rgb(0.77, 0.16, 0.3)
  const bodyColor = rgb(0.15, 0.15, 0.18)
  const mutedColor = rgb(0.36, 0.36, 0.42)

  page.drawText("Resumind AI Report", {
    x: MARGIN_X,
    y: cursorY,
    size: 20,
    font: boldFont,
    color: headingColor
  })
  cursorY -= 24

  page.drawText("PDF Resume Analysis", {
    x: MARGIN_X,
    y: cursorY,
    size: 12,
    font: regularFont,
    color: mutedColor
  })
  cursorY -= 18

  const analyzedAt = meta.analyzedAt || new Date().toLocaleString()
  const metaLines = [
    `Analyzed at: ${analyzedAt}`,
    `Source file: ${meta.sourceFileName || "Unknown"}`,
    `Target role: ${meta.jobTitle || "Not provided"}`,
    `Company: ${meta.companyName || "Not provided"}`
  ]

  for (const metaLine of metaLines) {
    page.drawText(metaLine, {
      x: MARGIN_X,
      y: cursorY,
      size: 10,
      font: regularFont,
      color: mutedColor
    })
    cursorY -= 14
  }

  cursorY -= 6

  const scoreBoxHeight = 38
  page.drawRectangle({
    x: MARGIN_X,
    y: cursorY - 8,
    width: contentWidth,
    height: scoreBoxHeight,
    color: rgb(0.97, 0.92, 0.95),
    borderColor: rgb(0.84, 0.42, 0.56),
    borderWidth: 1
  })

  page.drawText(`Overall Score: ${feedback.overallScore}/100`, {
    x: MARGIN_X + 12,
    y: cursorY + 5,
    size: 15,
    font: boldFont,
    color: headingColor
  })
  cursorY -= 52

  const categories: FeedbackCategoryKey[] = [
    "toneAndStyle",
    "content",
    "structure",
    "skills"
  ]

  for (const categoryKey of categories) {
    const category = feedback[categoryKey]
    const categoryTitle = `${categoryToLabel(categoryKey)} (${category.score}/100)`

    const headingEnsure = ensurePage(pdfDoc, page, cursorY, 24)
    page = headingEnsure.page
    cursorY = headingEnsure.cursorY

    page.drawText(categoryTitle, {
      x: MARGIN_X,
      y: cursorY,
      size: 13,
      font: boldFont,
      color: bodyColor
    })
    cursorY -= 16

    for (const tip of category.tips) {
      const prefix = tip.type === "good" ? "GOOD" : "IMPROVE"
      const tipTitle = `${prefix}: ${tip.tip}`

      const titleBlock = drawWrappedLineBlock({
        pdfDoc,
        page,
        cursorY,
        text: tipTitle,
        font: boldFont,
        size: 10,
        color: tip.type === "good" ? rgb(0.08, 0.45, 0.24) : rgb(0.64, 0.39, 0.05),
        maxWidth: contentWidth - 14,
        lineHeight: 14,
        offsetX: MARGIN_X + 14
      })
      page = titleBlock.page
      cursorY = titleBlock.cursorY

      const explanationBlock = drawWrappedLineBlock({
        pdfDoc,
        page,
        cursorY,
        text: tip.explanation,
        font: regularFont,
        size: 10,
        color: bodyColor,
        maxWidth: contentWidth - 14,
        lineHeight: 14,
        offsetX: MARGIN_X + 14
      })
      page = explanationBlock.page
      cursorY = explanationBlock.cursorY - LINE_GAP
    }

    cursorY -= 6
  }

  return pdfDoc.save()
}
