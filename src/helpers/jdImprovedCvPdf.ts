import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib"
import type { ImprovedResumeContent } from "@/schemas/jdAnalysisSchema"

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN_X = 38
const TOP_MARGIN = 34
const BOTTOM_MARGIN = 38

const LIGHT_BG = rgb(0.965, 0.965, 0.968)
const DARK = rgb(0.15, 0.15, 0.17)
const MUTED = rgb(0.38, 0.38, 0.42)
const RULE = rgb(0.72, 0.72, 0.76)
const HEADER_BG = rgb(0.24, 0.24, 0.26)
const WHITE = rgb(1, 1, 1)

type State = {
  page: PDFPage
  y: number
}

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

    // Fallback for very long words
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

function ensurePage(doc: PDFDocument, s: State, requiredHeight: number): State {
  if (s.y - requiredHeight >= BOTTOM_MARGIN) {
    return s
  }

  const page = doc.addPage([PAGE_W, PAGE_H])
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_W,
    height: PAGE_H,
    color: LIGHT_BG,
  })

  return { page, y: PAGE_H - TOP_MARGIN }
}

function drawWrappedParagraph(params: {
  doc: PDFDocument
  state: State
  text: string
  x: number
  maxWidth: number
  font: PDFFont
  size: number
  color: ReturnType<typeof rgb>
  lineHeight: number
}): State {
  let state = params.state
  const lines = wrapText(params.text, params.font, params.size, params.maxWidth)

  for (const line of lines) {
    state = ensurePage(params.doc, state, params.lineHeight)
    state.page.drawText(line, {
      x: params.x,
      y: state.y,
      size: params.size,
      font: params.font,
      color: params.color,
    })
    state.y -= params.lineHeight
  }

  return state
}

function toBlockLines(input: string): string[] {
  return input
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function normalizedBullets(input: string): string[] {
  const raw = toBlockLines(input)
  const bullets: string[] = []
  let hadBulletPrefix = false

  for (const line of raw) {
    if (/^[-*\u2022]+\s*/.test(line)) {
      hadBulletPrefix = true
    }
    const cleaned = line.replace(/^[-*•]+\s*/, "").trim()
    if (cleaned) bullets.push(cleaned)
  }

  // Preserve paragraph integrity when bullets were not explicitly provided.
  if (!hadBulletPrefix) {
    return []
  }

  return bullets
}

function splitSkillsToLanguageAndExpertise(skillsText: string): {
  language: string[]
  expertise: string[]
} {
  const items = toBlockLines(skillsText)
  const language: string[] = []
  const expertise: string[] = []

  for (const item of items) {
    const cleaned = item.replace(/^[-*•]+\s*/, "").trim()
    if (!cleaned) continue

    const parts = cleaned.split(":")
    if (parts.length > 1) {
      const label = parts[0].trim().toLowerCase()
      const values = parts
        .slice(1)
        .join(":")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)

      if (
        label.includes("language") ||
        label.includes("programming language")
      ) {
        for (const value of values) {
          language.push(value)
        }
      } else {
        expertise.push(cleaned)
      }
    } else {
      const lowered = cleaned.toLowerCase()
      if (
        lowered === "english" ||
        lowered === "urdu" ||
        lowered === "punjabi" ||
        lowered === "arabic" ||
        lowered === "french"
      ) {
        language.push(cleaned)
      } else {
        expertise.push(cleaned)
      }
    }
  }

  return { language, expertise }
}

function drawContactItem(params: {
  page: PDFPage
  x: number
  y: number
  iconChar: string
  text: string
  font: PDFFont
  iconFont: PDFFont
}): void {
  const radius = 9

  params.page.drawCircle({
    x: params.x,
    y: params.y + 3,
    size: radius,
    borderColor: DARK,
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.99),
  })

  params.page.drawText(params.iconChar, {
    x: params.x - 2.7,
    y: params.y - 0.5,
    size: 8,
    font: params.iconFont,
    color: DARK,
  })

  params.page.drawText(params.text, {
    x: params.x + 14,
    y: params.y,
    size: 9,
    font: params.font,
    color: DARK,
  })
}

