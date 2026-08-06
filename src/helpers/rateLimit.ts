type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const WINDOW_MS = 60 * 1000

function cleanup(): void {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return req.headers.get("x-real-ip") || "unknown"
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number }

/**
 * In-memory fixed-window rate limiter keyed by IP (+ optional secondary key).
 * Suitable for single-instance deployments. For multi-instance serverless,
 * swap this for a shared store (e.g. Upstash Redis).
 */
export function rateLimit(options: {
  ip: string
  limit: number
  windowSeconds?: number
  key?: string
}): RateLimitResult {
  const { ip, limit, key } = options
  const windowMs = (options.windowSeconds ?? 60) * 1000
  const bucketKey = `${ip}:${key ?? ""}`

  cleanup()

  const now = Date.now()
  const bucket = buckets.get(bucketKey)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (bucket.count < limit) {
    bucket.count += 1
    return { allowed: true }
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  }
}