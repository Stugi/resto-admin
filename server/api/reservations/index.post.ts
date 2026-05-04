import { z } from 'zod'
import { createReservation, ReservationError } from '~~/server/services/reservations'

const bodySchema = z.object({
    tableId: z.string().uuid('Неверный ID стола'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты').optional(),
    guestName: z.string().min(2, 'Имя слишком короткое'),
    guestPhone: z.string().regex(/^7\d{10}$/, 'Неверный формат телефона'),
    startTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Неверный формат времени'),
    peopleCount: z.number().int().min(1, 'Минимум 1 гость').max(20, 'Максимум 20 гостей'),
    comment: z.string().max(500, 'Комментарий слишком длинный').optional(),
})

export default defineEventHandler(async (event) => {
    const raw = await readBody(event)
    const result = bodySchema.safeParse(raw)
    if (!result.success) {
        const firstError = result.error.issues[0]?.message ?? 'Ошибка валидации'
        throw createError({ statusCode: 400, statusMessage: firstError })
    }

    try {
        return await createReservation(result.data)
    } catch (e) {
        if (e instanceof ReservationError) {
            throw createError({ statusCode: e.statusCode, statusMessage: e.message })
        }
        throw e
    }
})