function renderRow(params: {
  doc: PDFDocument
  state: State
  title: string
  bodyText?: string
  bodyBullets?: string[]
  titleFont: PDFFont
  bodyFont: PDFFont
  titleSize?: number
  bodySize?: number
}): State {
  const titleW = 148
  const gutter = 12
  const contentX = MARGIN_X + titleW + gutter
  const contentW = PAGE_W - MARGIN_X - contentX
  const titleSize = params.titleSize ?? 13
  const bodySize = params.bodySize ?? 10.2
  const lineHeight = bodySize + 3

  let state = ensurePage(params.doc, params.state, 36)

  state.page.drawLine({
    start: { x: MARGIN_X, y: state.y },
    end: { x: PAGE_W - MARGIN_X, y: state.y },
    thickness: 1.15,
    color: RULE,
  })
  state.y -= 18

  // Title (left column)
  state.page.drawText(params.title, {
    x: MARGIN_X + 4,
    y: state.y,
    size: titleSize,
    font: params.titleFont,
    color: DARK,
  })

  // Body (right column)
  let rightState: State = { ...state }

  if (params.bodyText?.trim()) {
    rightState = drawWrappedParagraph({
      doc: params.doc,
      state: rightState,
      text: params.bodyText.trim(),
      x: contentX,
      maxWidth: contentW,
      font: params.bodyFont,
      size: bodySize,
      color: DARK,
      lineHeight,
    })
  }

  if (params.bodyBullets && params.bodyBullets.length > 0) {
    for (const bullet of params.bodyBullets) {
      rightState = ensurePage(params.doc, rightState, lineHeight)
      rightState.page.drawText("•", {
        x: contentX,
        y: rightState.y,
        size: bodySize,
        font: params.bodyFont,
        color: MUTED,
      })

      rightState = drawWrappedParagraph({
        doc: params.doc,
        state: rightState,
        text: bullet,
        x: contentX + 10,
        maxWidth: contentW - 10,
        font: params.bodyFont,
        size: bodySize,
        color: DARK,
        lineHeight,
      })
      rightState.y -= 2
    }
  }

  // Move row cursor to whichever column used more vertical space.
  state.y = Math.min(state.y - 5, rightState.y - 9)
  return state
}

