<!-- app/components/floor-map/TableInfoModal.vue -->
<!--
  Модал информации о столе

  Показывает:
  - Занятый/забронированный: инфо о госте, детали брони, кнопки «Позвонить» / «Редактировать»
  - Свободный: «Стол свободен» + кнопка «Создать бронь» + следующая бронь
-->
<script setup lang="ts">
import type { TableWithStatus } from '~~/types'
import { getStatusConfig } from '~/constants/tableStatuses'
import { formatPhone } from '~/composables/usePhoneMask'
import { format } from 'date-fns'

interface Props {
    table: TableWithStatus | null
    zoneName: string
    isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'create-booking'): void
    (e: 'edit-booking'): void
}>()

/** Статус-конфиг стола */
const statusConfig = computed(() => {
    if (!props.table) return null
    return getStatusConfig(props.table.status)
})

/** Текущая активная бронь */
const activeReservation = computed(() => {
    if (!props.table?.reservations?.length) return null
    const now = new Date()
    return props.table.reservations.find(r => {
        const start = new Date(r.startTime)
        const end = new Date(r.endTime)
        return now >= start && now <= end
    }) ?? props.table.reservations[0] ?? null
})

/** Ближайшая будущая бронь (для свободных столов) */
const nextReservation = computed(() => {
    if (!props.table?.reservations?.length) return null
    if (props.table.status !== 'free') return null
    const now = new Date()
    return props.table.reservations
        .filter(r => new Date(r.startTime) > now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] ?? null
})

/** Свободен ли стол */
const isFree = computed(() => props.table?.status === 'free')

/** Инициалы гостя */
const initials = computed(() => {
    if (!activeReservation.value) return ''
    const name = activeReservation.value.guest.name
    const parts = name.split(' ')
    const first = parts[0]?.charAt(0) ?? ''
    const second = parts[1]?.charAt(0) ?? ''
    if (first && second) return (first + second).toUpperCase()
    return name.substring(0, 2).toUpperCase()
})

/** Время окончания брони для статуса */
const statusTimeText = computed(() => {
    if (!activeReservation.value) return ''
    const end = new Date(activeReservation.value.endTime)
    const endStr = format(end, 'HH:mm')
    if ((props.table?.status as string) === 'soon') return `освободится ~${endStr}`
    return `до ${endStr}`
})

/** Склонение «человек» */
function guestWord(count: number): string {
    if (count === 1) return 'человек'
    if (count >= 2 && count <= 4) return 'человека'
    return 'человек'
}

/** Позвонить гостю */
function callGuest() {
    if (activeReservation.value?.guest.phone) {
        window.location.href = `tel:${activeReservation.value.guest.phone.replace(/[^+\d]/g, '')}`
    }
}

/** Закрыть по клику на overlay */
function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
        emit('close')
    }
}
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="isOpen && table"
                class="modal-overlay"
                @click="handleOverlayClick"
            >
                <div class="modal-card" @click.stop>
                    <!-- Заголовок -->
                    <div class="modal-header">
                        <div class="flex items-center gap-3">
                            <span class="table-number-badge">
                                {{ table.name }}
                            </span>
                            <div>
                                <h3 class="text-lg font-bold text-white">
                                    Стол №{{ table.name }}
                                </h3>
                                <p class="text-xs text-muted">
                                    {{ zoneName }} · {{ table.capacity }} мест
                                </p>
                            </div>
                        </div>
                        <button class="close-btn" @click="emit('close')">
                            <Icon name="lucide:x" class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Статус -->
                    <div class="status-row">
                        <span
                            class="status-badge"
                            :class="statusConfig?.color"
                        >
                            {{ statusConfig?.label }}
                        </span>
                        <span v-if="statusTimeText" class="text-xs text-muted">
                            {{ statusTimeText }}
                        </span>
                    </div>

                    <!-- === Занятый/забронированный стол === -->
                    <template v-if="!isFree && activeReservation">
                        <!-- Гость -->
                        <div class="guest-section">
                            <div class="guest-avatar">
                                {{ initials }}
                            </div>
                            <div>
                                <h4 class="font-bold text-white">
                                    {{ activeReservation.guest.name }}
                                </h4>
                                <a
                                    v-if="activeReservation.guest.phone"
                                    :href="`tel:${activeReservation.guest.phone}`"
                                    class="text-sm text-muted flex items-center gap-1.5"
                                >
                                    <Icon name="lucide:phone" class="w-3.5 h-3.5" />
                                    {{ formatPhone(activeReservation.guest.phone) }}
                                </a>
                            </div>
                        </div>

                        <!-- Детали брони -->
                        <div class="details-section">
                            <div class="detail-row">
                                <Icon name="lucide:users" class="w-4 h-4 text-muted" />
                                <span class="text-sm text-muted">Гостей:</span>
                                <span class="text-sm font-semibold text-white ml-auto">
                                    {{ activeReservation.peopleCount }} {{ guestWord(activeReservation.peopleCount) }}
                                </span>
                            </div>
                            <div class="detail-row">
                                <Icon name="lucide:clock" class="w-4 h-4 text-muted" />
                                <span class="text-sm text-muted">Время:</span>
                                <span class="text-sm font-semibold text-white ml-auto">
                                    {{ format(new Date(activeReservation.startTime), 'HH:mm') }} —
                                    {{ format(new Date(activeReservation.endTime), 'HH:mm') }}
                                </span>
                            </div>
                            <div v-if="activeReservation.comment" class="detail-row">
                                <Icon name="lucide:message-square" class="w-4 h-4 text-muted" />
                                <span class="text-sm text-muted">Заметка:</span>
                                <span class="text-sm font-semibold text-brand ml-auto">
                                    {{ activeReservation.comment }}
                                </span>
                            </div>
                        </div>

                        <!-- Кнопки действий -->
                        <div class="actions-row">
                            <button class="action-btn action-call" @click="callGuest">
                                <Icon name="lucide:phone" class="w-4 h-4" />
                                Позвонить
                            </button>
                            <button class="action-btn action-edit" @click="emit('edit-booking')">
                                <Icon name="lucide:pencil" class="w-4 h-4" />
                                Редактировать
                            </button>
                        </div>
                    </template>

                    <!-- === Свободный стол === -->
                    <template v-else>
                        <div class="empty-section">
                            <div class="empty-icon">
                                <Icon name="lucide:sparkles" class="w-8 h-8 text-brand" />
                            </div>
                            <p class="text-sm text-muted">Стол свободен</p>
                            <button class="create-btn" @click="emit('create-booking')">
                                <Icon name="lucide:plus" class="w-4 h-4" />
                                Создать бронь
                            </button>
                        </div>

                        <!-- Следующая бронь -->
                        <div v-if="nextReservation" class="next-booking">
                            <span class="text-2xs text-muted uppercase tracking-wide font-semibold">
                                Следующая бронь
                            </span>
                            <div class="flex items-center justify-between mt-1.5">
                                <span class="text-sm font-bold text-white">
                                    {{ format(new Date(nextReservation.startTime), 'HH:mm') }}
                                </span>
                                <span class="text-xs text-muted">
                                    {{ nextReservation.guest.name }} · {{ nextReservation.peopleCount }} гостя
                                </span>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* Overlay */
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
}

