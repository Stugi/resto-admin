import type { H3Event } from 'h3'
import { requireApiKey, type ApiAuthContext } from './apiAuth'
import { checkRateLimit } from './rateLimit'
import { applyCors } from './cors'

/**
 * Полный пайплайн публичного API: CORS → auth → rate limit.
 * Использовать в начале каждого хендлера в /api/public/v1/*.
 */
export async function authenticatePublicRequest(event: H3Event): Promise<ApiAuthContext> {
    const auth = await requireApiKey(event)

    const restaurant = await prisma.restaurant.findUnique({
        where: { id: auth.restaurantId },
        select: { allowedOrigins: true }
    })
    applyCors(event, restaurant?.allowedOrigins ?? [])

    checkRateLimit(event, auth.apiKeyId, 60, 60_000)

    return auth
}
