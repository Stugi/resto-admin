export default defineNuxtRouteMiddleware((to, from) => {
    // Имитируем проверку роли (в будущем возьмем из useAuth)
    const userRole = 'waiter' // Допустим, у нас зашел официант

    if (userRole !== 'manager') {
        // 1. Мы можем прервать навигацию с ошибкой
        // return abortNavigation('У вас нет прав для доступа в админ-панель')

        // 2. Или мягко отправить на главную дашборда
        return navigateTo('/')
    }
})