/* Карточка модала */
.modal-card {
    width: 100%;
    max-width: 380px;
    margin: var(--spacing-4);
    padding: var(--spacing-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
}

/* Заголовок */
.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.table-number-badge {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, var(--color-brand), var(--color-brand-dim));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--color-bg);
    flex-shrink: 0;
}

.close-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--color-surface-light);
    border: 1px solid var(--color-border);
    color: var(--color-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
}

.close-btn:hover {
    color: white;
    border-color: var(--color-muted);
}

/* Статус */
.status-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-3) 0;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
}

.status-badge {
    padding: var(--spacing-1) var(--spacing-3);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: white;
}

/* Гость */
.guest-section {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding-bottom: var(--spacing-4);
    border-bottom: 1px solid var(--color-border);
}

.guest-avatar {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--color-sky), var(--color-brand));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--color-bg);
    flex-shrink: 0;
}

/* Детали брони */
.details-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
    padding-bottom: var(--spacing-4);
    border-bottom: 1px solid var(--color-border);
}

.detail-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
}

/* Кнопки действий */
.actions-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-3);
}

.action-btn {
    padding: var(--spacing-3);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
    transition: all var(--duration-fast) var(--ease-out);
}

.action-call {
    background: var(--color-surface-light);
    border: 1px solid var(--color-border);
    color: white;
}

.action-call:hover {
    border-color: var(--color-muted);
}

.action-edit {
    background: var(--color-brand);
    border: none;
    color: var(--color-bg);
}

.action-edit:hover {
    background: var(--color-brand-dim);
}

/* Пустое состояние */
.empty-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-4) 0;
}

.empty-icon {
    opacity: 0.8;
}

.create-btn {
    width: 100%;
    padding: var(--spacing-3_5);
    border-radius: var(--radius-lg);
    background: var(--color-brand);
    border: none;
    color: var(--color-bg);
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
    transition: background var(--duration-fast) var(--ease-out);
}

.create-btn:hover {
    background: var(--color-brand-dim);
}

/* Следующая бронь */
.next-booking {
    padding: var(--spacing-3);
    background: var(--color-surface-light);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
}

/* Анимация модала */
.modal-enter-active,
.modal-leave-active {
    transition: opacity var(--duration-normal) var(--ease-out);
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
    transition: transform var(--duration-normal) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-card {
    transform: scale(0.95);
}

.modal-leave-to .modal-card {
    transform: scale(0.95);
}

/* === Мобилка: bottom-sheet вместо центрированного модала === */
@media (max-width: 1023px) {
    .modal-overlay {
        align-items: flex-end;
    }

    .modal-card {
        max-width: 100%;
        margin: 0;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        max-height: 85vh;
        overflow-y: auto;
    }

    .modal-enter-from .modal-card,
    .modal-leave-to .modal-card {
        transform: translateY(100%);
    }
}
</style>
