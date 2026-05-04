export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    const id = getRouterParam(event, 'id')
    if (!slug || !id) throw createError({ statusCode: 400, statusMessage: 'slug and id required' })

    const apiKey = await prisma.apiKey.findUnique({
        where: { id },
        include: { restaurant: { select: { slug: true } } }
    })

    if (!apiKey || apiKey.restaurant.slug !== slug) {
        throw createError({ statusCode: 404, statusMessage: 'Ключ не найден' })
    }

    if (apiKey.revokedAt) {
        return { id, revoked: true }
    }

    await prisma.apiKey.update({
        where: { id },
        data: { revokedAt: new Date() }
    })

    return { id, revoked: true }
})
