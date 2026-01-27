import { ZoneWithTables, TableStatus } from '~~/types'
import { startOfDay, endOfDay, addHours } from 'date-fns'
import { z } from 'zod'

const querySchema = z.object({
    date: z.iso.date().optional(),
    restaurantSlug: z.string().min(1, 'restaurantSlug is required'),
    viewTime: z.string().regex(/^\d{2}:\d{2}$/, 'viewTime must be HH:mm').optional()
})

export default defineEventHandler(async (event): Promise<ZoneWithTables[]> => {
    const { date, restaurantSlug, viewTime } = await getValidatedQuery(event, querySchema.parse)

    const targetDate = date ? new Date(date) : new Date()
    const start = startOfDay(targetDate)
    const end = endOfDay(targetDate)

    const comparisonTime = parseViewTime(targetDate, viewTime)

    const soonLimit = addHours(comparisonTime, 2)

    const zones = await prisma.zone.findMany({
        where: {
            deletedAt: null,
            restaurant: { slug: restaurantSlug }
        },
        include: {
            tables: {
                where: { deletedAt: null },
                orderBy: { name: 'asc' },
                include: {
                    reservations: {
                        where: {
                            deletedAt: null,
                            status: { in: ['confirmed', 'seated'] },
                            startTime: { gte: start, lte: end },
                        },
                        orderBy: { startTime: 'asc' }
                    }
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    })

    return zones.map(zone => ({
        ...zone,
        tables: zone.tables.map(table => {
            const currentBooking = table.reservations.find(res =>
                comparisonTime >= res.startTime && comparisonTime < res.endTime
            )

            const upcomingBooking = table.reservations.find(res =>
                res.startTime >= comparisonTime && res.startTime <= soonLimit
            )

            let status: TableStatus = 'free'
            if (currentBooking) {
                status = 'busy'
            } else if (upcomingBooking) {
                status = 'reserved'
            }

            return { ...table, status }
        })
    }))
})