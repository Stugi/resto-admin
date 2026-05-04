import { z } from 'zod'
import { authenticatePublicRequest } from '~~/server/utils/publicApi'
import { getAvailability } from '~~/server/services/availability'

const querySchema = z.object({
    date: z.iso.date(),
    peopleCount: z.coerce.number().int().min(1).max(20),
    zoneId: z.string().uuid().optional()
})

export default defineEventHandler(async (event) => {
    const auth = await authenticatePublicRequest(event)
    const { date, peopleCount, zoneId } = await getValidatedQuery(event, querySchema.parse)

    const slots = await getAvailability(auth.restaurantId, date, peopleCount, zoneId)
    return { date, peopleCount, slots }
})
