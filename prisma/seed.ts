import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Начинаем заполнение базы данных...')

    // 1. Очистка старых данных (чтобы не было дублей при повторном запуске)
    await prisma.reservation.deleteMany()
    await prisma.table.deleteMany()
    await prisma.zone.deleteMany()
    await prisma.schedule.deleteMany()
    await prisma.restaurant.deleteMany()
    await prisma.user.deleteMany()

    // 2. Создаем пользователя (Хостес из твоего макета)
    const user = await prisma.user.create({
        data: {
            login: 'anna_n',
            name: 'Анна',
            secondname: 'Новикова',
        }
    })

    // 3. Создаем ресторан
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'RestoAdmin Demo',
            slug: 'main-restaurant',
            description: 'Умная система управления бронированием',
        }
    })

    // 4. График работы (JSONB)
    await prisma.schedule.create({
        data: {
            restaurantId: restaurant.id,
            workingHours: {
                mon: { open: true, start: '10:00', end: '23:00' },
                tue: { open: true, start: '10:00', end: '23:00' },
                wed: { open: true, start: '10:00', end: '23:00' },
                thu: { open: true, start: '10:00', end: '23:00' },
                fri: { open: true, start: '10:00', end: '01:00' },
                sat: { open: true, start: '10:00', end: '01:00' },
                sun: { open: true, start: '10:00', end: '22:00' },
            }
        }
    })

    // 5. Создаем зоны как на табах в макете
    const zoneMain = await prisma.zone.create({
        data: { name: 'Основной зал', restaurantId: restaurant.id }
    })
    await prisma.zone.create({
        data: { name: '2 этаж', restaurantId: restaurant.id }
    })
    await prisma.zone.create({
        data: { name: 'Терраса', restaurantId: restaurant.id }
    })

    // 6. Создаем столы для Основного зала (согласно макету)
    // На макете видны номера и вместимость (capacity)
    const tables = [
        { name: '1', cap: 2 }, { name: '2', cap: 2 }, { name: '3', cap: 4 },
        { name: '4', cap: 4 }, { name: '5', cap: 4 }, { name: '6', cap: 4 },
        { name: '7', cap: 2 }, { name: '8', cap: 6 }, { name: '9', cap: 6 },
        { name: '10', cap: 4 }, { name: '11', cap: 4 }, { name: '12', cap: 2 },
        { name: '13', cap: 8 }, { name: '14', cap: 4 }, { name: '15', cap: 2 },
        { name: '16', cap: 2 }, { name: '17', cap: 2 }, { name: '18', cap: 4 },
    ]

    for (const t of tables) {
        await prisma.table.create({
            data: {
                name: t.name,
                capacity: t.cap,
                zoneId: zoneMain.id,
                createdBy: user.id
            }
        })
    }

    console.log('✅ База успешно наполнена!')
}

main()
    .catch((e) => {
        console.error('❌ Ошибка при заполнении:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })