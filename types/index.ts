import type { Table, Zone, Reservation, Guest, User, Restaurant } from '@prisma/client'

// ============ ЭЛЕМЕНТЫ СХЕМЫ ЗАЛА ============

/**
 * Типы декоративных элементов на схеме зала
 */
export type ElementType =
    // Объекты
    | 'kitchen'     // Кухня
    | 'bar'         // Бар
    | 'entrance'    // Вход
    | 'toilet'      // WC
    | 'hostess'     // Хостес
    // Декор
    | 'plants'      // Растение
    // Архитектура
    | 'wall_h'      // Стена горизонтальная
    | 'wall_v'      // Стена вертикальная
    | 'column'      // Колонна
    | 'window'      // Окно
    // Зоны
    | 'vip_zone'       // VIP-зона (область)
    | 'terrace_zone'   // Зона у окна / терраса (область)

/**
 * Декоративный элемент на схеме зала
 */
export interface ZoneElement {
    id: string
    type: ElementType
    label?: string      // Подпись (опционально)
    posX: number        // Позиция X (0-100%)
    posY: number        // Позиция Y (0-100%)
    width?: number      // Ширина (для стен, зон)
    height?: number     // Высота (для стен, зон)
    rotation?: number   // Поворот (0, 90, 180, 270)
}

// ============ СТОЛЫ ============

// Определяем возможные статусы
export type TableStatus = 'free' | 'busy' | 'reserved' | 'soon'

// Формы столов на схеме зала
export type TableShape = 'round' | 'square' | 'rect'

// Расширяем стандартный тип стола из Prisma
export interface TableWithStatus extends Table {
    status: TableStatus
    reservations?: (Reservation & { guest: Guest })[]
}

// Расширяем тип зоны
export interface ZoneWithTables extends Zone {
    tables: TableWithStatus[]
    elements?: ZoneElement[]  // Декоративные элементы схемы
}


// Резервация с вложенными guest и table (ответ /api/reservations)
export type ReservationWithDetails = Reservation & {
    guest: Guest
    table: Pick<Table, 'id' | 'name'>
}

export type RestaurantLink = Pick<Restaurant, 'slug' | 'name'>

export interface UserWithRestaurants extends User {
    restaurants: RestaurantLink[]
}