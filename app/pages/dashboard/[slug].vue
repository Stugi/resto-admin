<script setup lang="ts">
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
const route = useRoute()

// 🎓 route.params типизируется автоматически благодаря имени файла [slug].vue
// `as string` нужен потому что params может быть string | string[]
const slug = route.params.slug as string

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

                    <!-- Кнопки управления видом (как в прототипе) -->
                    <div class="flex gap-2">
                        <button
                            class="w-9 h-9 rounded-lg border border-white-5 bg-surface flex items-center justify-center text-muted hover:border-brand hover:text-brand transition-colors"
                            title="Схема"
                        >
                            <Icon name="lucide:layout-grid" class="w-4 h-4" />
                        </button>
                        <button
                            class="w-9 h-9 rounded-lg border border-white-5 bg-surface flex items-center justify-center text-muted hover:border-brand hover:text-brand transition-colors"
                            title="3D"
                        >
                            <Icon name="lucide:box" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <!-- Карта столов -->
                <div class="flex-1 overflow-y-auto p-safe scrollbar-thin">
                    <div class="space-y-8">
                        <!-- Индикатор загрузки -->
                        <div v-if="store.isLoading" class="flex items-center justify-center py-20">
                            <div class="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full"></div>
                        </div>
                        <!-- TableMap -->
                        <TableMap
                            v-else
                            :tables="store.currentZone?.tables || []"
                            :selected-table-id="store.selectedTableId"
                            @selectTable="handleSelectTable"
                        />
                    </div>
                </div>
            </main>

            <!-- 3. ПРАВАЯ ПАНЕЛЬ -->
            <aside
                class="w-panel border-l border-white-5 bg-surface shrink-0 overflow-y-auto p-safe relative"
            >
                <div
                    v-if="store.selectedTable"
                    class="animate-in fade-in slide-in-from-right-4 duration-300"
                >
                    <h2
                        class="text-2xl font-black italic text-brand uppercase tracking-tighter mb-8"
                    >
                        Стол {{ store.selectedTable.name }}
                    </h2>
                    <BookingForm
                        :table="store.selectedTable"
                        @success="handleSuccess"
                        @cancel="store.selectTable(null)"
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
    </div>
</template>
