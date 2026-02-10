<!-- app/components/floor-map/TableOnSchema.vue -->
<!--
  Стол на схеме зала

  Позиционируется абсолютно через posX/posY (в процентах)
  Показывает: номер, статус (цвет), вместимость
  Формы: round (круг), square (квадрат), rect (прямоугольник)
-->
<script setup lang="ts">
import type { TableWithStatus, TableShape } from '~~/types'
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
 * Позиция стола на схеме
 * transform: translate(-50%, -50%) центрирует элемент относительно точки
 */
const positionStyle = computed(() => ({
    left: `${props.table.posX ?? 50}%`,
    top: `${props.table.posY ?? 50}%`,
}))

/**
 * Размер стола зависит от вместимости
 */
const sizeClass = computed(() => {
    const cap = props.table.capacity
    if (cap >= 8) return 'table-xl'
    if (cap >= 6) return 'table-lg'
    if (cap >= 4) return 'table-md'
    return 'table-sm'
})

/**
 * Форма стола: round (круг), square (квадрат), rect (прямоугольник)
 * Если shape не задан в БД — определяем по вместимости
 */
function getDefaultShape(capacity: number): TableShape {
    if (capacity <= 2) return 'round'
    if (capacity <= 5) return 'square'
    return 'rect'
}

const shapeClass = computed(() => {
    const shape = (props.table.shape as TableShape) ?? getDefaultShape(props.table.capacity)
    return `shape-${shape}`
})

const statusConfig = computed(() => getStatusConfig(props.table.status))
</script>

<template>
    <button
        class="table-on-schema"
        :class="[sizeClass, shapeClass, { 'is-selected': isSelected }]"
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

/* Формы столов */
.shape-round {
    border-radius: var(--radius-full); /* 50% — круг */
}

.shape-square {
    border-radius: var(--radius-lg); /* скруглённый квадрат */
}

.shape-rect {
    border-radius: var(--radius-xl); /* прямоугольник со скруглением */
}

/* Размеры столов (пропорционально вместимости) */
.table-sm {
    width: 5rem;
    height: 5rem;
}

.table-md {
    width: 6rem;
    height: 6rem;
}

.table-lg {
    width: 7rem;
    height: 7rem;
}

.table-xl {
    width: 10rem;
    height: 6rem;
}

/* Статус-индикатор */
.status-ring {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 14px;
    height: 14px;
    border-radius: var(--radius-full);
    border: 2px solid var(--color-surface);
}

/* Номер стола */
.table-name {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: white;
}

/* Вместимость */
.table-capacity {
    font-size: var(--font-size-xs);
    color: var(--color-muted);
}
</style>
