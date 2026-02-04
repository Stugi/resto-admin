<!-- app/components/floor-map/TableOnSchema.vue -->
<!--
  🎓 Стол на схеме зала

  Позиционируется абсолютно через posX/posY (в процентах)
  Показывает: номер, статус (цвет), вместимость
-->
<script setup lang="ts">
import type { TableWithStatus } from '~~/types'
import { getStatusConfig } from '~/constants/tableStatuses'

interface Props {
    table: TableWithStatus
    isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isSelected: false
})

const emit = defineEmits<{
    (event: 'click', tableId: string): void
}>()

/**
 * 🎓 Позиция стола на схеме
 * transform: translate(-50%, -50%) центрирует элемент относительно точки
 */
const positionStyle = computed(() => ({
    left: `${props.table.posX ?? 50}%`,
    top: `${props.table.posY ?? 50}%`,
}))

/**
 * 🎓 Размер стола зависит от вместимости
 */
const sizeClass = computed(() => {
    const cap = props.table.capacity
    if (cap >= 8) return 'table-xl'
    if (cap >= 6) return 'table-lg'
    if (cap >= 4) return 'table-md'
    return 'table-sm'
})

const statusConfig = computed(() => getStatusConfig(props.table.status))
</script>

<template>
    <button
        class="table-on-schema"
        :class="[sizeClass, { 'is-selected': isSelected }]"
        :style="positionStyle"
        @click="emit('click', table.id)"
    >
        <!-- Статус-индикатор (цветное кольцо) -->
        <div class="status-ring" :class="statusConfig?.color" />

        <!-- Номер стола -->
        <span class="table-name">{{ table.name }}</span>

        <!-- Вместимость -->
        <span class="table-capacity">{{ table.capacity }}</span>
    </button>
</template>

<style scoped>
.table-on-schema {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    background: var(--color-surface-light);
    border: 2px solid var(--color-white-5);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    z-index: 10; /* Выше декора и фона */
}

.table-on-schema:hover {
    transform: translate(-50%, -50%) scale(1.08);
    border-color: var(--color-brand);
    z-index: 10;
}

.table-on-schema.is-selected {
    border-color: var(--color-brand);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 30%, transparent);
    z-index: 10;
}

/* Размеры столов */
.table-sm {
    width: 3rem;
    height: 3rem;
}

.table-md {
    width: 4rem;
    height: 4rem;
}

.table-lg {
    width: 5rem;
    height: 5rem;
}

.table-xl {
    width: 6rem;
    height: 4rem;
    border-radius: var(--radius-xl);
}

/* Статус-индикатор */
.status-ring {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
    border: 2px solid var(--color-surface);
}

/* Номер стола */
.table-name {
    font-size: var(--font-size-sm);
    font-weight: 700;
    color: white;
}

/* Вместимость */
.table-capacity {
    font-size: var(--font-size-2xs);
    color: var(--color-muted);
}
</style>
