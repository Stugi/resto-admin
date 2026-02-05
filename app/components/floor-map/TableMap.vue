<!-- components/TableMap.vue -->
<script setup lang="ts">
import type { TableWithStatus } from "~~/types"

defineProps<{
    tables: TableWithStatus[]
    selectedTableId: string | null
}>()

const emit = defineEmits<{
    (e: "selectTable", tableId: string | null): void
}>()
</script>

<template>
    <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-1"
    >
        <TableCard
            v-for="table in tables"
            :key="table.id"
            :table="table"
            :selected-table-id="selectedTableId"
            @selectTable="emit('selectTable', $event)"
        />
    </div>
</template>
