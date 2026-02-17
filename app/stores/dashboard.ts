import type { RestaurantLink, ZoneWithTables, TableWithStatus, ReservationWithDetails } from "~~/types"
import type { Reservation, Guest } from "@prisma/client"
import { format } from "date-fns"
import { WORKING_HOURS_START, WORKING_HOURS_END } from '~/constants/workingHours'

// Типы
export type LoadLevel = 'low' | 'medium' | 'high' | 'peak'

/**
 * 🎓 Фильтры для списка столов
 * 'all' — все столы
 * 'free' — свободные
 * 'reserved' — забронированные
 * 'busy' — занятые
 * 'soon' — скоро освободятся (менее 30 минут до конца брони)
 */
export type TableFilter = 'all' | 'free' | 'reserved' | 'busy' | 'soon'

/**
 * 🎓 Режимы отображения карты зала
 * 'grid' — карточки столов (текущий)
 * 'schema' — схема зала с расстановкой
 */
export type ViewMode = 'grid' | 'schema'

/**
 * 🎓 Вкладки правого сайдбара
 * 'booking' — форма бронирования
 * 'list' — список всех броней дня
 */
export type RightSidebarTab = 'booking' | 'list'

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
    const reservations = ref<ReservationWithDetails[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // UI state
    const activeZoneId = ref<string | null>(null)
    const selectedTableId = ref<string | null>(null)
    const bookingTableId = ref<string | null>(null)
    const tableFilter = ref<TableFilter>('all')
    const viewMode = useLocalStorage<ViewMode>('resto:viewMode', 'schema')
    const rightSidebarTab = ref<RightSidebarTab>('booking')

    // Mobile UI state
    const mobileMenuOpen = ref(false)
    const mobileBottomSheet = ref<'none' | 'booking' | 'booking-detail'>('none')
    const mobileDetailReservation = ref<ReservationWithDetails | null>(null)

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

        for (let hour = WORKING_HOURS_START; hour <= WORKING_HOURS_END; hour++) {
            // Считаем сколько бронирований активны в этот час
            const hourStart = new Date()
            hourStart.setHours(hour, 0, 0, 0)
            const hourEnd = new Date()
            hourEnd.setHours(hour, 59, 59, 999)

            const activeReservations = reservations.value.filter(res => {
                // Учитываем только подтверждённые и активные брони (не cancelled/finished)
                if (res.status !== 'confirmed' && res.status !== 'seated') return false
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

    // Выбранный стол (для модала информации)
    const selectedTable = computed(() =>
        allTables.value.find(t => t.id === selectedTableId.value)
    )

    // Стол в режиме бронирования (для формы в сайдбаре)
    const bookingTable = computed(() =>
        allTables.value.find(t => t.id === bookingTableId.value)
    )

    /**
     * 🎓 Отфильтрованные столы текущей зоны
     *
     * computed автоматически пересчитывается при изменении:
     * - currentZone (смена зоны)
     * - tableFilter (смена фильтра)
     * - viewTimeValue (смена времени для 'soon')
     */
    const filteredTables = computed(() => {
        const zoneTables = currentZone.value?.tables || []

        if (tableFilter.value === 'all') {
            return zoneTables
        }

        if (tableFilter.value === 'soon') {
            // "Скоро освободится" — бронь заканчивается в течение 30 минут
            const now = new Date()
            now.setHours(Math.floor(viewTimeValue.value), Math.round((viewTimeValue.value % 1) * 60))
            const soonThreshold = new Date(now.getTime() + 30 * 60 * 1000) // +30 минут

            return zoneTables.filter(table => {
                if (table.status !== 'busy') return false

                // Ищем активную бронь для этого стола
                const activeReservation = reservations.value.find(res =>
                    res.tableId === table.id &&
                    new Date(res.startTime) <= now &&
                    new Date(res.endTime) > now &&
                    new Date(res.endTime) <= soonThreshold
                )

                return !!activeReservation
            })
        }

        // Фильтр по статусу: free, reserved, busy
        return zoneTables.filter(table => table.status === tableFilter.value)
    })

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

    /** Открыть форму бронирования для стола */
    function startBooking(tableId: string) {
        bookingTableId.value = tableId
        selectedTableId.value = null // закрыть модал информации
    }

    /** Закрыть форму бронирования */
    function cancelBooking() {
        bookingTableId.value = null
    }

    function setActiveZone(zoneId: string | null) {
        activeZoneId.value = zoneId
    }

    function setTableFilter(filter: TableFilter) {
        tableFilter.value = filter
    }

    function setViewMode(mode: ViewMode) {
        viewMode.value = mode
    }

    function setRightSidebarTab(tab: RightSidebarTab) {
        rightSidebarTab.value = tab
    }

    // Mobile actions
    function openMobileMenu() { mobileMenuOpen.value = true }
    function closeMobileMenu() { mobileMenuOpen.value = false }
    function openBottomSheet(sheet: 'booking' | 'booking-detail') { mobileBottomSheet.value = sheet }
    function closeBottomSheet() { mobileBottomSheet.value = 'none' }
    function setMobileDetailReservation(res: ReservationWithDetails | null) { mobileDetailReservation.value = res }

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
                $fetch<ReservationWithDetails[]>('/api/reservations', {
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
        tableFilter.value = 'all'
        viewMode.value = 'schema'
        rightSidebarTab.value = 'booking'
        error.value = null
        viewTimeValue.value = getCurrentTimeValue()
        mobileMenuOpen.value = false
        mobileBottomSheet.value = 'none'
        mobileDetailReservation.value = null
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
        bookingTableId,
        tableFilter,
        viewMode,
        rightSidebarTab,
        mobileMenuOpen,
        mobileBottomSheet,
        mobileDetailReservation,

        // Getters
        viewTime,
        allTables,
        tableStats,
        hourlyLoad,
        currentZone,
        selectedTable,
        bookingTable,
        filteredTables,

        // Actions
        setViewTime,
        setRestaurant,
        selectTable,
        startBooking,
        cancelBooking,
        setActiveZone,
        setTableFilter,
        setViewMode,
        setRightSidebarTab,
        openMobileMenu,
        closeMobileMenu,
        openBottomSheet,
        closeBottomSheet,
        setMobileDetailReservation,
        fetchData,
        refreshTableStatuses,
        $reset,
    }
})