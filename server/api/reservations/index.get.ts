import { startOfDay, endOfDay, parseISO } from 'date-fns'

export default defineEventHandler(async (event) => {
    // Получаем дату из query параметров (?date=2026-01-26)
    const query = getQuery(event)
    const dateParam = query.date as string

    // Если дата не передана — берем текущую
    const targetDate = dateParam ? parseISO(dateParam) : new Date()

    const start = startOfDay(targetDate)
    const end = endOfDay(targetDate)

    return await prisma.reservation.findMany({
        where: {
            deletedAt: null,
            startTime: { gte: start, lte: end }
        },
        include: { guest: true, table: true },
        orderBy: { startTime: 'asc' }
    })
})