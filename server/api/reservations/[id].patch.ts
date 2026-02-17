import { z } from 'zod'

/** Обновление статуса бронирования (seated, confirmed, cancelled, finished) */
const bodySchema = z.object({
    status: z.enum(['confirmed', 'seated', 'cancelled', 'finished'], {
        message: 'Недопустимый статус'
    })
})

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID бронирования обязателен' })
    }

    const raw = await readBody(event)
    const result = bodySchema.safeParse(raw)
    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: result.error.issues[0]?.message ?? 'Ошибка валидации'
        })
    }

    // Проверяем существование брони
    const reservation = await prisma.reservation.findUnique({ where: { id } })
    if (!reservation || reservation.deletedAt) {
        throw createError({ statusCode: 404, statusMessage: 'Бронирование не найдено' })
    }

    // Обновляем статус
    return await prisma.reservation.update({
        where: { id },
        data: {
            status: result.data.status,
            updatedAt: new Date()
        },
        include: { guest: true, table: true }
    })
})
