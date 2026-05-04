import { authenticatePublicRequest } from '~~/server/utils/publicApi'

export default defineEventHandler(async (event) => {
    const auth = await authenticatePublicRequest(event)
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

    const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: { table: { include: { zone: { select: { restaurantId: true } } } } }
    })

    if (!reservation || reservation.deletedAt) {
        throw createError({ statusCode: 404, statusMessage: 'Бронь не найдена' })
    }
    if (reservation.table.zone.restaurantId !== auth.restaurantId) {
        throw createError({ statusCode: 403, statusMessage: 'Бронь не принадлежит вашему ресторану' })
    }
    if (reservation.status === 'cancelled' || reservation.status === 'finished') {
        throw createError({ statusCode: 400, statusMessage: 'Бронь уже завершена' })
    }

    const updated = await prisma.reservation.update({
        where: { id },
        data: { status: 'cancelled', updatedBy: `api:${auth.apiKeyId.slice(0, 8)}` }
    })

    return { id: updated.id, status: updated.status }
})
