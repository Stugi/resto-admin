<!-- app/components/dashboard/DashboardRightSidebar.vue -->
<!--
  🎓 Правый сайдбар дашборда

  Два режима:
  A. Форма бронирования — занимает весь сайдбар, кнопки sticky внизу
  B. AI Подсказка + список гостей на дату
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
        <!-- A. Форма бронирования — занимает весь сайдбар -->
        <div
            v-if="store.bookingTable"
            class="flex-1 overflow-y-auto scrollbar-thin p-safe animate-in fade-in slide-in-from-right-4 duration-300"
        >
            <BookingForm
                :table="store.bookingTable"
                @success="emit('success')"
                @cancel="store.cancelBooking()"
            />
        </div>

        <!-- B. AI Подсказка + список гостей -->
        <div v-else class="p-safe flex flex-col h-full gap-5">
            <AiHintPlaceholder />

            <div class="flex-1 overflow-y-auto scrollbar-thin">
                <ReservationSidebarList :reservations="store.reservations" />
            </div>
        </div>
    </aside>
</template>
