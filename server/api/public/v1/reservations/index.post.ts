import { z } from 'zod'
import { authenticatePublicRequest } from '~~/server/utils/publicApi'
import { createReservation, ReservationError, tableBelongsToRestaurant } from '~~/server/services/reservations'

const bodySchema = z.object({
    tableId: z.string().uuid('Неверный ID стола'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты'),
    guestName: z.string().min(2, 'Имя слишком короткое'),
    guestPhone: z.string().regex(/^7\d{10}$/, 'Неверный формат телефона'),
    startTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Неверный формат времени'),
    peopleCount: z.number().int().min(1).max(20),
    comment: z.string().max(500).optional(),
})

export default defineEventHandler(async (event) => {
    const auth = await authenticatePublicRequest(event)
    const raw = await readBody(event)
    const result = bodySchema.safeParse(raw)
    if (!result.success) {
        throw createError({ statusCode: 400, statusMessage: result.error.issues[0]?.message ?? 'Ошибка валидации' })
    }

    const belongs = await tableBelongsToRestaurant(result.data.tableId, auth.restaurantId)
    if (!belongs) {
        throw createError({ statusCode: 403, statusMessage: 'Стол не принадлежит вашему ресторану' })
    }

    try {
        const reservation = await createReservation({
            ...result.data,
            createdBy: `api:${auth.apiKeyId.slice(0, 8)}`
        })
        return {
            id: reservation.id,
            tableId: reservation.tableId,
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            peopleCount: reservation.peopleCount,
            status: reservation.status
        }
    } catch (e) {
        if (e instanceof ReservationError) {
            throw createError({ statusCode: e.statusCode, statusMessage: e.message })
        }
        throw e
    }
})
