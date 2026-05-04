import type { ZoneWithTables } from '~~/types'
import { z } from 'zod'
import { getZonesWithStatuses } from '~~/server/services/availability'

const querySchema = z.object({
    date: z.iso.date().optional(),
    restaurantSlug: z.string().min(1, 'restaurantSlug is required'),
    viewTime: z.string().regex(/^\d{2}:\d{2}$/, 'viewTime must be HH:mm').optional()
})

export default defineEventHandler(async (event): Promise<ZoneWithTables[]> => {
    const { date, restaurantSlug, viewTime } = await getValidatedQuery(event, querySchema.parse)

    const targetDate = date ? new Date(date) : new Date()
    const comparisonTime = parseViewTime(targetDate, viewTime)

    return getZonesWithStatuses(restaurantSlug, targetDate, comparisonTime)
})
