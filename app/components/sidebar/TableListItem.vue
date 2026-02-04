<!-- app/components/sidebar/TableListItem.vue -->
<!--
  🎓 Элемент списка столов в сайдбаре

  Отображает:
  - Номер/название стола
  - Вместимость (кол-во человек)
  - Статус (цветовой индикатор)
  - Клик выбирает стол
-->
<script setup lang="ts">
import type { TableWithStatus } from '~~/types'

/**
 * 🎓 Props — входные данные компонента
 *
 * table — объект стола с status
 * isSelected — выделен ли стол в данный момент
 */
interface Props {
    table: TableWithStatus
    isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isSelected: false
})

/**
 * 🎓 Emits — события, которые компонент отправляет наружу
 *
 * click — клик по элементу (передаём id стола)
 */
interface Emits {
    (event: 'click', tableId: string): void
}

const emit = defineEmits<Emits>()

/**
 * 🎓 computed для цвета статуса
 *
 * Возвращает Tailwind-классы в зависимости от статуса
 */
const statusColor = computed(() => {
    switch (props.table.status) {
        case 'free': return 'bg-success'
        case 'reserved': return 'bg-brand'
        case 'busy': return 'bg-danger'
        default: return 'bg-muted'
    }
})

const statusLabel = computed(() => {
    switch (props.table.status) {
        case 'free': return 'Свободен'
        case 'reserved': return 'Бронь'
        case 'busy': return 'Занят'
        default: return ''
    }
})
</script>

<template>
    <button
        class="table-item"
        :class="{ 'is-selected': isSelected }"
        @click="emit('click', table.id)"
    >
        <!-- Левая часть: номер и вместимость -->
        <div class="flex items-center gap-3">
            <!-- Номер стола -->
            <div class="table-number">
                {{ table.name }}
            </div>

            <!-- Вместимость -->
            <div class="flex items-center gap-1 text-muted">
                <Icon name="lucide:users" class="w-3.5 h-3.5" />
                <span class="text-2xs font-bold">{{ table.capacity }}</span>
            </div>
        </div>

        <!-- Правая часть: статус -->
        <div class="flex items-center gap-2">
            <span class="text-2xs text-muted font-medium uppercase tracking-wide">
                {{ statusLabel }}
            </span>
            <span
                class="w-2 h-2 rounded-full"
                :class="statusColor"
            />
        </div>
    </button>
</template>

<style scoped>
.table-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 12px;
    border-radius: var(--radius-lg);
    background: var(--color-surface-light);
    border: 1px solid var(--color-white-5);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
}

.table-item:hover {
    border-color: color-mix(in srgb, var(--color-brand) 40%, transparent);
    background: color-mix(in srgb, var(--color-surface-light) 60%, var(--color-surface));
}

.table-item.is-selected {
    border-color: var(--color-brand);
    background: color-mix(in srgb, var(--color-brand) 10%, var(--color-surface));
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
</style>
