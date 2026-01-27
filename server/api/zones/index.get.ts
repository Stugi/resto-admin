import { ZoneWithTables, TableStatus } from '~~/types'
import { startOfDay, endOfDay, parseISO, addHours } from 'date-fns'

export default defineEventHandler(async (event): Promise<ZoneWithTables[]> => {
    const query = getQuery(event)

    const restaurantSlug = query.restaurantSlug as string
    const dateParam = query.date as string
    const targetDate = dateParam ? parseISO(dateParam) : new Date()

    const start = startOfDay(targetDate)
    const end = endOfDay(targetDate)

    // 2. Определяем "время просмотра" (viewTime)
    // Если в query пришло "18:30", создаем объект даты на это время
    const viewTimeParam = query.viewTime as string // формат "HH:mm"
    let comparisonTime: Date

    if (viewTimeParam) {
        const [hours, minutes] = viewTimeParam.split(':')
        comparisonTime = new Date(targetDate)
        comparisonTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    } else {
        comparisonTime = new Date() // По умолчанию - текущее время
    }

    // Граница для статуса "Забронирован скоро" (+2 часа от точки просмотра)
    const soonLimit = addHours(comparisonTime, 2)

    const zones = await prisma.zone.findMany({
        where: { deletedAt: null, restaurant: { slug: restaurantSlug } },
        include: {
            tables: {
                include: {
                    reservations: {
                        where: {
                            deletedAt: null, status: { in: ['confirmed', 'seated'] },
                            startTime: { gte: start, lte: end },
                        },
                        orderBy: { startTime: 'asc' }
                    }
                },
                where: { deletedAt: null }, orderBy: { name: 'asc' }
            },
        },
        orderBy: { createdAt: 'asc' },
    })

    return zones.map(zone => ({
        ...zone,
        tables: zone.tables.map(table => {
            let status: TableStatus = 'free'

            // Бронь прямо сейчас?
            const currentBooking = table.reservations.find(res =>
                comparisonTime >= res.startTime && comparisonTime < res.endTime
            )


            // Бронь начнется скоро (в ближайшие 2 часа)?
            const upcomingBooking = table.reservations.find(res =>
                res.startTime >= comparisonTime && res.startTime <= soonLimit
            )

            if (currentBooking) {
                status = 'busy'
            } else if (upcomingBooking) {
                status = 'reserved'
            }

            return {
                ...table,
                status
            }
        })
    }))
})