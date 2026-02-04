<script setup lang="ts">
/**
 * ZoneTabs — переключатель зон ресторана
 *
 * 🎓 NUXT + TS ЗАМЕТКИ:
 *
 * 1. defineProps<T>() — типизация пропсов через generic
 *    Nuxt автоимпортирует defineProps, не нужен import
 *
 * 2. defineEmits<T>() — типизация событий
 *    Строгая типизация: emit('change', zoneId) проверит тип zoneId
 *
 * 3. computed() — реактивные вычисляемые свойства
 *    Кешируются и пересчитываются только при изменении зависимостей
 */

import type { Zone } from '@prisma/client'

// ✅ Типизация пропсов через interface
interface Props {
    zones: Zone[]              // Массив зон из БД
    activeZoneId: string | null  // ID текущей активной зоны
}

// ✅ defineProps с дефолтными значениями
const props = withDefaults(defineProps<Props>(), {
    zones: () => [],
    activeZoneId: null
})

// ✅ Типизация событий — какие события компонент может emit'ить
interface Emits {
    (event: 'change', zoneId: string): void
}

const emit = defineEmits<Emits>()

// ✅ Computed — находим активную зону для подсветки
const activeZone = computed(() =>
    props.zones.find(z => z.id === props.activeZoneId)
)

// ✅ Метод с типизацией параметра
function selectZone(zoneId: string) {
    emit('change', zoneId)
}
</script>

<template>
    <div class="flex items-center gap-2">
        <!--
            🎓 v-for с типизацией:
            - zone автоматически получит тип Zone благодаря типизации props.zones
            - :key обязателен для оптимизации рендеринга Vue
        -->
        <button
            v-for="zone in props.zones"
            :key="zone.id"
            class="zone-tab px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="{
                'zone-tab--active': zone.id === props.activeZoneId,
                'zone-tab--inactive': zone.id !== props.activeZoneId
            }"
            @click="selectZone(zone.id)"
        >
            {{ zone.name }}
        </button>
    </div>
</template>

<style scoped>
/*
  🎓 Scoped styles:
  - Применяются ТОЛЬКО к этому компоненту
  - Vue добавляет уникальный атрибут [data-v-xxxxx] к элементам
*/

.zone-tab {
    border: 1px solid var(--color-white-5);
    background: var(--color-surface);
}

.zone-tab--inactive {
    color: var(--color-muted);
}

.zone-tab--inactive:hover {
    background: var(--color-surface-light);
    color: var(--color-text-primary);
    border-color: var(--color-brand);
}

.zone-tab--active {
    background: var(--color-brand);
    border-color: var(--color-brand);
    color: var(--color-bg);
    font-weight: 600;
}
</style>
