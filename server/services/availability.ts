import { startOfDay, endOfDay, addHours, addMinutes } from 'date-fns'
import { BOOKING_DURATION_MS, generateTimeSlots } from '~~/app/constants/workingHours'
import type { ZoneWithTables, TableStatus } from '~~/types'

/**
 * Зоны со столами и статусами для админки — переиспользуется в /api/zones и публичном API.
 */
export async function getZonesWithStatuses(
    restaurantSlug: string,
    targetDate: Date,
    comparisonTime: Date
): Promise<ZoneWithTables[]> {
    const start = startOfDay(targetDate)
    const end = endOfDay(targetDate)

    const soonLimit = addHours(comparisonTime, 2)
    const soonThreshold = addMinutes(comparisonTime, 30)

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
                        orderBy: { startTime: 'asc' },
                        include: { guest: true }
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
                status = currentBooking.endTime <= soonThreshold ? 'soon' : 'busy'
            } else if (upcomingBooking) {
                status = 'reserved'
            }

            return { ...table, status }
        })
    })) as unknown as ZoneWithTables[]
}

export interface AvailableSlot {
    time: string // HH:mm
    availableTables: { id: string; name: string; capacity: number; zoneId: string; zoneName: string }[]
}

/**
 * Доступные слоты для бронирования на дату.
 * Для каждого временного слота возвращает столы, которые подходят по вместимости и не заняты.
 */
export async function getAvailability(
    restaurantId: string,
    date: string, // YYYY-MM-DD
    peopleCount: number,
    zoneId?: string
): Promise<AvailableSlot[]> {
    const dayStart = new Date(date + 'T00:00:00')
    const start = startOfDay(dayStart)
    const end = endOfDay(dayStart)

    const tables = await prisma.table.findMany({
        where: {
            deletedAt: null,
            capacity: { gte: peopleCount },
            zone: {
                restaurantId,
                deletedAt: null,
                ...(zoneId ? { id: zoneId } : {})
            }
        },
        include: {
            zone: { select: { id: true, name: true } },
            reservations: {
                where: {
                    deletedAt: null,
                    status: { in: ['confirmed', 'seated'] },
                    startTime: { gte: start, lte: end }
                }
            }
        }
    })

    const slots = generateTimeSlots()

    return slots.map(time => {
        const [h, m] = time.split(':').map(Number)
        const slotStart = new Date(dayStart)
        slotStart.setHours(h!, m!, 0, 0)
        const slotEnd = new Date(slotStart.getTime() + BOOKING_DURATION_MS)

        const availableTables = tables
            .filter(table => {
                const conflict = table.reservations.some(res =>
                    res.startTime < slotEnd && res.endTime > slotStart
                )
                return !conflict
            })
            .map(t => ({
                id: t.id,
                name: t.name,
                capacity: t.capacity,
                zoneId: t.zone.id,
                zoneName: t.zone.name
            }))

        return { time, availableTables }
    }).filter(s => s.availableTables.length > 0)
}
