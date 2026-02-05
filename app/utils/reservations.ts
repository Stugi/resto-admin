import type { Reservation, Guest } from '@prisma/client'

/**
 * Информация о ближайшей брони для отображения в TableListItem
 */
export interface NearestBooking {
    guestName: string
    peopleCount: number
    startTime: string // "19:30"
}

/** Резервация с гостем (приходит из zones API с include: { guest: true }) */
type ReservationWithGuest = Reservation & { guest: Guest }

/**
 * Находит ближайшую предстоящую бронь из массива резерваций стола
 *
 * table.reservations приходят с API уже отфильтрованными
 * (confirmed/seated) и отсортированными по startTime ASC
 */
export function getNearestBooking(
    reservations: ReservationWithGuest[] | undefined,
): NearestBooking | null {
    if (!reservations?.length) return null

    const nearest = reservations[0]!

    return {
        guestName: nearest.guest?.name ?? 'Гость',
        peopleCount: nearest.peopleCount,
        startTime: formatReservationTime(new Date(nearest.startTime)),
    }
}

/**
 * Форматирует дату в строку времени "HH:MM"
 */
export function formatReservationTime(date: Date): string {
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    })
}
