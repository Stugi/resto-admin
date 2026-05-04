import type { H3Event } from 'h3'

interface Bucket {
    count: number
    resetAt: number
}

const buckets = new Map<string, Bucket>()

/**
 * In-memory rate limit. На прод с несколькими инстансами заменить на Redis.
 * По умолчанию 60 req / 60 сек.
 */
export function checkRateLimit(event: H3Event, key: string, limit = 60, windowMs = 60_000): void {
    const now = Date.now()
    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt < now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs })
        return
    }

    bucket.count++
    if (bucket.count > limit) {
        const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
        setHeader(event, 'Retry-After', retryAfter)
        throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
    }
}

// Простая чистка просроченных бакетов раз в 5 минут
setInterval(() => {
    const now = Date.now()
    for (const [k, b] of buckets) {
        if (b.resetAt < now) buckets.delete(k)
    }
}, 5 * 60_000).unref?.()