function titleCaseFromRole(role?: string): string {
  if (!role?.trim()) return "Curriculum Vitae"
  return role
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export async function buildImprovedCvPdf(
  content: ImprovedResumeContent,
  meta: {
    jobTitle?: string
    companyName?: string
    sourceFileName?: string
    atsScore?: number
    jdMatchScore?: number
  }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const mono = await doc.embedFont(StandardFonts.CourierBold)

  const page = doc.addPage([PAGE_W, PAGE_H])
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: LIGHT_BG })

  let state: State = { page, y: PAGE_H - TOP_MARGIN }

  // Header area inspired by the shared sample layout.
  const leftHeaderW = 334
  const headerH = 104
  const headerY = state.y - headerH + 8

  const photoW = 64
  const photoH = 80
  const photoX = MARGIN_X + 10
  const photoY = headerY + 12

  // Optional photo placeholder block.
  state.page.drawRectangle({
    x: photoX,
    y: photoY,
    width: photoW,
    height: photoH,
    borderColor: rgb(0.75, 0.75, 0.77),
    borderWidth: 1,
    color: rgb(0.92, 0.92, 0.93),
  })
  state.page.drawText("PHOTO", {
    x: photoX + 15,
    y: photoY + photoH / 2 - 4,
    size: 8,
    font: bold,
    color: MUTED,
  })

  state.page.drawRectangle({
    x: MARGIN_X,
    y: headerY,
    width: leftHeaderW,
    height: headerH,
    color: HEADER_BG,
  })

  const topName = "CURRICULUM VITAE"
  const subtitle = titleCaseFromRole(meta.jobTitle)

  state.page.drawText(topName, {
    x: photoX + photoW + 12,
    y: headerY + 64,
    size: 17.5,
    font: bold,
    color: WHITE,
  })

  state.page.drawText(subtitle, {
    x: photoX + photoW + 12,
    y: headerY + 40,
    size: 10.6,
    font: regular,
    color: rgb(0.93, 0.93, 0.95),
  })

  const rightX = MARGIN_X + leftHeaderW + 18
  const rightTop = headerY + 78
  const contactLines = [
    meta.jobTitle ? `Role: ${meta.jobTitle}` : null,
    meta.companyName ? `Company: ${meta.companyName}` : null,
    meta.sourceFileName ? `File: ${meta.sourceFileName}` : null,
  ].filter((value): value is string => Boolean(value))

  if (contactLines.length === 0) {
    contactLines.push(`Generated: ${new Date().toLocaleDateString("en-US")}`)
  }

  const iconChars = ["R", "C", "F", "S"]
  let my = rightTop
  for (let i = 0; i < Math.min(4, contactLines.length); i++) {
    drawContactItem({
      page: state.page,
      x: rightX,
      y: my,
      iconChar: iconChars[i] || "I",
      text: contactLines[i],
      font: regular,
      iconFont: mono,
    })
    my -= 19
  }

  if (meta.atsScore != null || meta.jdMatchScore != null) {
    const scoreLine = [
      meta.atsScore != null ? `ATS ${meta.atsScore}/100` : null,
      meta.jdMatchScore != null ? `JD ${meta.jdMatchScore}/100` : null,
    ]
      .filter(Boolean)
      .join("   |   ")

    state.page.drawText(scoreLine, {
      x: rightX,
      y: my - 2,
      size: 8.5,
      font: bold,
      color: MUTED,
    })
  }

  state.y = headerY - 18

  // Sections with clear headings and structured content.
  state = renderRow({
    doc,
    state,
    title: "About Me",
    bodyText: content.summary,
    titleFont: bold,
    bodyFont: regular,
  })

  const expBullets = normalizedBullets(content.experience)
  state = renderRow({
    doc,
    state,
    title: "Experience",
    bodyBullets: expBullets.length > 0 ? expBullets : undefined,
    bodyText: expBullets.length === 0 ? content.experience : undefined,
    titleFont: bold,
    bodyFont: regular,
  })

  const projectBullets = normalizedBullets(content.projects)
  state = renderRow({
    doc,
    state,
    title: "Projects",
    bodyBullets: projectBullets.length > 0 ? projectBullets : undefined,
    bodyText: projectBullets.length === 0 ? content.projects : undefined,
    titleFont: bold,
    bodyFont: regular,
  })

  const splitSkills = splitSkillsToLanguageAndExpertise(content.skills)

  // Two-column final section: Language + Expertise.
  state = ensurePage(doc, state, 84)
  state.page.drawLine({
    start: { x: MARGIN_X, y: state.y },
    end: { x: PAGE_W - MARGIN_X, y: state.y },
    thickness: 1.15,
    color: RULE,
  })
  state.y -= 16

  const midX = MARGIN_X + (PAGE_W - MARGIN_X * 2) * 0.36
  state.page.drawText("Language", {
    x: MARGIN_X + 4,
    y: state.y,
    size: 12,
    font: bold,
    color: DARK,
  })

  state.page.drawText("Expertise", {
    x: midX + 10,
    y: state.y,
    size: 12,
    font: bold,
    color: DARK,
  })

  state.page.drawLine({
    start: { x: midX, y: state.y + 16 },
    end: { x: midX, y: state.y - 130 },
    thickness: 0.8,
    color: RULE,
  })

  let leftY = state.y - 16
  const languageItems = splitSkills.language.length > 0 ? splitSkills.language : ["Not specified"]
  for (let idx = 0; idx < languageItems.slice(0, 8).length; idx++) {
    const item = languageItems[idx]
    state = ensurePage(doc, state, 14)
    state.page.drawText(item, {
      x: MARGIN_X + 4,
      y: leftY,
      size: 9.5,
      font: regular,
      color: DARK,
    })
    leftY -= 15
  }

  let rightY = state.y - 16
  const expertiseItems = splitSkills.expertise.length > 0 ? splitSkills.expertise : ["Not specified"]
  for (const item of expertiseItems.slice(0, 12)) {
    const lines = wrapText(item, regular, 9.5, PAGE_W - MARGIN_X - (midX + 10))
    for (const line of lines) {
      state = ensurePage(doc, state, 14)
      state.page.drawText(line, {
        x: midX + 10,
        y: rightY,
        size: 9.5,
        font: regular,
        color: DARK,
      })
      rightY -= 14
    }
    rightY -= 3
  }

  state.y = Math.min(leftY, rightY) - 6

  // Bottom rule for visual closure.
  state = ensurePage(doc, state, 20)
  state.page.drawLine({
    start: { x: MARGIN_X, y: state.y },
    end: { x: PAGE_W - MARGIN_X, y: state.y },
    thickness: 1,
    color: RULE,
  })

  return doc.save()
}
