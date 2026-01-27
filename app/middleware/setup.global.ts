import type { UserWithRestaurants } from '~~/types'

export default defineNuxtRouteMiddleware(async (to) => {
    // Проверяем: либо мы на корне, либо страница требует контекста, но слаг в URL отсутствует
    const needsContext = to.path === '/' || (to.meta.requiresRestaurantContext && !to.params.slug)

    if (needsContext) {
        const user = await $fetch<UserWithRestaurants>('/api/me')
        if (user?.restaurants?.length) {
            return navigateTo(`/dashboard/${user.restaurants[0]?.slug}`)
        }
    }
})