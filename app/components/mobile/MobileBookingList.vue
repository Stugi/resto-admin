<script setup lang="ts">
import type { ReservationWithDetails } from "~~/types"
import { format } from "date-fns"

const props = defineProps<{
    reservations: ReservationWithDetails[]
}>()

const emit = defineEmits<{
    (e: "openDetail", reservation: ReservationWithDetails): void
}>()

const store = useDashboardStore()

/** Группировка бронирований по часам */
const groupedReservations = computed(() => {
    const sorted = [...props.reservations].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )

    const groups = new Map<string, ReservationWithDetails[]>()

    sorted.forEach((res) => {
        const hour = new Date(res.startTime).getHours()
        const key = `${hour.toString().padStart(2, "0")}:00`
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(res)
    })

    return groups
})

/** Форматировать время */
function formatTime(date: string | Date): string {
    return format(new Date(date), "HH:mm")
}

/** Получить название зоны для стола */
function getZoneName(tableId: string): string {
    const zone = store.zones.find((z) => z.tables.some((t) => t.id === tableId))
    return zone?.name ?? ""
}

/** Текст статуса */
const statusText: Record<string, string> = {
    confirmed: "Подтверждена",
    pending: "Ожидает",
    seated: "Сидят",
    cancelled: "Отмена",
}

/** CSS класс статуса */
const statusClass: Record<string, string> = {
    confirmed: "status-confirmed",
    pending: "status-pending",
    seated: "status-seated",
    cancelled: "status-cancelled",
}
</script>

<template>
    <section class="px-4 py-4 pb-24">
        <!-- Заголовок -->
        <div class="flex justify-between items-center mb-3">
            <h2 class="text-base font-semibold">Брони</h2>
            <span class="px-2.5 py-1 bg-surface-light rounded-lg text-xs font-semibold text-muted">
                {{ reservations.length }} записей
            </span>
        </div>

        <!-- Пустое состояние -->
        <div v-if="!reservations.length" class="text-center py-12">
            <div class="text-5xl mb-4">📋</div>
            <p class="text-lg font-semibold mb-2">Нет бронирований</p>
            <p class="text-sm text-muted">На эту дату пока нет записей</p>
        </div>

        <!-- Группы по времени -->
        <div v-else>
            <div v-for="[time, bookings] in groupedReservations" :key="time" class="mb-5">
                <!-- Метка времени с линией -->
                <div class="time-label">
                    <span>{{ time }}</span>
                </div>

                <!-- Карточки бронирований -->
                <div
                    v-for="res in bookings"
                    :key="res.id"
                    class="booking-card"
                    @click="emit('openDetail', res)"
                >
                    <div class="flex justify-between items-start mb-2.5">
                        <span class="text-xl font-bold text-brand">
                            {{ formatTime(res.startTime) }}
                        </span>
                        <span class="status-badge" :class="statusClass[res.status]">
                            {{ statusText[res.status] || res.status }}
                        </span>
                    </div>

                    <p class="text-base font-semibold mb-2">{{ res.guest.name }}</p>

                    <div class="flex gap-4 text-xs text-muted">
                        <span class="flex items-center gap-1">
                            <Icon name="lucide:armchair" class="w-3.5 h-3.5" />
                            Стол {{ res.table.name }}
                        </span>
                        <span class="flex items-center gap-1">
                            <Icon name="lucide:users" class="w-3.5 h-3.5" />
                            {{ res.peopleCount }}
                        </span>
                        <span v-if="getZoneName(res.tableId)" class="flex items-center gap-1">
                            <Icon name="lucide:map-pin" class="w-3.5 h-3.5" />
                            {{ getZoneName(res.tableId) }}
                        </span>
                    </div>

                    <div
                        v-if="res.comment"
                        class="mt-2.5 px-2.5 py-2 bg-brand/10 rounded-lg text-xs text-brand flex items-center gap-1.5"
                    >
                        <Icon name="lucide:message-square" class="w-3.5 h-3.5 shrink-0" />
                        {{ res.comment }}
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.time-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    margin-bottom: var(--spacing-2_5);
    color: var(--color-muted);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
}

.time-label::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--color-border);
}

.booking-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-3_5);
    margin-bottom: var(--spacing-2_5);
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-out);
}

.booking-card:active {
    transform: scale(0.98);
    background: var(--color-surface-light);
}

.status-badge {
    padding: var(--spacing-1) var(--spacing-2_5);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.status-confirmed {
    background: rgba(34, 197, 94, 0.15);
    color: var(--color-success);
}

.status-pending {
    background: rgba(249, 115, 22, 0.15);
    color: var(--color-warning);
}

.status-seated {
    background: rgba(168, 85, 247, 0.15);
    color: #a855f7;
}

.status-cancelled {
    background: rgba(239, 68, 68, 0.15);
    color: var(--color-danger);
}
</style>
