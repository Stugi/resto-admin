export default defineNuxtRouteMiddleware((to, from) => {
    if (import.meta.server) {
        console.log(`[SSR] Navigating to: ${to.path}`)
    } else {
        console.log(`[Client] Navigating to: ${to.path}`)
    }
})