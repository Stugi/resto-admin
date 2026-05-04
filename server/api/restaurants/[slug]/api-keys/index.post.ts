import { z } from 'zod'
import { generateApiKey } from '~~/server/utils/apiKey'

const bodySchema = z.object({
    name: z.string().min(1, 'Имя обязательно').max(100),
    scope: z.enum(['server', 'public_widget']).default('server')
})

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

    const raw = await readBody(event)
    const result = bodySchema.safeParse(raw)
    if (!result.success) {
        throw createError({ statusCode: 400, statusMessage: result.error.issues[0]?.message ?? 'Ошибка валидации' })
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { slug }, select: { id: true } })
    if (!restaurant) throw createError({ statusCode: 404, statusMessage: 'Ресторан не найден' })

    const { plain, hash, prefix } = generateApiKey()

    const created = await prisma.apiKey.create({
        data: {
            restaurantId: restaurant.id,
            name: result.data.name,
            scope: result.data.scope,
            keyHash: hash,
            prefix
        },
        select: { id: true, name: true, prefix: true, scope: true, createdAt: true }
    })

    // Plain-ключ возвращается ТОЛЬКО при создании, потом не восстановить.
    return { ...created, key: plain }
})
