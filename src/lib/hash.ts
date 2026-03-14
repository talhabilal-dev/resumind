import { createHash } from "crypto"

/**
 * Normalise a string for stable hashing:
 * - lowercase
 * - collapse whitespace
 * - trim
 */
function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim()
}

/**
 * Compute a SHA-256 fingerprint of (cvText, jdText) suitable for cache
 * key lookups.  The result is a 64-char hex string.
 */
export function computeAnalysisHash(cvText: string, jdText: string): string {
  const payload = `${normalise(cvText)}||${normalise(jdText)}`
  return createHash("sha256").update(payload, "utf8").digest("hex")
}
