import { PrismaClient } from '@prisma/client'
import { addDays, setHours, setMinutes } from 'date-fns'

const prisma = new PrismaClient()

// Хелпер для создания времени
function createTime(date: Date, hours: number, minutes: number = 0): Date {
    return setMinutes(setHours(date, hours), minutes)
}

async function main() {
    console.log('🌱 Начинаем заполнение базы данных...')

    // 1. Очистка старых данных (чтобы не было дублей при повторном запуске)
    await prisma.reservation.deleteMany()
    await prisma.guest.deleteMany()
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
    const zone2 = await prisma.zone.create({
        data: { name: '2 этаж', restaurantId: restaurant.id }
    })
    const zoneTerrace = await prisma.zone.create({
        data: { name: 'Терраса', restaurantId: restaurant.id }
    })

    // 6. Создаем столы для всех зон

    // Основной зал (18 столов)
    const mainTablesData = [
        { name: '1', cap: 2 }, { name: '2', cap: 2 }, { name: '3', cap: 4 },
        { name: '4', cap: 4 }, { name: '5', cap: 4 }, { name: '6', cap: 4 },
        { name: '7', cap: 2 }, { name: '8', cap: 6 }, { name: '9', cap: 6 },
        { name: '10', cap: 4 }, { name: '11', cap: 4 }, { name: '12', cap: 2 },
        { name: '13', cap: 8 }, { name: '14', cap: 4 }, { name: '15', cap: 2 },
        { name: '16', cap: 2 }, { name: '17', cap: 2 }, { name: '18', cap: 4 },
    ]

    // 2 этаж (8 столов) — VIP зона
    const floor2TablesData = [
        { name: 'VIP-1', cap: 6 }, { name: 'VIP-2', cap: 6 },
        { name: 'VIP-3', cap: 8 }, { name: 'VIP-4', cap: 8 },
        { name: '21', cap: 4 }, { name: '22', cap: 4 },
        { name: '23', cap: 2 }, { name: '24', cap: 2 },
    ]

    // Терраса (6 столов)
    const terraceTablesData = [
        { name: 'Т-1', cap: 2 }, { name: 'Т-2', cap: 2 },
        { name: 'Т-3', cap: 4 }, { name: 'Т-4', cap: 4 },
        { name: 'Т-5', cap: 6 }, { name: 'Т-6', cap: 6 },
    ]

    const tables: { id: string; name: string; capacity: number }[] = []

    // Создаём столы для основного зала
    for (const t of mainTablesData) {
        const table = await prisma.table.create({
            data: {
                name: t.name,
                capacity: t.cap,
                zoneId: zoneMain.id,
                createdBy: user.login
            }
        })
        tables.push(table)
    }

    // Создаём столы для 2 этажа
    for (const t of floor2TablesData) {
        await prisma.table.create({
            data: {
                name: t.name,
                capacity: t.cap,
                zoneId: zone2.id,
                createdBy: user.login
            }
        })
    }

    // Создаём столы для террасы
    for (const t of terraceTablesData) {
        await prisma.table.create({
            data: {
                name: t.name,
                capacity: t.cap,
                zoneId: zoneTerrace.id,
                createdBy: user.login
            }
        })
    }

    const totalTables = mainTablesData.length + floor2TablesData.length + terraceTablesData.length
    console.log(`📋 Создано ${totalTables} столов (${mainTablesData.length} осн. + ${floor2TablesData.length} 2эт. + ${terraceTablesData.length} терр.)`)

    // 7. Создаем гостей
    const guestsData = [
        { phone: '+79991234567', name: 'Сидоров Константин' },
        { phone: '+79992345678', name: 'Козлова Мария' },
        { phone: '+79993456789', name: 'Новиков Дмитрий' },
        { phone: '+79994567890', name: 'Смирнов Алексей' },
        { phone: '+79995678901', name: 'Белов Иван' },
        { phone: '+79996789012', name: 'Кузнецов Павел' },
        { phone: '+79997890123', name: 'Иванов Петр (VIP)' },
        { phone: '+79998901234', name: 'Морозов Виктор' },
        { phone: '+79999012345', name: 'Волкова Елена' },
        { phone: '+79990123456', name: 'Петрова Анна' },
        { phone: '+79991111111', name: 'Федоров Сергей' },
        { phone: '+79992222222', name: 'Орлова Наталья' },
    ]

    const guests: { id: string; name: string }[] = []
    for (const g of guestsData) {
        const guest = await prisma.guest.create({ data: g })
        guests.push(guest)
    }

    console.log(`👥 Создано ${guests.length} гостей`)

    // 8. Создаем бронирования на сегодня
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Также на завтра и послезавтра
    const tomorrow = addDays(today, 1)
    const dayAfter = addDays(today, 2)

    const reservationsData = [
        // СЕГОДНЯ - утро/день
        { tableIdx: 0, guestIdx: 0, start: 12, end: 14, people: 2, status: 'confirmed', date: today },
        { tableIdx: 2, guestIdx: 1, start: 13, end: 15, people: 3, status: 'confirmed', date: today },

        // СЕГОДНЯ - обед
        { tableIdx: 4, guestIdx: 2, start: 14, end: 16, people: 4, status: 'confirmed', date: today },
        { tableIdx: 6, guestIdx: 3, start: 15, end: 17, people: 2, status: 'confirmed', date: today },

        // СЕГОДНЯ - вечер (пиковое время 18-21)
        { tableIdx: 1, guestIdx: 4, start: 18, end: 20, people: 2, status: 'seated', date: today },
        { tableIdx: 3, guestIdx: 5, start: 18, end: 20, people: 4, status: 'seated', date: today },
        { tableIdx: 5, guestIdx: 6, start: 19, end: 21, people: 4, status: 'confirmed', date: today },
        { tableIdx: 7, guestIdx: 7, start: 19, end: 22, people: 5, status: 'confirmed', date: today },
        { tableIdx: 8, guestIdx: 8, start: 18, end: 20, people: 6, status: 'seated', date: today },
        { tableIdx: 9, guestIdx: 9, start: 19, end: 21, people: 4, status: 'seated', date: today },
        { tableIdx: 12, guestIdx: 6, start: 19, end: 22, people: 6, status: 'seated', date: today }, // VIP стол 13
        { tableIdx: 14, guestIdx: 10, start: 19, end: 21, people: 2, status: 'seated', date: today },
        { tableIdx: 17, guestIdx: 11, start: 20, end: 22, people: 3, status: 'confirmed', date: today },

        // СЕГОДНЯ - поздний вечер
        { tableIdx: 10, guestIdx: 0, start: 20, end: 22, people: 4, status: 'confirmed', date: today },
        { tableIdx: 11, guestIdx: 1, start: 21, end: 23, people: 2, status: 'confirmed', date: today },
        { tableIdx: 13, guestIdx: 2, start: 21, end: 23, people: 4, status: 'confirmed', date: today },

        // ЗАВТРА
        { tableIdx: 0, guestIdx: 3, start: 13, end: 15, people: 2, status: 'confirmed', date: tomorrow },
        { tableIdx: 4, guestIdx: 4, start: 19, end: 21, people: 4, status: 'confirmed', date: tomorrow },
        { tableIdx: 7, guestIdx: 5, start: 19, end: 22, people: 6, status: 'confirmed', date: tomorrow },
        { tableIdx: 12, guestIdx: 6, start: 20, end: 23, people: 8, status: 'confirmed', date: tomorrow },
        { tableIdx: 1, guestIdx: 7, start: 18, end: 20, people: 2, status: 'confirmed', date: tomorrow },
        { tableIdx: 9, guestIdx: 8, start: 19, end: 21, people: 4, status: 'confirmed', date: tomorrow },

        // ПОСЛЕЗАВТРА
        { tableIdx: 2, guestIdx: 9, start: 14, end: 16, people: 3, status: 'confirmed', date: dayAfter },
        { tableIdx: 5, guestIdx: 10, start: 19, end: 21, people: 4, status: 'confirmed', date: dayAfter },
        { tableIdx: 8, guestIdx: 11, start: 20, end: 22, people: 5, status: 'confirmed', date: dayAfter },
    ]

    let reservationCount = 0
    for (const r of reservationsData) {
        const table = tables[r.tableIdx]
        const guest = guests[r.guestIdx]

        if (!table || !guest) continue

        await prisma.reservation.create({
            data: {
                tableId: table.id,
                guestId: guest.id,
                startTime: createTime(r.date, r.start),
                endTime: createTime(r.date, r.end),
                peopleCount: r.people,
                status: r.status,
                createdBy: user.login
            }
        })
        reservationCount++
    }

    console.log(`📅 Создано ${reservationCount} бронирований`)
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