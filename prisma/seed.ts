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

    // 5. Создаем зоны с декоративными элементами

    // Декор для основного зала
    const mainZoneElements = [
        { id: 'kitchen-1', type: 'kitchen', label: 'Кухня', posX: 8, posY: 8, width: 100, height: 60 },
        { id: 'bar-1', type: 'bar', label: 'Бар', posX: 92, posY: 8, width: 120, height: 50 },
        { id: 'entrance-1', type: 'entrance', label: 'Вход', posX: 50, posY: 95 },
        { id: 'hostess-1', type: 'hostess', label: 'Хостес', posX: 50, posY: 88 },
        { id: 'plant-1', type: 'plants', posX: 5, posY: 50 },
        { id: 'plant-2', type: 'plants', posX: 95, posY: 50 },
        { id: 'window-1', type: 'window', posX: 5, posY: 70, width: 80, height: 10 },
        { id: 'window-2', type: 'window', posX: 95, posY: 70, width: 80, height: 10 },
        { id: 'toilet-1', type: 'toilet', label: 'WC', posX: 92, posY: 92 },
    ]

    // Декор для 2 этажа
    const floor2Elements = [
        { id: 'vip-zone-1', type: 'vip_zone', label: 'VIP', posX: 30, posY: 35, width: 200, height: 150 },
        { id: 'plant-3', type: 'plants', posX: 5, posY: 15 },
        { id: 'plant-4', type: 'plants', posX: 95, posY: 15 },
        { id: 'window-3', type: 'window', posX: 50, posY: 5, width: 200, height: 12 },
        { id: 'toilet-2', type: 'toilet', label: 'WC', posX: 92, posY: 92 },
    ]

    // Декор для террасы
    const terraceElements = [
        { id: 'entrance-t', type: 'entrance', label: 'Выход', posX: 50, posY: 5 },
        { id: 'plant-t1', type: 'plants', posX: 10, posY: 50 },
        { id: 'plant-t2', type: 'plants', posX: 90, posY: 50 },
        { id: 'plant-t3', type: 'plants', posX: 30, posY: 90 },
        { id: 'plant-t4', type: 'plants', posX: 70, posY: 90 },
    ]

    const zoneMain = await prisma.zone.create({
        data: {
            name: 'Основной зал',
            restaurantId: restaurant.id,
            elements: mainZoneElements
        }
    })
    const zone2 = await prisma.zone.create({
        data: {
            name: '2 этаж',
            restaurantId: restaurant.id,
            elements: floor2Elements
        }
    })
    const zoneTerrace = await prisma.zone.create({
        data: {
            name: 'Терраса',
            restaurantId: restaurant.id,
            elements: terraceElements
        }
    })

    // 6. Создаем столы для всех зон

    // Основной зал (18 столов) — с позициями на схеме (15-85% чтобы не обрезались)
    const mainTablesData = [
        // Ряд 1 (верх)
        { name: '1', cap: 2, posX: 15, posY: 15 },
        { name: '2', cap: 2, posX: 30, posY: 15 },
        { name: '3', cap: 4, posX: 45, posY: 15 },
        { name: '4', cap: 4, posX: 60, posY: 15 },
        { name: '5', cap: 4, posX: 75, posY: 15 },
        { name: '6', cap: 4, posX: 88, posY: 15 },
        // Ряд 2 (центр-верх)
        { name: '7', cap: 2, posX: 15, posY: 38 },
        { name: '8', cap: 6, posX: 35, posY: 38 },
        { name: '9', cap: 6, posX: 60, posY: 38 },
        { name: '10', cap: 4, posX: 82, posY: 38 },
        // Ряд 3 (центр-низ)
        { name: '11', cap: 4, posX: 15, posY: 60 },
        { name: '12', cap: 2, posX: 30, posY: 60 },
        { name: '13', cap: 8, posX: 50, posY: 60 }, // Большой стол
        { name: '14', cap: 4, posX: 75, posY: 60 },
        // Ряд 4 (низ)
        { name: '15', cap: 2, posX: 20, posY: 82 },
        { name: '16', cap: 2, posX: 38, posY: 82 },
        { name: '17', cap: 2, posX: 55, posY: 82 },
        { name: '18', cap: 4, posX: 72, posY: 82 },
    ]

    // 2 этаж (8 столов) — VIP зона
    const floor2TablesData = [
        { name: 'VIP-1', cap: 6, posX: 15, posY: 20 },
        { name: 'VIP-2', cap: 6, posX: 45, posY: 20 },
        { name: 'VIP-3', cap: 8, posX: 75, posY: 20 },
        { name: 'VIP-4', cap: 8, posX: 45, posY: 55 },
        { name: '21', cap: 4, posX: 15, posY: 75 },
        { name: '22', cap: 4, posX: 35, posY: 75 },
        { name: '23', cap: 2, posX: 55, posY: 75 },
        { name: '24', cap: 2, posX: 75, posY: 75 },
    ]

    // Терраса (6 столов)
    const terraceTablesData = [
        { name: 'Т-1', cap: 2, posX: 10, posY: 25 },
        { name: 'Т-2', cap: 2, posX: 30, posY: 25 },
        { name: 'Т-3', cap: 4, posX: 50, posY: 25 },
        { name: 'Т-4', cap: 4, posX: 70, posY: 25 },
        { name: 'Т-5', cap: 6, posX: 25, posY: 65 },
        { name: 'Т-6', cap: 6, posX: 55, posY: 65 },
    ]

    const tables: { id: string; name: string; capacity: number }[] = []

    // Создаём столы для основного зала
    for (const t of mainTablesData) {
        const table = await prisma.table.create({
            data: {
                name: t.name,
                capacity: t.cap,
                zoneId: zoneMain.id,
                posX: t.posX,
                posY: t.posY,
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
                posX: t.posX,
                posY: t.posY,
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
                posX: t.posX,
                posY: t.posY,
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
        // ═══════════ СЕГОДНЯ ═══════════

        // 12:00–14:00 — лёгкий обед (3 стола → low)
        { tableIdx: 0, guestIdx: 0, start: 12, end: 14, people: 2, status: 'confirmed', date: today },
        { tableIdx: 1, guestIdx: 1, start: 12, end: 14, people: 2, status: 'confirmed', date: today },
        { tableIdx: 2, guestIdx: 2, start: 12, end: 13.5, people: 3, status: 'confirmed', date: today },

        // 13:00–15:00 — обед набирает (5 столов → medium)
        { tableIdx: 3, guestIdx: 3, start: 13, end: 15, people: 4, status: 'confirmed', date: today },
        { tableIdx: 4, guestIdx: 4, start: 13, end: 15, people: 4, status: 'confirmed', date: today },
        { tableIdx: 5, guestIdx: 5, start: 13, end: 14.5, people: 3, status: 'confirmed', date: today },

        // 14:00–16:00 — обеденный пик (7 столов → medium/high)
        { tableIdx: 6, guestIdx: 6, start: 14, end: 16, people: 2, status: 'confirmed', date: today },
        { tableIdx: 7, guestIdx: 7, start: 14, end: 16, people: 5, status: 'confirmed', date: today },
        { tableIdx: 8, guestIdx: 8, start: 14, end: 15.5, people: 6, status: 'confirmed', date: today },
        { tableIdx: 9, guestIdx: 9, start: 14.5, end: 16, people: 4, status: 'confirmed', date: today },

        // 15:00–17:00 — спад после обеда (4 стола → low/medium)
        { tableIdx: 10, guestIdx: 10, start: 15, end: 17, people: 3, status: 'confirmed', date: today },
        { tableIdx: 11, guestIdx: 11, start: 15.5, end: 17, people: 2, status: 'confirmed', date: today },

        // 16:00–18:00 — затишье (2 стола → low)
        { tableIdx: 12, guestIdx: 0, start: 16, end: 18, people: 4, status: 'confirmed', date: today },
        { tableIdx: 13, guestIdx: 1, start: 16.5, end: 18, people: 3, status: 'confirmed', date: today },

        // 17:00–19:00 — начало вечера (4 стола → medium)
        { tableIdx: 14, guestIdx: 2, start: 17, end: 19, people: 2, status: 'confirmed', date: today },
        { tableIdx: 15, guestIdx: 3, start: 17, end: 19, people: 2, status: 'confirmed', date: today },
        { tableIdx: 0, guestIdx: 4, start: 17.5, end: 19.5, people: 2, status: 'confirmed', date: today },
        { tableIdx: 1, guestIdx: 5, start: 17.5, end: 19, people: 2, status: 'confirmed', date: today },

        // 18:00–20:00 — вечерний разгон (8 столов → high)
        { tableIdx: 2, guestIdx: 6, start: 18, end: 20, people: 3, status: 'seated', date: today },
        { tableIdx: 3, guestIdx: 7, start: 18, end: 20, people: 4, status: 'seated', date: today },
        { tableIdx: 4, guestIdx: 8, start: 18, end: 20.5, people: 4, status: 'seated', date: today },
        { tableIdx: 5, guestIdx: 9, start: 18, end: 20, people: 3, status: 'seated', date: today },
        { tableIdx: 6, guestIdx: 10, start: 18, end: 19.5, people: 2, status: 'seated', date: today },
        { tableIdx: 7, guestIdx: 11, start: 18, end: 20, people: 5, status: 'seated', date: today },
        { tableIdx: 16, guestIdx: 0, start: 18, end: 20, people: 2, status: 'confirmed', date: today },
        { tableIdx: 17, guestIdx: 1, start: 18, end: 20.5, people: 4, status: 'confirmed', date: today },

        // 19:00–21:00 — ПИК вечера (12 столов → peak!)
        { tableIdx: 8, guestIdx: 2, start: 19, end: 21, people: 6, status: 'seated', date: today },
        { tableIdx: 9, guestIdx: 3, start: 19, end: 21, people: 4, status: 'seated', date: today },
        { tableIdx: 10, guestIdx: 4, start: 19, end: 21, people: 4, status: 'seated', date: today },
        { tableIdx: 11, guestIdx: 5, start: 19, end: 21.5, people: 2, status: 'seated', date: today },
        { tableIdx: 12, guestIdx: 6, start: 19, end: 22, people: 6, status: 'seated', date: today },
        { tableIdx: 13, guestIdx: 7, start: 19, end: 21, people: 4, status: 'confirmed', date: today },
        { tableIdx: 14, guestIdx: 8, start: 19, end: 21, people: 2, status: 'confirmed', date: today },
        { tableIdx: 15, guestIdx: 9, start: 19.5, end: 21.5, people: 2, status: 'confirmed', date: today },

        // 20:00–22:00 — ещё пик (7 столов → high)
        { tableIdx: 0, guestIdx: 10, start: 20, end: 22, people: 2, status: 'confirmed', date: today },
        { tableIdx: 1, guestIdx: 11, start: 20, end: 22, people: 2, status: 'confirmed', date: today },
        { tableIdx: 2, guestIdx: 0, start: 20.5, end: 22.5, people: 3, status: 'confirmed', date: today },
        { tableIdx: 3, guestIdx: 1, start: 20, end: 22, people: 4, status: 'confirmed', date: today },
        { tableIdx: 16, guestIdx: 2, start: 20.5, end: 22, people: 2, status: 'confirmed', date: today },
        { tableIdx: 17, guestIdx: 3, start: 20, end: 22, people: 3, status: 'confirmed', date: today },

        // 21:00–23:00 — поздний вечер (5 столов → medium)
        { tableIdx: 4, guestIdx: 4, start: 21, end: 23, people: 4, status: 'confirmed', date: today },
        { tableIdx: 5, guestIdx: 5, start: 21, end: 23, people: 3, status: 'confirmed', date: today },
        { tableIdx: 6, guestIdx: 6, start: 21.5, end: 23, people: 2, status: 'confirmed', date: today },
        { tableIdx: 7, guestIdx: 7, start: 21, end: 23, people: 5, status: 'confirmed', date: today },

        // 22:00–00:00 — спад (3 стола → low)
        { tableIdx: 8, guestIdx: 8, start: 22, end: 23.5, people: 4, status: 'confirmed', date: today },
        { tableIdx: 9, guestIdx: 9, start: 22, end: 23.5, people: 3, status: 'confirmed', date: today },
        { tableIdx: 10, guestIdx: 10, start: 22.5, end: 23.5, people: 2, status: 'confirmed', date: today },

        // ═══════════ ЗАВТРА ═══════════
        { tableIdx: 0, guestIdx: 3, start: 13, end: 15, people: 2, status: 'confirmed', date: tomorrow },
        { tableIdx: 1, guestIdx: 4, start: 13, end: 15, people: 2, status: 'confirmed', date: tomorrow },
        { tableIdx: 4, guestIdx: 4, start: 19, end: 21, people: 4, status: 'confirmed', date: tomorrow },
        { tableIdx: 7, guestIdx: 5, start: 19, end: 22, people: 6, status: 'confirmed', date: tomorrow },
        { tableIdx: 12, guestIdx: 6, start: 20, end: 23, people: 8, status: 'confirmed', date: tomorrow },
        { tableIdx: 1, guestIdx: 7, start: 18, end: 20, people: 2, status: 'confirmed', date: tomorrow },
        { tableIdx: 9, guestIdx: 8, start: 19, end: 21, people: 4, status: 'confirmed', date: tomorrow },
        { tableIdx: 3, guestIdx: 9, start: 18, end: 20, people: 4, status: 'confirmed', date: tomorrow },
        { tableIdx: 5, guestIdx: 10, start: 18, end: 20, people: 3, status: 'confirmed', date: tomorrow },
        { tableIdx: 6, guestIdx: 11, start: 19, end: 21, people: 2, status: 'confirmed', date: tomorrow },
        { tableIdx: 8, guestIdx: 0, start: 19, end: 21, people: 6, status: 'confirmed', date: tomorrow },
        { tableIdx: 10, guestIdx: 1, start: 20, end: 22, people: 4, status: 'confirmed', date: tomorrow },
        { tableIdx: 11, guestIdx: 2, start: 20, end: 22, people: 2, status: 'confirmed', date: tomorrow },
        { tableIdx: 13, guestIdx: 3, start: 21, end: 23, people: 4, status: 'confirmed', date: tomorrow },

        // ═══════════ ПОСЛЕЗАВТРА ═══════════
        { tableIdx: 2, guestIdx: 9, start: 14, end: 16, people: 3, status: 'confirmed', date: dayAfter },
        { tableIdx: 5, guestIdx: 10, start: 19, end: 21, people: 4, status: 'confirmed', date: dayAfter },
        { tableIdx: 8, guestIdx: 11, start: 20, end: 22, people: 5, status: 'confirmed', date: dayAfter },
        { tableIdx: 0, guestIdx: 0, start: 18, end: 20, people: 2, status: 'confirmed', date: dayAfter },
        { tableIdx: 3, guestIdx: 1, start: 19, end: 21, people: 4, status: 'confirmed', date: dayAfter },
        { tableIdx: 7, guestIdx: 2, start: 19, end: 22, people: 5, status: 'confirmed', date: dayAfter },
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