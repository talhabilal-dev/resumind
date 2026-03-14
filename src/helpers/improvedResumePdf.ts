import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib"

type ImprovedResumeMeta = {
  title?: string
  sourceFileName?: string
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN_X = 48
const TOP_MARGIN = 60
const BOTTOM_MARGIN = 50

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return [""]

  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
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
  lineHeight: number
): { page: PDFPage; cursorY: number } {
  if (cursorY - lineHeight >= BOTTOM_MARGIN) {
    return { page, cursorY }
  }

  const nextPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  return { page: nextPage, cursorY: PAGE_HEIGHT - TOP_MARGIN }
}

export async function buildImprovedResumePdf(
  improvedResumeText: string,
  meta: ImprovedResumeMeta
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const contentWidth = PAGE_WIDTH - MARGIN_X * 2
  const lineHeight = 14

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let cursorY = PAGE_HEIGHT - TOP_MARGIN

  page.drawText("Resumind AI Improved CV", {
    x: MARGIN_X,
    y: cursorY,
    size: 18,
    font: boldFont,
    color: rgb(0.77, 0.16, 0.3)
  })
  cursorY -= 22

  page.drawText(`Source: ${meta.sourceFileName || "Uploaded PDF"}`, {
    x: MARGIN_X,
    y: cursorY,
    size: 10,
    font: regularFont,
    color: rgb(0.35, 0.35, 0.42)
  })
  cursorY -= 13

  page.drawText(`Target Role: ${meta.title || "Not provided"}`, {
    x: MARGIN_X,
    y: cursorY,
    size: 10,
    font: regularFont,
    color: rgb(0.35, 0.35, 0.42)
  })
  cursorY -= 18

  const paragraphs = improvedResumeText
    .split(/\n{2,}/)
    .map((value) => value.trim())
    .filter(Boolean)

  for (const paragraph of paragraphs) {
    const lines = wrapText(paragraph, regularFont, 10.5, contentWidth)
    for (const line of lines) {
      const ensured = ensurePage(pdfDoc, page, cursorY, lineHeight)
      page = ensured.page
      cursorY = ensured.cursorY

      page.drawText(line, {
        x: MARGIN_X,
        y: cursorY,
        size: 10.5,
        font: regularFont,
        color: rgb(0.12, 0.12, 0.15)
      })

      cursorY -= lineHeight
    }

    cursorY -= 8
  }

  return pdfDoc.save()
}
