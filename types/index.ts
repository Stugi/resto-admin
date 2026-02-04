import type { Table, Zone, Reservation, User, Restaurant } from '@prisma/client'

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
    | 'vip_zone'    // VIP-зона (область)

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
export type TableStatus = 'free' | 'busy' | 'reserved'

// Расширяем стандартный тип стола из Prisma
export interface TableWithStatus extends Table {
    status: TableStatus
    reservations?: Reservation[] // если нужно на фронте
}

// Расширяем тип зоны
export interface ZoneWithTables extends Zone {
    tables: TableWithStatus[]
    elements?: ZoneElement[]  // Декоративные элементы схемы
}


export type RestaurantLink = Pick<Restaurant, 'slug' | 'name'>

export interface UserWithRestaurants extends User {
    restaurants: RestaurantLink[]
}