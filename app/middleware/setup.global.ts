import type { UserWithRestaurants } from '~~/types'

export default defineNuxtRouteMiddleware(async (to) => {
    const REDIRECT_ENTRY_POINTS = ['/', '/dashboard', '/dashboard/']

    if (REDIRECT_ENTRY_POINTS.includes(to.path)) {
        try {
            const user = await $fetch<UserWithRestaurants>('/api/me')

            if (user?.restaurants[0]) {
                const firstSlug = user.restaurants[0].slug
                return navigateTo(`/dashboard/${firstSlug}`)
            } else {
                throw createError({ statusCode: 403, statusMessage: 'Нет доступа к ресторанам' })
            }
        } catch (error) {
            console.error('Initial context error:', error)
            // Здесь можно добавить редирект на логин, если сессия протухла
        }
    }
})