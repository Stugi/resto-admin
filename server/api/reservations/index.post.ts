export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { tableId, guestName, guestPhone, startTime, peopleCount } = body

    // 1. Формируем DateTime (сегодняшняя дата + время из формы)
    const startDateTime = new Date()
    const [hours, minutes] = startTime.split(':')
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    // По умолчанию ставим бронь на 2 часа
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000)

    // 2. Проверка на конфликты (Double Booking)
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

    // 3. Работа с гостем (Upsert: найдем по телефону или создадим нового)
    const guest = await prisma.guest.upsert({
        where: { phone: guestPhone },
        update: { name: guestName },
        create: { phone: guestPhone, name: guestName }
    })

    // 4. Создаем бронь
    return await prisma.reservation.create({
        data: {
            tableId,
            guestId: guest.id,
            startTime: startDateTime,
            endTime: endDateTime,
            peopleCount: Number(peopleCount),
            status: 'confirmed'
        }
    })
})