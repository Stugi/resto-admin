import type { Table, Zone, Reservation } from '@prisma/client'

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