<!-- app/components/dashboard/DashboardRightSidebar.vue -->
<!--
  🎓 Правый сайдбар дашборда

  Структура:
  1. AI Подсказка (заглушка)
  2. Табы: Бронь / Список
  3. Контент таба:
     - Бронь → BookingForm (если стол выбран) или пустое состояние
     - Список → ReservationSidebarList (все брони дня)
-->
<script setup lang="ts">
const store = useDashboardStore()

const emit = defineEmits<{
    (e: 'success'): void
}>()

const tabs = [
    { id: 'booking' as const, label: 'Бронь', icon: 'lucide:calendar-plus' },
    { id: 'list' as const, label: 'Список', icon: 'lucide:list' },
]
</script>

<template>
    <aside class="w-panel border-l border-white-5 bg-surface shrink-0 flex flex-col overflow-hidden">
        <div class="p-safe flex flex-col h-full gap-5">
            <!-- 1. AI Подсказка -->
            <AiHintPlaceholder />

            <!-- 2. Табы -->
            <div class="flex gap-1 p-1 bg-bg rounded-lg border border-white-5">
                <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    class="sidebar-tab"
                    :class="{ 'is-active': store.rightSidebarTab === tab.id }"
                    @click="store.setRightSidebarTab(tab.id)"
                >
                    <Icon :name="tab.icon" class="w-4 h-4" />
                    <span>{{ tab.label }}</span>
                </button>
            </div>

            <!-- 3. Контент -->
            <div class="flex-1 overflow-y-auto scrollbar-thin">
                <!-- Tab: Бронь -->
                <template v-if="store.rightSidebarTab === 'booking'">
                    <div
                        v-if="store.selectedTable"
                        class="animate-in fade-in slide-in-from-right-4 duration-300"
                    >
                        <h2 class="text-2xl font-black italic text-brand uppercase tracking-tighter mb-8">
                            Стол {{ store.selectedTable.name }}
                        </h2>
                        <BookingForm
                            :table="store.selectedTable"
                            @success="emit('success')"
                            @cancel="store.selectTable(null)"
                        />
                    </div>

                    <!-- Пустое состояние -->
                    <div
                        v-else
                        class="h-full flex flex-col items-center justify-center opacity-20 italic text-sm text-center"
                    >
                        <div
                            class="w-12 h-12 border border-dashed border-muted rounded-full flex items-center justify-center mb-4"
                        >
                            <Icon name="lucide:mouse-pointer-click" class="text-xl text-muted" />
                        </div>
                        Выберите стол на карте
                    </div>
                </template>

                <!-- Tab: Список -->
                <template v-else>
                    <ReservationSidebarList :reservations="store.reservations" />
                </template>
            </div>
        </div>
    </aside>
</template>

<style scoped>
.sidebar-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2) var(--spacing-3);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
    color: var(--color-muted);
    transition: all var(--duration-fast) var(--ease-out);
}

.sidebar-tab:hover {
    color: white;
    background: var(--color-white-5);
}

.sidebar-tab.is-active {
    color: var(--color-bg);
    background: var(--color-brand);
}
</style>
