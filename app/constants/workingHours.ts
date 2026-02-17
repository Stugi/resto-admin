/**
 * Рабочие часы ресторана — единый источник правды
 *
 * Используется в:
 * - TimeSlider.vue — range min/max, подписи часов
 * - BookingForm.vue — генерация слотов бронирования
 */

/** Начало рабочего дня (час) */
export const WORKING_HOURS_START = 12

/** Конец рабочего дня (час, последний слот = 23:30) */
export const WORKING_HOURS_END = 23

/** Шаг слотов бронирования в минутах */
export const BOOKING_SLOT_STEP = 30

/** Длительность бронирования по умолчанию (часы) */
export const BOOKING_DURATION_HOURS = 2

/** Длительность бронирования в миллисекундах (для сервера) */
export const BOOKING_DURATION_MS = BOOKING_DURATION_HOURS * 60 * 60 * 1000

/** Подписи часов для TimeSlider */
export const TIME_SLIDER_LABELS = ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'] as const

/**
 * Генерирует массив временных слотов для бронирования
 * Пример: ['12:00', '12:30', '13:00', ..., '23:30']
 */
export function generateTimeSlots(): string[] {
    const slots: string[] = []
    for (let h = WORKING_HOURS_START; h <= WORKING_HOURS_END; h++) {
        for (let m = 0; m < 60; m += BOOKING_SLOT_STEP) {
            slots.push(`${h}:${m.toString().padStart(2, '0')}`)
        }
    }
    return slots
}
