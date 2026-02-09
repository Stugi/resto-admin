<!-- app/components/dashboard/DashboardRightSidebar.vue -->
<!--
  🎓 Правый сайдбар дашборда

  Структура:
  1. AI Подсказка (заглушка)
  2. Форма бронирования (если стол выбран)
  3. Список гостей на выбранную дату (все брони)
-->
<script setup lang="ts">
const store = useDashboardStore()

const emit = defineEmits<{
    (e: "success"): void
}>()
</script>

<template>
    <aside
        class="w-panel border-l border-white-5 bg-surface shrink-0 flex flex-col overflow-hidden"
    >
        <div class="p-safe flex flex-col h-full gap-5">
            <!-- 1. AI Подсказка -->
            <AiHintPlaceholder />

            <!-- 2. Форма бронирования (если стол выбран) -->
            <div
                v-if="store.selectedTable"
                class="animate-in fade-in slide-in-from-right-4 duration-300"
            >
                <BookingForm
                    :table="store.selectedTable"
                    @success="emit('success')"
                    @cancel="store.selectTable(null)"
                />
            </div>

            <!-- 3. Список гостей на дату -->
            <div class="flex-1 overflow-y-auto scrollbar-thin">
                <ReservationSidebarList :reservations="store.reservations" />
            </div>
        </div>
    </aside>
</template>
