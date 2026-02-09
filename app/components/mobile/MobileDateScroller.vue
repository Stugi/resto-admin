<script setup lang="ts">
import { addDays, format, isSameDay, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'

const { selectedDate } = useDashboardDate()

/** Генерируем массив дат: от -1 до +6 дней */
const dates = computed(() => {
    const today = new Date()
    return Array.from({ length: 8 }, (_, i) => addDays(today, i - 1))
})

/** Формат дня недели для чипа */
function weekdayLabel(date: Date): string {
    if (isToday(date)) return 'Сегодня'
    return format(date, 'EEEEEE', { locale: ru }).toUpperCase()
}

/** Выбрать дату */
function selectDate(date: Date) {
    selectedDate.value = date
}

/** Скролл к активной дате при монтировании */
const scrollContainer = ref<HTMLElement | null>(null)

onMounted(() => {
    nextTick(() => {
        const activeEl = scrollContainer.value?.querySelector('.is-active')
        activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'center' })
    })
})
</script>

<template>
    <section class="bg-surface border-b border-border px-4 py-3">
        <div
            ref="scrollContainer"
            class="flex gap-2 overflow-x-auto scrollbar-none"
        >
            <button
                v-for="date in dates"
                :key="date.toISOString()"
                class="date-chip"
                :class="{
                    'is-active': isSameDay(date, selectedDate),
                    'is-today': isToday(date),
                }"
                @click="selectDate(date)"
            >
                <span class="date-chip-day">{{ date.getDate() }}</span>
                <span class="date-chip-weekday">{{ weekdayLabel(date) }}</span>
            </button>
        </div>
    </section>
</template>

<style scoped>
.date-chip {
    flex-shrink: 0;
    min-width: 64px;
    padding: var(--spacing-2_5) var(--spacing-3);
    background: var(--color-surface-light);
    border: 2px solid transparent;
    border-radius: var(--radius-lg);
    text-align: center;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-out);
}

.date-chip.is-active {
    background: var(--color-brand);
    border-color: var(--color-brand);
}

.date-chip-day {
    display: block;
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: white;
    line-height: 1.2;
}

.date-chip.is-active .date-chip-day {
    color: var(--color-bg);
}

.date-chip-weekday {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--color-muted);
    letter-spacing: var(--letter-spacing-wide);
}

.date-chip.is-active .date-chip-weekday {
    color: var(--color-bg);
}

.date-chip.is-today .date-chip-weekday {
    color: var(--color-brand);
    font-weight: 600;
}

.date-chip.is-active.is-today .date-chip-weekday {
    color: var(--color-bg);
}
</style>
