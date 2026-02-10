<!-- app/components/sidebar/TableList.vue -->
<!--
  🎓 Список столов с фильтрами

  Компонент содержит:
  - Табы фильтров (все / свободные / бронь / занятые / скоро освободится)
  - Скролл-список столов
  - Пустое состояние если нет столов

  Использует store напрямую для:
  - filteredTables — отфильтрованные столы
  - tableFilter — текущий фильтр
  - selectedTableId — выбранный стол
-->
<script setup lang="ts">
import type { TableFilter } from "~/stores/dashboard"
import { TABLE_STATUSES } from "~/constants/tableStatuses"

const store = useDashboardStore()

/**
 * 🎓 Табы фильтров = "Все" + статусы из общего конфига
 */
const filterTabs: { key: TableFilter; label: string; color?: string }[] = [
    { key: "all", label: "Все" },
    ...TABLE_STATUSES,
]

/**
 * 🎓 Обработчик клика по столу
 *
 * Передаём в store через action
 */
const handleTableClick = (tableId: string) => {
    store.selectTable(tableId)
}
</script>

<template>
    <div class="table-list">
        <!-- Табы фильтров -->
        <div class="filter-tabs">
            <button
                v-for="tab in filterTabs"
                :key="tab.key"
                class="filter-tab"
                :class="{ 'is-active': store.tableFilter === tab.key }"
                @click="store.setTableFilter(tab.key)"
            >
                <!-- Цветной индикатор статуса -->
                <span v-if="tab.color" class="w-2 h-2 rounded-full" :class="tab.color" />
                <span class="text-2xs font-medium" v-else>{{ tab.label }}</span>
            </button>
        </div>

        <!-- Список столов -->
        <div class="tables-scroll">
            <template v-if="store.filteredTables.length">
                <TableListItem
                    v-for="table in store.filteredTables"
                    :key="table.id"
                    :table="table"
                    :is-selected="store.selectedTableId === table.id"
                    @click="handleTableClick"
                />
            </template>

            <!-- Пустое состояние -->
            <div v-else class="empty-state">
                <Icon name="lucide:inbox" class="text-2xl mb-2 opacity-30" />
                <p class="text-2xs text-muted font-medium">Нет столов с таким статусом</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.table-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
}

/* Табы фильтров */
.filter-tabs {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.filter-tab {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: var(--radius-md);
    font-size: var(--font-size-2xs);
    font-weight: 600;
    color: var(--color-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    white-space: nowrap;
}

.filter-tab:hover {
    color: white;
    background: var(--color-white-5);
}

.filter-tab.is-active {
    color: var(--color-bg);
    background: var(--color-brand);
}

/* Скролл-зона списка */
.tables-scroll {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding-right: 4px;
    margin-right: -4px;
}

/* Кастомный скроллбар */
.tables-scroll::-webkit-scrollbar {
    width: 4px;
}

.tables-scroll::-webkit-scrollbar-thumb {
    background: var(--color-surface-light);
    border-radius: var(--radius-full);
}

.tables-scroll::-webkit-scrollbar-thumb:hover {
    background: #2a2a2a;
}

.tables-scroll::-webkit-scrollbar-track {
    background: transparent;
}

/* Пустое состояние */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    text-align: center;
    color: var(--color-muted);
}
</style>
