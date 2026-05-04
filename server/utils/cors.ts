import type { H3Event } from 'h3'

/**
 * Проверка origin против whitelist ресторана.
 * Если origin не задан (server-to-server) — пропускаем.
 * Если origin задан и не в whitelist — 403.
 * Если в whitelist — выставляем CORS-хедеры.
 */
export function applyCors(event: H3Event, allowedOrigins: string[]): void {
    const origin = getHeader(event, 'origin')
    if (!origin) return // не браузер — пропускаем

    if (allowedOrigins.length === 0 || !allowedOrigins.includes(origin)) {
        throw createError({ statusCode: 403, statusMessage: 'Origin not allowed' })
    }

    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', 'Authorization, Content-Type')
    setHeader(event, 'Vary', 'Origin')
}
