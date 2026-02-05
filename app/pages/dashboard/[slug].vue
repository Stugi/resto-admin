<script setup lang="ts">
import type { ZoneElement } from '~~/types'

/**
 * 🎓 NUXT + TS — Страница дашборда ресторана
 *
 * Ключевые концепции:
 * 1. Pinia Store — централизованное хранилище состояния
 * 2. Composables — переиспользуемая логика (useDashboardDate, useToast)
 * 3. Route params — динамические параметры из URL ([slug])
 * 4. watch() — реактивное отслеживание изменений
 * 5. await в <script setup> — SSR-совместимая загрузка данных
 */

const store = useDashboardStore()
const { selectedDate } = useDashboardDate()
const { showToast } = useToast()

/**
 * 🎓 Типизированный роут благодаря experimental.typedPages
 *
 * useRoute('dashboard-slug') возвращает роут с типизированными params
 * route.params.slug уже string, не нужен `as string`
 */
const route = useRoute('dashboard-slug')
const slug = route.params.slug

// Инициализируем store с текущим рестораном
store.setRestaurant({ slug, name: slug })

// 🎓 await в <script setup> работает благодаря Nuxt Suspense
// Данные загружаются на сервере (SSR) перед рендерингом
await store.fetchData(selectedDate.value)

// 🎓 createError — Nuxt хелпер для 404/500 страниц
if (store.error || !store.zones.length) {
    throw createError({
        statusCode: 404,
        message: `Ресторан "${slug}" не найден`,
    })
}

// ============ METHODS ============

// 🎓 Типизация параметра: tableId может быть string или null
const handleSelectTable = (tableId: string | null) => {
    store.selectTable(tableId)
}

// 🎓 Смена зоны — сбрасываем выбранный стол
const handleZoneChange = (zoneId: string) => {
    store.selectTable(null) // Сбрасываем выбор при смене зоны
    store.setActiveZone(zoneId)
}

// 🎓 async функция — после успеха обновляем данные
const handleSuccess = async () => {
    store.selectTable(null)
    await store.fetchData(selectedDate.value)
    showToast("Бронирование создано!", "success")
}

// ============ WATCHERS ============

// 🎓 watch() — реактивно следит за изменением selectedDate
// При смене даты в header — перезагружаем данные
watch(selectedDate, async (newDate) => {
    await store.fetchData(newDate)
}, { immediate: false }) // immediate: false — не запускать при монтировании

// SEO
useSeoMeta({
    ogTitle: "RestoAdmin - Умное бронирование",
    description: "Профессиональная система управления столами и гостями.",
    ogDescription: "Лучший инструмент для вашего ресторана.",
    ogImage: "https://mysite.com/logo.png",
    twitterCard: "summary_large_image",
})

useHead({
    title: `Resto | ${slug}`,
    titleTemplate: (title) => `${title} | Карта зала`,
    link: [{ rel: "icon", type: "image/x-icon", href: "/logo.ico" }],
})

definePageMeta({
    requiresRestaurantContext: true,
    validateRestaurant: true,
})
</script>
<template>
    <div class="flex flex-col h-full">
        <TimeSlider />
        <div class="flex h-full overflow-hidden">
            <!-- 1. ЛЕВАЯ ПАНЕЛЬ — Новый сайдбар со списком столов -->
            <aside class="w-sidebar border-r border-white-5 flex flex-col shrink-0 bg-bg">
                <DashboardSidebar />
            </aside>

            <!-- 2. ЦЕНТРАЛЬНАЯ ЧАСТЬ -->
            <main class="flex-1 flex flex-col min-w-0">
                <!-- Header с табами зон -->
                <div class="flex items-center justify-between px-6 py-4 border-b border-white-5 bg-bg">
                    <!--
                        🎓 Передаём props в компонент:
                        - :zones — реактивная привязка массива зон из store
                        - :active-zone-id — kebab-case в template = camelCase в props
                        - @change — слушаем событие 'change' от компонента
                    -->
                    <ZoneTabs
                        :zones="store.zones"
                        :active-zone-id="store.activeZoneId"
                        @change="handleZoneChange"
                    />

                    <!-- Кнопки управления видом -->
                    <div class="flex gap-1 p-1 bg-surface rounded-lg border border-white-5">
                        <button
                            class="view-btn"
                            :class="{ 'is-active': store.viewMode === 'grid' }"
                            title="Карточки"
                            @click="store.setViewMode('grid')"
                        >
                            <Icon name="lucide:layout-grid" class="w-4 h-4" />
                        </button>
                        <button
                            class="view-btn"
                            :class="{ 'is-active': store.viewMode === 'schema' }"
                            title="Схема зала"
                            @click="store.setViewMode('schema')"
                        >
                            <Icon name="lucide:map" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <!-- Карта столов -->
                <div class="flex-1 overflow-hidden p-safe">
                    <!-- Индикатор загрузки -->
                    <div v-if="store.isLoading" class="flex items-center justify-center h-full">
                        <div class="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full"></div>
                    </div>

                    <!-- Grid вид (карточки) -->
                    <div v-else-if="store.viewMode === 'grid'" class="h-full overflow-y-auto scrollbar-thin p-1">
                        <TableMap
                            :tables="store.currentZone?.tables || []"
                            :selected-table-id="store.selectedTableId"
                            @selectTable="handleSelectTable"
                        />
                    </div>

                    <!-- Schema вид (схема зала) -->
                    <FloorSchema
                        v-else
                        :tables="store.currentZone?.tables || []"
                        :elements="(store.currentZone?.elements as ZoneElement[]) || []"
                        :selected-table-id="store.selectedTableId"
                        @selectTable="handleSelectTable"
                    />
                </div>
            </main>

            <!-- 3. ПРАВАЯ ПАНЕЛЬ -->
            <DashboardRightSidebar @success="handleSuccess" />
        </div>
    </div>
</template>

<style scoped>
.view-btn {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    color: var(--color-muted);
    transition: all var(--duration-fast) var(--ease-out);
}

.view-btn:hover {
    color: white;
    background: var(--color-white-5);
}

.view-btn.is-active {
    color: var(--color-bg);
    background: var(--color-brand);
}
</style>
