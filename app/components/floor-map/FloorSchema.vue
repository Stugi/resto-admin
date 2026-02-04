<!-- app/components/floor-map/FloorSchema.vue -->
<!--
  Схема зала с расстановкой столов и декоративными элементами

  Отображает:
  - Столы на плане с позициями posX/posY
  - Декоративные элементы из zone.elements (кухня, бар, растения, VIP-зоны)
-->
<script setup lang="ts">
import type { TableWithStatus, ZoneElement } from '~~/types'

interface Props {
    tables: TableWithStatus[]
    elements?: ZoneElement[]
    selectedTableId: string | null
}

defineProps<Props>()

const emit = defineEmits<{
    (event: 'selectTable', tableId: string | null): void
}>()

const handleTableClick = (tableId: string) => {
    emit('selectTable', tableId)
}
</script>

<template>
    <div class="floor-schema">
        <!-- Фон схемы с сеткой -->
        <div class="schema-background" />

        <!-- Декоративные элементы из zone.elements -->
        <FloorElement
            v-for="element in elements"
            :key="element.id"
            :element="element"
        />

        <!-- Столы -->
        <TableOnSchema
            v-for="table in tables"
            :key="table.id"
            :table="table"
            :is-selected="selectedTableId === table.id"
            @click="handleTableClick"
        />

        <!-- Пустое состояние если нет столов -->
        <div v-if="!tables.length && !elements?.length" class="empty-state">
            <Icon name="lucide:layout-grid" class="text-3xl mb-2 opacity-30" />
            <p class="text-xs text-muted">Нет элементов в этой зоне</p>
        </div>
    </div>
</template>

<style scoped>
.floor-schema {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 600px;
    padding: 2rem;
    border-radius: var(--radius-xl);
    /* Не обрезаем элементы — пусть выходят за края */
    overflow: visible;
}

/* Фон с сеткой */
.schema-background {
    position: absolute;
    inset: 0;
    z-index: 0; /* Под всеми элементами */
    background:
        /* Сетка */
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        /* Основной фон */
        var(--color-surface);
    background-size: 40px 40px, 40px 40px, 100% 100%;
    border-radius: var(--radius-xl);
}

/* Пустое состояние */
.empty-state {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-muted);
}
</style>
