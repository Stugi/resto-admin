<script setup lang="ts">
const store = useDashboardStore()
const { selectedDate } = useDashboardDate()

const labels = ["12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00"]

// Heatmap данные из store (реальные данные на основе бронирований)
const heatmapSegments = computed(() => {
    return store.hourlyLoad.map(segment => ({
        ...segment,
        height: Math.max(4, segment.load * 0.32) // минимум 4px, максимум ~32px
    }))
})

const thumbPosition = computed(() => {
    return ((store.viewTimeValue - 12) / (23.75 - 12)) * 100
})

function jumpToHour(hour: number) {
    store.setViewTime(hour)
}

// Статистика из store (реальные данные)
const stats = computed(() => store.tableStats)

// При изменении viewTime — обновляем статусы столов
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => store.viewTimeValue, () => {
    // Debounce для оптимизации
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        store.refreshTableStatuses(selectedDate.value)
    }, 300)
})
</script>

<template>
    <div class="bg-surface border-b border-white-5 px-6 py-4">
        <div class="flex items-center gap-5">
            <!-- Текст слева -->
            <div class="flex flex-col shrink-0">
                <span class="text-2xs uppercase font-bold text-muted tracking-widest"
                    >Просмотр на</span
                >
                <span class="font-serif text-lg font-bold text-brand leading-none mt-1">
                    {{ store.viewTime }}
                </span>
            </div>

            <!-- Сама область слайдера -->
            <div class="flex-1 flex flex-col gap-1.5">
                <div
                    class="relative h-10 bg-surface-light rounded-lg border border-white-5 overflow-hidden"
                >
                    <!-- 1. Тепловая карта (Heatmap) -->
                    <div class="absolute inset-0 flex">
                        <div
                            v-for="segment in heatmapSegments"
                            :key="segment.hour"
                            class="heatmap-segment flex-1 flex flex-col items-center justify-end pb-0.5 cursor-pointer hover:bg-white/5 transition-colors relative"
                            @click="jumpToHour(segment.hour)"
                        >
                            <!-- Час сверху -->
                            <span class="absolute top-0.5 text-[9px] text-muted">
                                {{ segment.hour }}
                            </span>
                            <!-- Бар загрузки -->
                            <div
                                class="heatmap-bar w-[70%] rounded-t-sm transition-all duration-300"
                                :class="{
                                    'bg-success': segment.level === 'low',
                                    'bg-amber-400': segment.level === 'medium',
                                    'bg-rose-400': segment.level === 'high',
                                    'bg-danger': segment.level === 'peak'
                                }"
                                :style="{ height: `${segment.height}px` }"
                            ></div>
                        </div>
                    </div>

                    <!-- 2. Невидимый Input Range (управление) -->
                    <input
                        type="range"
                        v-model.number="store.viewTimeValue"
                        min="12"
                        max="23.75"
                        step="0.25"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />

                    <!-- 3. Визуальный бегунок (Золотая линия) -->
                    <div
                        class="absolute top-0 bottom-0 w-[3px] bg-brand z-10 shadow-[0_0_10px_var(--color-brand)] pointer-events-none transition-all duration-75"
                        :style="{ left: `${thumbPosition}%` }"
                    >
                        <!-- Треугольник сверху -->
                        <div
                            class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-brand"
                        ></div>
                    </div>
                </div>

                <!-- Подписи часов -->
                <div class="flex justify-between px-1">
                    <span
                        v-for="label in labels"
                        :key="label"
                        class="text-[10px] text-muted"
                    >
                        {{ label }}
                    </span>
                </div>
            </div>

            <!-- Статистика справа (3 колонки как в прототипе) -->
            <div class="flex gap-4 pl-4 border-l border-white-5 shrink-0">
                <div class="text-center">
                    <p class="text-xl font-serif font-bold text-success tabular-nums">{{ stats.available }}</p>
                    <p class="text-[10px] text-muted">Свободно</p>
                </div>
                <div class="text-center">
                    <p class="text-xl font-serif font-bold text-warning tabular-nums">{{ stats.reserved }}</p>
                    <p class="text-[10px] text-muted">Бронь</p>
                </div>
                <div class="text-center">
                    <p class="text-xl font-serif font-bold text-danger tabular-nums">{{ stats.occupied }}</p>
                    <p class="text-[10px] text-muted">Занято</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Убираем стандартные стили слайдера */
input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 40px;
}

input[type="range"]::-moz-range-thumb {
    appearance: none;
    width: 20px;
    height: 40px;
    border: none;
    background: transparent;
}
</style>
