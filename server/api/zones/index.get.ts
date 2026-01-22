export default defineEventHandler(async (event) => {
    const now = new Date()

    // 1. Определяем границы "сегодня"
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    // Граница для статуса "Reserved" (например, забронировано в ближайшие 2 часа)
    const soonLimit = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    const zones = await prisma.zone.findMany({
        where: { deletedAt: null },
        include: {
            tables: {
                include: {
                    reservations: {
                        where: {
                            deletedAt: null, status: { in: ['confirmed', 'seated'] },
                            startTime: { gte: startOfToday, lte: endOfToday },
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
            let status = 'free'

            // Бронь прямо сейчас?
            const current = table.reservations.find(res =>
                now >= res.startTime && now <= res.endTime
            )

            // Бронь начнется скоро (в ближайшие 2 часа)?
            const upcoming = table.reservations.find(res =>
                res.startTime > now && res.startTime <= soonLimit
            )

            if (current) status = 'busy'
            else if (upcoming) status = 'reserved'

            return {
                ...table,
                status
            }
        })
    }))
})