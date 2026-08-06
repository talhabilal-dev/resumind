import { createHash, randomBytes } from "crypto"

export function generateOpaqueToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString("hex")
  return { rawToken, tokenHash: hashToken(rawToken) }
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex")
}