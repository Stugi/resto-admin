import type { H3Event } from 'h3'
import { hashApiKey } from './apiKey'

export interface ApiAuthContext {
    restaurantId: string
    apiKeyId: string
    scope: string
}

/**
 * Проверяет Authorization: Bearer <key>, ищет ApiKey по хэшу.
 * Кладёт ApiAuthContext в event.context.apiAuth.
 * Бросает 401 при отсутствии/невалидном/отозванном ключе.
 */
export async function requireApiKey(event: H3Event): Promise<ApiAuthContext> {
    const header = getHeader(event, 'authorization') || ''
    const match = header.match(/^Bearer\s+(.+)$/i)
    if (!match) {
        throw createError({ statusCode: 401, statusMessage: 'Missing API key' })
    }
    const plain = match[1]!.trim()
    const hash = hashApiKey(plain)

    const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash: hash },
        include: { restaurant: { select: { id: true, deletedAt: true, allowedOrigins: true } } }
    })

    if (!apiKey || apiKey.revokedAt || apiKey.restaurant.deletedAt) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid API key' })
    }

    // Обновляем lastUsedAt асинхронно — не блокируем запрос
    prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() }
    }).catch(() => { /* игнорим, это не критично */ })

    const ctx: ApiAuthContext = {
        restaurantId: apiKey.restaurantId,
        apiKeyId: apiKey.id,
        scope: apiKey.scope
    }
    event.context.apiAuth = ctx
    return ctx
}
