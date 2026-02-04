<script setup lang="ts">
import { TABLE_STATUSES } from "~/constants/tableStatuses"
</script>

<template>
    <div class="flex flex-wrap gap-x-2.5 gap-y-1">
        <div v-for="status in TABLE_STATUSES" :key="status.key" class="flex items-center gap-0.5">
            <span class="w-1 h-1 rounded-full me-1" :class="status.color" />
            <span class="legend-label">{{ status.label }}</span>
        </div>
    </div>
</template>

<style scoped>
.legend-label {
    font-size: var(--font-size-sm);
    color: var(--color-muted);
    opacity: 0.6;
    letter-spacing: 0.02em;
}
</style>
