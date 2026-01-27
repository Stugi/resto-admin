import { UserWithRestaurants } from '~~/types'

export default defineEventHandler(async (event): Promise<UserWithRestaurants> => {
    const user = await prisma.user.findFirst({
        where: { login: 'anna_n' }
    })

    if (!user) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const restaurants = await prisma.restaurant.findMany({
        select: { slug: true, name: true },
        where: { deletedAt: null }
    })

    return {
        ...user,
        restaurants
    }
})