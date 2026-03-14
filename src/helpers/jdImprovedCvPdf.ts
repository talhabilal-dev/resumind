import {
    PDFDocument,
    StandardFonts,
    rgb,
    type PDFFont,
    type PDFPage,
} from "pdf-lib"
import type { ImprovedResumeContent } from "@/schemas/jdAnalysisSchema"

// ─── Page geometry ────────────────────────────────────────────────────────────
const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN_X = 50
const TOP_MARGIN = 55
const BOTTOM_MARGIN = 48
const CONTENT_W = PAGE_W - MARGIN_X * 2

// ─── Brand colour (rose-600 equivalent) ───────────────────────────────────────
const BRAND = rgb(0.8, 0.1, 0.25)
const DARK = rgb(0.1, 0.1, 0.12)
const MUTED = rgb(0.36, 0.36, 0.42)
const RULE = rgb(0.85, 0.85, 0.87)

// ─── Typography helpers ───────────────────────────────────────────────────────
function wrapText(
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number
): string[] {
    const words = text.trim().split(/\s+/).filter(Boolean)
    if (!words.length) return [""]

    const lines: string[] = []
    let current = ""

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
            current = candidate
        } else {
            if (current) lines.push(current)
            // Handle very long single word
            if (font.widthOfTextAtSize(word, size) > maxWidth) {
                let chunk = ""
                for (const ch of word) {
                    const next = chunk + ch
                    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
                        chunk = next
                    } else {
                        if (chunk) lines.push(chunk)
                        chunk = ch
                    }
                }
                current = chunk
            } else {
                current = word
            }
        }
    }
    if (current) lines.push(current)
    return lines
}

function ensurePage(
    doc: PDFDocument,
    page: PDFPage,
    y: number,
    need: number
): { page: PDFPage; y: number } {
    if (y - need >= BOTTOM_MARGIN) return { page, y }
    const next = doc.addPage([PAGE_W, PAGE_H])
    return { page: next, y: PAGE_H - TOP_MARGIN }
}

// ─── Drawing primitives ───────────────────────────────────────────────────────
function drawText(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont,
    color = DARK
): void {
    page.drawText(text, { x, y, size, font, color })
}

function drawRule(page: PDFPage, y: number): void {
    page.drawLine({
        start: { x: MARGIN_X, y },
        end: { x: PAGE_W - MARGIN_X, y },
        thickness: 0.6,
        color: RULE,
    })
}

type State = { page: PDFPage; y: number }

function addSectionHeading(
    doc: PDFDocument,
    s: State,
    title: string,
    bold: PDFFont
): State {
    const { page, y } = ensurePage(doc, s.page, s.y, 36)
    drawText(page, title.toUpperCase(), MARGIN_X, y, 10.5, bold, BRAND)
    drawRule(page, y - 5)
    return { page, y: y - 18 }
}

function addBodyLines(
    doc: PDFDocument,
    s: State,
    text: string,
    font: PDFFont,
    bold: PDFFont,
    size = 9.5,
    lineH = 14
): State {
    let { page, y } = s

    // Process line-by-line preserving blank lines as paragraph breaks
    const rawLines = text.split("\n")

    for (const raw of rawLines) {
        const trimmed = raw.trim()

        if (!trimmed) {
            // Blank line = small gap
            y -= 6
            continue
        }

        // Detect bullet-like lines
        const isBullet = /^[-•*]/.test(trimmed)
        const indentX = isBullet ? MARGIN_X + 12 : MARGIN_X
        const maxW = CONTENT_W - (isBullet ? 12 : 0)
        const cleanText = isBullet ? trimmed.replace(/^[-•*]\s*/, "") : trimmed

        // Bold line if it looks like a sub-heading (ends with : or all caps short)
        const isBold =
            (trimmed.endsWith(":") && trimmed.length < 60) ||
            (trimmed === trimmed.toUpperCase() && trimmed.length < 50 && trimmed.length > 2)
        const usedFont = isBold ? bold : font

        const wrapped = wrapText(cleanText, usedFont, size, maxW)
        for (let li = 0; li < wrapped.length; li++) {
            const ensured = ensurePage(doc, page, y, lineH)
            page = ensured.page
            y = ensured.y

            if (isBullet && li === 0) {
                drawText(page, "•", MARGIN_X + 2, y, size, font, MUTED)
            }
            drawText(page, wrapped[li], indentX, y, size, usedFont)
            y -= lineH
        }
    }

    return { page, y }
}

// ─── Public API ───────────────────────────────────────────────────────────────
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

    let page = doc.addPage([PAGE_W, PAGE_H])
    let y = PAGE_H - TOP_MARGIN

    // ── Header block ──────────────────────────────────────────────────────────
    drawText(page, "AI Improved CV", MARGIN_X, y, 22, bold, BRAND)
    y -= 26

    const metaLine = [
        meta.sourceFileName ? `Source: ${meta.sourceFileName}` : null,
        meta.jobTitle ? `Role: ${meta.jobTitle}` : null,
        meta.companyName ? `Company: ${meta.companyName}` : null,
        meta.atsScore != null ? `ATS Score: ${meta.atsScore}/100` : null,
        meta.jdMatchScore != null ? `JD Match: ${meta.jdMatchScore}/100` : null,
    ]
        .filter(Boolean)
        .join("   |   ")

    if (metaLine) {
        drawText(page, metaLine, MARGIN_X, y, 8.5, regular, MUTED)
        y -= 14
    }

    drawText(
        page,
        `Generated by Resumind on ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })}`,
        MARGIN_X,
        y,
        8,
        regular,
        MUTED
    )
    y -= 20

    page.drawLine({
        start: { x: MARGIN_X, y },
        end: { x: PAGE_W - MARGIN_X, y },
        thickness: 2,
        color: BRAND,
    })
    y -= 20

    let s: State = { page, y }

    // ── Summary ──────────────────────────────────────────────────────────────
    if (content.summary?.trim()) {
        s = addSectionHeading(doc, s, "Professional Summary", bold)
        s = addBodyLines(doc, s, content.summary, regular, bold)
        s.y -= 10
    }

    // ── Experience ──────────────────────────────────────────────────────────
    if (content.experience?.trim()) {
        s = addSectionHeading(doc, s, "Work Experience", bold)
        s = addBodyLines(doc, s, content.experience, regular, bold)
        s.y -= 10
    }

    // ── Skills ──────────────────────────────────────────────────────────────
    if (content.skills?.trim()) {
        s = addSectionHeading(doc, s, "Skills", bold)
        s = addBodyLines(doc, s, content.skills, regular, bold)
        s.y -= 10
    }

    // ── Projects ─────────────────────────────────────────────────────────────
    if (content.projects?.trim()) {
        s = addSectionHeading(doc, s, "Projects", bold)
        s = addBodyLines(doc, s, content.projects, regular, bold)
        s.y -= 10
    }

    // ── Footer on last page ───────────────────────────────────────────────────
    const pages = doc.getPages()
    const lastPage = pages[pages.length - 1]
    lastPage.drawText("Generated by Resumind AI · Optimised for ATS", {
        x: MARGIN_X,
        y: BOTTOM_MARGIN - 14,
        size: 7.5,
        font: regular,
        color: MUTED,
    })

    return doc.save()
}