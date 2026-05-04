import { BOOKING_DURATION_MS } from '~~/app/constants/workingHours'
import type { Reservation } from '@prisma/client'

export interface CreateReservationInput {
    tableId: string
    date?: string // YYYY-MM-DD
    guestName: string
    guestPhone: string
    startTime: string // HH:mm
    peopleCount: number
    comment?: string
    createdBy?: string
}

export class ReservationError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message)
    }
}

/**
 * Создание брони — единая точка для admin API и public API.
 * Бросает ReservationError с подходящим statusCode при бизнес-ошибках.
 */
export async function createReservation(input: CreateReservationInput): Promise<Reservation> {
    const { tableId, date, guestName, guestPhone, startTime, peopleCount, comment, createdBy } = input

    const startDateTime = date ? new Date(date + 'T00:00:00') : new Date()
    const [hours, minutes] = startTime.split(':')
    startDateTime.setHours(parseInt(hours!), parseInt(minutes!), 0, 0)

    const endDateTime = new Date(startDateTime.getTime() + BOOKING_DURATION_MS)

    // Проверка стола и его принадлежности к удалённой зоне/ресторану
    const table = await prisma.table.findUnique({
        where: { id: tableId },
        include: { zone: true }
    })
    if (!table || table.deletedAt) {
        throw new ReservationError(404, 'Стол не найден')
    }
    if (peopleCount > table.capacity) {
        throw new ReservationError(400, `Максимум ${table.capacity} гостей за этот стол`)
    }

    // Конфликт броней: (StartA < EndB) AND (EndA > StartB)
    const existingReservation = await prisma.reservation.findFirst({
        where: {
            tableId,
            deletedAt: null,
            status: { in: ['confirmed', 'seated'] },
            AND: [
                { startTime: { lt: endDateTime } },
                { endTime: { gt: startDateTime } }
            ]
        }
    })
    if (existingReservation) {
        throw new ReservationError(409, 'Стол уже забронирован на это время')
    }

    const guest = await prisma.guest.upsert({
        where: { phone: guestPhone },
        update: { name: guestName },
        create: { phone: guestPhone, name: guestName }
    })

    return prisma.reservation.create({
        data: {
            tableId,
            guestId: guest.id,
            startTime: startDateTime,
            endTime: endDateTime,
            peopleCount,
            status: 'confirmed',
            comment: comment || null,
            createdBy: createdBy || null,
        }
    })
}

/**
 * Проверка что стол принадлежит ресторану — для public API нужно убедиться,
 * что владелец API-ключа создаёт бронь только в своих столах.
 */
export async function tableBelongsToRestaurant(tableId: string, restaurantId: string): Promise<boolean> {
    const table = await prisma.table.findUnique({
        where: { id: tableId },
        include: { zone: true }
    })
    return !!table && table.zone.restaurantId === restaurantId
}
