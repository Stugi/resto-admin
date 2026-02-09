<script setup lang="ts">
import type { ReservationWithDetails } from "~~/types"
import { format } from "date-fns"
import { formatPhone } from "~/composables/usePhoneMask"

const props = defineProps<{
    reservation: ReservationWithDetails | null
    isOpen: boolean
}>()

const emit = defineEmits<{
    (e: "close"): void
}>()

const store = useDashboardStore()

/** Инициалы гостя */
const initials = computed(() => {
    if (!props.reservation) return ""
    const name = props.reservation.guest.name
    const parts = name.split(" ")
    const first = parts[0]?.charAt(0) ?? ""
    const second = parts[1]?.charAt(0) ?? ""
    if (first && second) return (first + second).toUpperCase()
    return name.substring(0, 2).toUpperCase()
})

/** Название зоны */
const zoneName = computed(() => {
    if (!props.reservation) return ""
    const zone = store.zones.find((z) => z.tables.some((t) => t.id === props.reservation!.tableId))
    return zone?.name ?? ""
})

/** Текст статуса */
const statusLabels: Record<string, string> = {
    confirmed: "Подтверждено",
    pending: "Ожидает подтверждения",
    seated: "Гости за столом",
    cancelled: "Отменено",
}

/** Склонение "человек" */
function guestWord(count: number): string {
    if (count === 1) return "человек"
    if (count >= 2 && count <= 4) return "человека"
    return "человек"
}

/** Позвонить гостю */
function callGuest() {
    if (props.reservation?.guest.phone) {
        window.location.href = `tel:${props.reservation.guest.phone.replace(/[^+\d]/g, "")}`
    }
}
</script>

<template>
    <MobileBottomSheet :is-open="isOpen" title="Бронирование" @close="emit('close')">
        <template v-if="reservation">
            <!-- Гость -->
            <div class="flex items-center gap-3.5 pb-4 border-b border-border">
                <div
                    class="w-14 h-14 bg-gradient-to-br from-brand to-brand-dim rounded-full flex items-center justify-center text-xl font-bold text-bg shrink-0"
                >
                    {{ initials }}
                </div>
                <div>
                    <p class="text-xl font-bold mb-1 text-white">{{ reservation.guest.name }}</p>
                    <a
                        v-if="reservation.guest.phone"
                        :href="`tel:${reservation.guest.phone}`"
                        class="text-sm text-brand flex items-center gap-1.5"
                    >
                        <Icon name="lucide:phone" class="w-3.5 h-3.5" />
                        {{ formatPhone(reservation.guest.phone) }}
                    </a>
                </div>
            </div>

            <!-- Детали -->
            <div class="py-4 border-b border-border space-y-3 text-white">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-muted">Время</span>
                    <span class="text-sm font-semibold">
                        {{ format(new Date(reservation.startTime), "HH:mm") }} —
                        {{ format(new Date(reservation.endTime), "HH:mm") }}
                    </span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-muted">Стол</span>
                    <span class="text-sm font-semibold">
                        №{{ reservation.table.name }}
                        <span v-if="zoneName"> · {{ zoneName }}</span>
                    </span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-muted">Гостей</span>
                    <span class="text-sm font-semibold">
                        {{ reservation.peopleCount }} {{ guestWord(reservation.peopleCount) }}
                    </span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-muted">Статус</span>
                    <span class="text-sm font-semibold">
                        {{ statusLabels[reservation.status] || reservation.status }}
                    </span>
                </div>
            </div>

            <!-- Комментарий -->
            <div v-if="reservation.comment" class="py-4 border-b border-border">
                <div
                    class="px-3.5 py-3 bg-brand/10 rounded-lg text-sm text-brand flex items-center gap-2"
                >
                    <Icon name="lucide:message-square" class="w-4 h-4 shrink-0" />
                    {{ reservation.comment }}
                </div>
            </div>

            <!-- Кнопки действий -->
            <div class="py-4 grid grid-cols-1 gap-2.5">
                <button
                    v-if="reservation.guest.phone"
                    class="action-btn action-call"
                    @click="callGuest"
                >
                    <Icon name="lucide:phone" class="w-4 h-4" />
                    Позвонить
                </button>
            </div>
        </template>

        <template #footer>
            <button class="btn-secondary" @click="emit('close')">Закрыть</button>
            <button class="btn-primary">Гости сели</button>
        </template>
    </MobileBottomSheet>
</template>

<style scoped>
.action-btn {
    padding: var(--spacing-3_5);
    background: var(--color-surface-light);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    color: white;
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
    transition: background var(--duration-fast) var(--ease-out);
}

.action-btn:active {
    background: var(--color-border);
}

.action-call {
    background: rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.3);
    color: var(--color-success);
}

.btn-secondary,
.btn-primary {
    flex: 1;
    padding: var(--spacing-4);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
}

.btn-secondary {
    background: var(--color-surface-light);
    border: 1px solid var(--color-border);
    color: white;
}

.btn-primary {
    background: var(--color-brand);
    border: none;
    color: var(--color-bg);
}
</style>
