import { authenticatePublicRequest } from '~~/server/utils/publicApi'

export default defineEventHandler(async (event) => {
    const auth = await authenticatePublicRequest(event)
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

    const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: {
            table: { include: { zone: { select: { restaurantId: true, name: true } } } },
            guest: { select: { name: true, phone: true } }
        }
    })

    if (!reservation || reservation.deletedAt) {
        throw createError({ statusCode: 404, statusMessage: 'Бронь не найдена' })
    }
    if (reservation.table.zone.restaurantId !== auth.restaurantId) {
        throw createError({ statusCode: 403, statusMessage: 'Бронь не принадлежит вашему ресторану' })
    }

    return {
        id: reservation.id,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        peopleCount: reservation.peopleCount,
        status: reservation.status,
        comment: reservation.comment,
        guest: reservation.guest,
        table: { id: reservation.tableId, name: reservation.table.name, zoneName: reservation.table.zone.name }
    }
})
