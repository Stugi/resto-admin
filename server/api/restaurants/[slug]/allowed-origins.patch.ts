import { z } from 'zod'

const bodySchema = z.object({
    allowedOrigins: z.array(z.string().url('Невалидный URL')).max(20)
})

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

    const raw = await readBody(event)
    const result = bodySchema.safeParse(raw)
    if (!result.success) {
        throw createError({ statusCode: 400, statusMessage: result.error.issues[0]?.message ?? 'Ошибка валидации' })
    }

    // Нормализуем — без trailing slash, lowercase scheme+host
    const normalized = result.data.allowedOrigins.map(o => {
        try {
            const u = new URL(o)
            return `${u.protocol}//${u.host}`
        } catch {
            return o
        }
    })

    const updated = await prisma.restaurant.update({
        where: { slug },
        data: { allowedOrigins: normalized },
        select: { allowedOrigins: true }
    })

    return updated
})
