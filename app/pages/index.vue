<script setup lang="ts">
import type { ZoneWithTables } from "~~/types"
// Ref
const { data: zones } = await useFetch<ZoneWithTables[]>("/api/zones")
const { data: reservations, refresh: refreshReservations } = await useFetch("/api/reservations")

const activeZoneId = ref<string | null>(null)
const selectedTableId = ref<string | null>(null)
const isMounted = ref<boolean>(false)

const { showToast } = useToast()

// Computed
const selectedTable = computed(() =>
    zones.value?.flatMap((z) => z.tables).find((t) => t.id === selectedTableId.value),
)

const currentZone = computed(() => zones.value?.find((z) => z.id === activeZoneId.value))

// Methods
const handleSelectTable = (tableId: string | null) => {
    selectedTableId.value = tableId
}

const handleSuccess = async () => {
    selectedTableId.value = null
    await Promise.all([refreshNuxtData(), refreshReservations()])
    showToast("Бронирование создано!", "success")
}

// Watches
watchEffect(() => {
    if (zones.value?.length && !activeZoneId.value) {
        activeZoneId.value = zones.value[0]?.id ?? null
    }
})

onMounted(() => {
    isMounted.value = true
})
// SEO-оптимизация
useHead({
    title: "RestoAdmin — Карта столов",
})
</script>
<template>
    <div class="flex h-full overflow-hidden">
        <!-- 1. ЛЕВАЯ ПАНЕЛЬ -->
        <aside class="w-sidebar border-r border-white-5 flex flex-col shrink-0 bg-bg">
            <div
                class="h-header flex items-center px-6 border-b border-white-5 text-brand font-black italic tracking-tighter text-xl uppercase"
            >
                RestoAdmin
            </div>
            <div class="p-6 space-y-8 overflow-y-auto scrollbar-thin">
                <!-- Блок статистики -->
                <section class="space-y-4">
                    <p class="text-2xs uppercase tracking-widest text-muted font-bold">
                        Брони на сегодня
                    </p>
                    <div class="text-3xl font-bold italic">
                        24
                        <span class="text-sm text-success font-medium not-italic ml-2">↑ 15%</span>
                    </div>
                </section>
                <ReservationSidebarList :reservations="reservations" />
            </div>
        </aside>

        <!-- 2. ЦЕНТРАЛЬНАЯ ЧАСТЬ -->
        <main class="flex-1 flex flex-col min-w-0">
            <div class="flex-1 overflow-y-auto p-safe scrollbar-thin">
                <div class="space-y-8">
                    <!-- Здесь твои табы и TableMap -->
                    <TableMap
                        :tables="currentZone?.tables || []"
                        :selected-table-id="selectedTableId"
                        @selectTable="handleSelectTable"
                    />
                </div>
            </div>
        </main>

        <!-- 3. ПРАВАЯ ПАНЕЛЬ -->
        <aside
            class="w-panel border-l border-white-5 bg-surface shrink-0 overflow-y-auto p-safe relative"
        >
            <div v-if="selectedTable" class="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 class="text-2xl font-black italic text-brand uppercase tracking-tighter mb-8">
                    Стол {{ selectedTable.name }}
                </h2>
                <BookingForm
                    :table="selectedTable"
                    @success="handleSuccess"
                    @cancel="selectedTableId = null"
                />
            </div>
            <div
                v-else
                class="h-full flex flex-col items-center justify-center opacity-20 italic text-sm text-center"
            >
                <div
                    class="w-12 h-12 border border-dashed border-muted rounded-full flex items-center justify-center mb-4 text-xl"
                >
                    +
                </div>
                Выберите стол на карте
            </div>
        </aside>
    </div>
</template>
