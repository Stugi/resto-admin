import type { Table, Zone, Reservation, User, Restaurant } from '@prisma/client'


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
}


export type RestaurantLink = Pick<Restaurant, 'slug' | 'name'>

export interface UserWithRestaurants extends User {
    restaurants: RestaurantLink[]
}