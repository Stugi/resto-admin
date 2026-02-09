<script setup lang="ts">
const store = useDashboardStore()
</script>

<template>
    <div class="flex gap-3 px-4 py-3 bg-bg">
        <!-- Свободно -->
        <div class="stat-chip">
            <span class="w-2 h-2 rounded-full bg-success" />
            <span>{{ store.tableStats.available }} свободно</span>
        </div>
        <!-- Забронировано -->
        <div class="stat-chip">
            <span class="w-2 h-2 rounded-full bg-warning" />
            <span>{{ store.tableStats.reserved }} бронь</span>
        </div>
        <!-- Сидят -->
        <div class="stat-chip">
            <span class="w-2 h-2 rounded-full bg-danger" />
            <span>{{ store.tableStats.occupied }} сидят</span>
        </div>
    </div>
</template>

<style scoped>
.stat-chip {
    display: flex;
    align-items: center;
    gap: var(--spacing-1_5);
    padding: var(--spacing-1_5) var(--spacing-3);
    background: var(--color-surface);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: white;
}
</style>
