import { z } from 'zod'

// Валидация входных данных
const bodySchema = z.object({
    tableId: z.string().uuid('Неверный ID стола'),
    guestName: z.string().min(2, 'Имя слишком короткое'),
    guestPhone: z.string().regex(/^7\d{10}$/, 'Неверный формат телефона'),
    startTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Неверный формат времени'),
    peopleCount: z.number().int().min(1, 'Минимум 1 гость').max(20, 'Максимум 20 гостей'),
})

export default defineEventHandler(async (event) => {
    const raw = await readBody(event)

    // 1. Валидация
    const result = bodySchema.safeParse(raw)
    if (!result.success) {
        const firstError = result.error.issues[0]?.message ?? 'Ошибка валидации'
        throw createError({
            statusCode: 400,
            statusMessage: firstError
        })
    }

    const { tableId, guestName, guestPhone, startTime, peopleCount } = result.data

    // 2. Формируем DateTime (сегодняшняя дата + время из формы)
    const startDateTime = new Date()
    const [hours, minutes] = startTime.split(':')
    startDateTime.setHours(parseInt(hours!), parseInt(minutes!), 0, 0)

    // По умолчанию ставим бронь на 2 часа
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000)

    // 3. Проверка на конфликты (Double Booking)
    const existingReservation = await prisma.reservation.findFirst({
        where: {
            tableId,
            deletedAt: null,
            status: { in: ['confirmed', 'seated'] },
            // Алгоритм пересечения интервалов:
            // (StartA < EndB) AND (EndA > StartB)
            AND: [
                { startTime: { lt: endDateTime } },
                { endTime: { gt: startDateTime } }
            ]
        }
    })

    if (existingReservation) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Стол уже забронирован на это время'
        })
    }

    // 4. Проверка вместимости стола
    const table = await prisma.table.findUnique({ where: { id: tableId } })
    if (!table) {
        throw createError({ statusCode: 404, statusMessage: 'Стол не найден' })
    }
    if (peopleCount > table.capacity) {
        throw createError({
            statusCode: 400,
            statusMessage: `Максимум ${table.capacity} гостей за этот стол`
        })
    }

    // 5. Работа с гостем (Upsert: найдем по телефону или создадим нового)
    const guest = await prisma.guest.upsert({
        where: { phone: guestPhone },
        update: { name: guestName },
        create: { phone: guestPhone, name: guestName }
    })

    // 6. Создаем бронь
    return await prisma.reservation.create({
        data: {
            tableId,
            guestId: guest.id,
            startTime: startDateTime,
            endTime: endDateTime,
            peopleCount,
            status: 'confirmed'
        }
    })
})
