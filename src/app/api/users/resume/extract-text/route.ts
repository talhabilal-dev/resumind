import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
// Import library entry directly to bypass pdf-parse package root debug side-effects.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  data: Buffer
) => Promise<{ text?: string }>;

import { decodeToken } from "@/helpers/decodeToken";

const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return "";
  return filename.slice(dot).toLowerCase();
}

function normalizeExtractedText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parsed = await pdfParse(buffer);
  return parsed.text || "";
}

export async function POST(req: NextRequest) {
  try {
    const payload: any = await decodeToken(req);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in.", success: false },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("resumeFile");

    console.log("this is file", file)

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing resumeFile in form-data.", success: false },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_RESUME_FILE_SIZE) {
      return NextResponse.json(
        { error: "Resume file must be between 1 byte and 5MB.", success: false },
        { status: 400 }
      );
    }

    const extension = getFileExtension(file.name);
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: "Resume must be PDF, DOC, DOCX, or TXT.", success: false },
        { status: 400 }
      );
    }

    // Convert file to base64 before extraction, then decode back to Buffer.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const decodedBuffer = Buffer.from(base64, "base64");

    let extractedText = "";

    if (extension === ".txt") {
      extractedText = decodedBuffer.toString("utf-8");
    } else if (extension === ".pdf") {
      extractedText = await extractPdfText(decodedBuffer);
    } else if (extension === ".docx") {
      const parsed = await mammoth.extractRawText({ buffer: decodedBuffer });
      extractedText = parsed.value || "";
    } else {
      return NextResponse.json(
        {
          error:
            "DOC extraction is not supported directly. Please convert to DOCX/TXT or paste resume text.",
          success: false,
        },
        { status: 400 }
      );
    }

    const normalizedText = normalizeExtractedText(extractedText);

    if (!normalizedText || normalizedText.length < 120) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from this file. Please paste your resume text manually.",
          success: false,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        resumeText: normalizedText,
        meta: {
          filename: file.name,
          extension,
          extractedLength: normalizedText.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Resume text extraction error:", error.message);
    return NextResponse.json(
      { error: "Failed to extract resume text.", success: false },
      { status: 500 }
    );
  }
}
