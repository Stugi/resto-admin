<!-- app/components/sidebar/TableListItem.vue -->
<!--
  🎓 Элемент списка столов в сайдбаре (двухстрочный)

  Строка 1: Номер стола · Вместимость · Статус-индикатор
  Строка 2: Ближайшая бронь — Имя гостя · Кол-во человек
-->
<script setup lang="ts">
import type { TableWithStatus } from "~~/types"
import { getNearestBooking } from "~/utils/reservations"

interface Props {
    table: TableWithStatus
    isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isSelected: false,
})

interface Emits {
    (event: "click", tableId: string): void
}

const emit = defineEmits<Emits>()

const statusColor = computed(() => {
    switch (props.table.status) {
        case "free":
            return "bg-success"
        case "reserved":
            return "bg-brand"
        case "busy":
            return "bg-danger"
        default:
            return "bg-muted"
    }
})

const statusLabel = computed(() => {
    switch (props.table.status) {
        case "free":
            return "Свободен"
        case "reserved":
            return "Бронь"
        case "busy":
            return "Занят"
        default:
            return ""
    }
})

const nearestBooking = computed(() => getNearestBooking(props.table.reservations))
</script>

<template>
    <button
        class="table-item"
        :class="{ 'is-selected': isSelected }"
        @click="emit('click', table.id)"
    >
        <!-- Строка 1: номер стола, вместимость, статус -->
        <div class="row-top">
            <div class="flex items-center gap-2">
                <div class="table-number">
                    {{ table.name }}
                </div>
                <div class="capacity">
                    <Icon name="lucide:users" class="w-3.5 h-3.5" />
                    <span>{{ table.capacity }}</span>
                </div>
            </div>

            <div class="status">
                <span class="status-dot" :class="statusColor" />
            </div>
        </div>

        <!-- Строка 2: ближайшая бронь -->
        <ClientOnly>
            <div v-if="nearestBooking" class="row-bottom">
                <span class="booking-guest">{{ nearestBooking.guestName }}</span>
                <span class="divider">·</span>
                <span class="booking-people">
                    <Icon name="lucide:user" class="w-3 h-3" />
                    {{ nearestBooking.peopleCount }}
                </span>
                <span class="divider">·</span>
                <span class="booking-time">{{ nearestBooking.startTime }}</span>
            </div>
        </ClientOnly>
    </button>
</template>

<style scoped>
.table-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1);
    width: 100%;
    padding: 10px 12px;
    border-radius: var(--radius-lg);
    background: var(--color-surface-light);
    border: 1px solid var(--color-white-5);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    text-align: left;
}

.table-item:hover {
    border-color: color-mix(in srgb, var(--color-brand) 40%, transparent);
    background: color-mix(in srgb, var(--color-surface-light) 60%, var(--color-surface));
}

.table-item.is-selected {
    border-color: var(--color-brand);
    background: color-mix(in srgb, var(--color-brand) 10%, var(--color-surface));
}

/* --- Строка 1 --- */
.row-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.table-number {
    min-width: 32px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    border-radius: var(--radius-md);
    background: var(--color-white-5);
    font-size: var(--font-size-xs);
    font-weight: 700;
    color: white;
}

.is-selected .table-number {
    background: var(--color-brand);
    color: var(--color-bg);
}

.capacity {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--color-muted);
    font-size: var(--font-size-2xs);
    font-weight: 700;
}

.status {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
}

.status-label {
    font-size: var(--font-size-2xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
    color: var(--color-muted);
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* --- Строка 2: бронь --- */
.row-bottom {
    display: flex;
    align-items: center;
    gap: var(--spacing-1);
    padding-left: 2px;
    min-width: 0;
    font-size: var(--font-size-sm);
}

.booking-time {
    font-weight: 600;
    white-space: nowrap;
    color: color-mix(in srgb, var(--color-brand) 70%, transparent);
    font-size: var(--font-size-sm);
}

.divider {
    color: var(--color-white-10);
}

.booking-guest {
    font-weight: 500;
    color: var(--color-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 7rem;
}

.booking-people {
    display: flex;
    align-items: center;
    gap: 2px;
    font-weight: 600;
    color: var(--color-muted);
    white-space: nowrap;
}
</style>
