<script setup lang="ts">
import type { TableWithStatus } from "~~/types"
import { formatPhone } from "~/composables/usePhoneMask"

// Props & Emits
const props = defineProps<{
    table: TableWithStatus
    selectedTableId: string | null
}>()

const emit = defineEmits<{
    (e: "selectTable", tableId: string | null): void
}>()

// Data
const statusClasses = computed(() => ({
    "bg-success shadow-success/80": props.table.status === "free",
    "bg-warning shadow-warning/80": props.table.status === "reserved",
    "bg-danger shadow-danger/80": props.table.status === "busy",
}))

const isSelected = computed(() => props.table.id === props.selectedTableId)

/** Гость из ближайшей брони (для занятых/забронированных столов) */
const currentGuest = computed(() => props.table.reservations?.[0]?.guest ?? null)

// Methods
const handleSelectTable = (tableId: string) => {
    if (props.selectedTableId === tableId) {
        emit("selectTable", null)
    } else {
        emit("selectTable", tableId)
    }
}
</script>

<template>
    <div
        @click="handleSelectTable(table.id)"
        class="group relative aspect-square bg-surface border border-white-5 rounded-3xl flex flex-col items-center justify-center p-6 hover:border-brand/40 transition-all cursor-pointer shadow-sm hover:shadow-2xl"
        :class="isSelected ? 'border-brand ring-1 ring-brand' : 'border-white-5'"
    >
        <!-- Индикатор статуса через computed -->
        <div
            class="absolute top-4 right-4 w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors duration-500"
            :class="statusClasses"
        ></div>

        <span class="text-3xl font-black mb-1">{{ table.name }}</span>
        <div class="text-muted text-2xs font-bold uppercase tracking-widest">
            {{ table.capacity }} места
        </div>

        <!-- Гость (для занятых/забронированных столов) -->
        <div v-if="table.status !== 'free' && currentGuest" class="mt-2 text-center w-full min-w-0 px-1">
            <p class="text-2xs font-semibold text-white truncate">{{ currentGuest.name }}</p>
            <p class="text-[10px] text-muted truncate">{{ formatPhone(currentGuest.phone) }}</p>
        </div>
    </div>
</template>
