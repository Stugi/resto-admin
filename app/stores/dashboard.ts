import type { RestaurantLink, ZoneWithTables, TableWithStatus } from "~~/types"
import type { Reservation, Guest } from "@prisma/client"
import { format } from "date-fns"

// Типы
export type LoadLevel = 'low' | 'medium' | 'high' | 'peak'

export interface HourlyLoad {
    hour: number
    load: number // 0-100
    level: LoadLevel
    reservationsCount: number
}

export interface TableStats {
    available: number
    reserved: number
    occupied: number
    total: number
}

export type ReservationWithGuest = Reservation & { guest: Guest }

export const useDashboardStore = defineStore('dashboard', () => {
    // --- STATE ---
    const currentRestaurant = ref<RestaurantLink | null>(null)
    const viewTimeValue = ref(getCurrentTimeValue())

    // Данные с сервера
    const zones = ref<ZoneWithTables[]>([])
    const reservations = ref<ReservationWithGuest[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // UI state
    const activeZoneId = ref<string | null>(null)
    const selectedTableId = ref<string | null>(null)

    // --- HELPERS ---
    function getCurrentTimeValue(): number {
        const now = new Date()
        return now.getHours() + now.getMinutes() / 60
    }

    // --- GETTERS ---
    const viewTime = computed(() => {
        const hours = Math.floor(viewTimeValue.value)
        const minutes = Math.round((viewTimeValue.value - hours) * 60)
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    })

    // Все столы из всех зон
    const allTables = computed((): TableWithStatus[] =>
        zones.value.flatMap(z => z.tables)
    )

    // Статистика столов в текущий момент времени
    const tableStats = computed((): TableStats => {
        const tables = allTables.value
        const stats = { available: 0, reserved: 0, occupied: 0, total: tables.length }

        tables.forEach(table => {
            if (table.status === 'free') stats.available++
            else if (table.status === 'reserved') stats.reserved++
            else if (table.status === 'busy') stats.occupied++
        })

        return stats
    })

    // Загрузка по часам для heatmap (на основе бронирований)
    const hourlyLoad = computed((): HourlyLoad[] => {
        const totalTables = allTables.value.length || 1
        const segments: HourlyLoad[] = []

        for (let hour = 12; hour < 24; hour++) {
            // Считаем сколько бронирований активны в этот час
            const hourStart = new Date()
            hourStart.setHours(hour, 0, 0, 0)
            const hourEnd = new Date()
            hourEnd.setHours(hour, 59, 59, 999)

            const activeReservations = reservations.value.filter(res => {
                const start = new Date(res.startTime)
                const end = new Date(res.endTime)
                // Бронь пересекается с этим часом
                return start < hourEnd && end > hourStart
            })

            const reservationsCount = activeReservations.length
            const load = Math.min(100, Math.round((reservationsCount / totalTables) * 100))

            let level: LoadLevel = 'low'
            if (load > 80) level = 'peak'
            else if (load > 60) level = 'high'
            else if (load > 35) level = 'medium'

            segments.push({ hour, load, level, reservationsCount })
        }

        return segments
    })

    // Текущая зона
    const currentZone = computed(() =>
        zones.value.find(z => z.id === activeZoneId.value)
    )

    // Выбранный стол
    const selectedTable = computed(() =>
        allTables.value.find(t => t.id === selectedTableId.value)
    )

    // --- ACTIONS ---
    function setViewTime(val: number) {
        viewTimeValue.value = val
    }

    function setRestaurant(restaurant: RestaurantLink | null) {
        currentRestaurant.value = restaurant
    }

    function selectTable(tableId: string | null) {
        selectedTableId.value = tableId
    }

    function setActiveZone(zoneId: string | null) {
        activeZoneId.value = zoneId
    }

    // Загрузка данных с сервера
    async function fetchData(date: Date) {
        if (!currentRestaurant.value?.slug) return

        isLoading.value = true
        error.value = null

        const dateStr = format(date, 'yyyy-MM-dd')

        try {
            const [zonesData, reservationsData] = await Promise.all([
                $fetch<ZoneWithTables[]>('/api/zones', {
                    query: {
                        date: dateStr,
                        restaurantSlug: currentRestaurant.value.slug,
                        viewTime: viewTime.value
                    }
                }),
                $fetch<ReservationWithGuest[]>('/api/reservations', {
                    query: {
                        date: dateStr,
                        restaurantSlug: currentRestaurant.value.slug
                    }
                })
            ])

            zones.value = zonesData
            reservations.value = reservationsData

            // Установить первую зону активной, если еще не выбрана
            if (!activeZoneId.value && zonesData.length > 0) {
                activeZoneId.value = zonesData[0].id
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to load data'
            console.error('Dashboard fetch error:', e)
        } finally {
            isLoading.value = false
        }
    }

    // Обновить только статусы столов (при смене viewTime)
    async function refreshTableStatuses(date: Date) {
        if (!currentRestaurant.value?.slug) return

        try {
            const dateStr = format(date, 'yyyy-MM-dd')
            const zonesData = await $fetch<ZoneWithTables[]>('/api/zones', {
                query: {
                    date: dateStr,
                    restaurantSlug: currentRestaurant.value.slug,
                    viewTime: viewTime.value
                }
            })
            zones.value = zonesData
        } catch (e) {
            console.error('Failed to refresh table statuses:', e)
        }
    }

    // Сброс состояния
    function $reset() {
        zones.value = []
        reservations.value = []
        activeZoneId.value = null
        selectedTableId.value = null
        error.value = null
        viewTimeValue.value = getCurrentTimeValue()
    }

    return {
        // State
        currentRestaurant,
        viewTimeValue,
        zones,
        reservations,
        isLoading,
        error,
        activeZoneId,
        selectedTableId,

        // Getters
        viewTime,
        allTables,
        tableStats,
        hourlyLoad,
        currentZone,
        selectedTable,

        // Actions
        setViewTime,
        setRestaurant,
        selectTable,
        setActiveZone,
        fetchData,
        refreshTableStatuses,
        $reset,
    }
})