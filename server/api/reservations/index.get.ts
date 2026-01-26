// server/api/reservations/index.get.ts
export default defineEventHandler(async (event) => {
    // 1. Получаем текущую дату и вычисляем границы "сегодня"
    const now = new Date()

    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    try {
        // 2. Запрашиваем бронирования с подтягиванием связанных данных
        const reservations = await prisma.reservation.findMany({
            where: {
                deletedAt: null, // Только не удаленные
                // Фильтр: брони, которые начинаются сегодня
                startTime: {
                    gte: startOfToday,
                    lte: endOfToday
                }
            },
            include: {
                // Подтягиваем данные гостя (имя, телефон)
                guest: true,
                // Подтягиваем данные стола (номер, вместимость)
                table: true
            },
            orderBy: {
                startTime: 'asc' // Сортируем: ближайшие по времени сверху
            }
        })

        return reservations
    } catch (error) {
        console.error('Ошибка API Reservations:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Не удалось загрузить список бронирований'
        })
    }
})