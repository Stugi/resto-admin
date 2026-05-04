export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

    const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        select: { id: true, allowedOrigins: true }
    })
    if (!restaurant) throw createError({ statusCode: 404, statusMessage: 'Ресторан не найден' })

    const keys = await prisma.apiKey.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            prefix: true,
            scope: true,
            lastUsedAt: true,
            revokedAt: true,
            createdAt: true
        }
    })

    return { keys, allowedOrigins: restaurant.allowedOrigins }
})
