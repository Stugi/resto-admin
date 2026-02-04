<script setup lang="ts">
const store = useDashboardStore()
const { selectedDate } = useDashboardDate()
const { showToast } = useToast()
const route = useRoute()

// Ref & Computed
const slug = route.params.slug as string

// Инициализируем store с текущим рестораном
store.setRestaurant({ slug, name: slug })

// Загружаем данные при монтировании
await store.fetchData(selectedDate.value)

// Если зоны не загрузились — 404
if (store.error || !store.zones.length) {
    throw createError({
        statusCode: 404,
        message: `Ресторан "${slug}" не найден`,
    })
}

// Methods
const handleSelectTable = (tableId: string | null) => {
    store.selectTable(tableId)
}

const handleSuccess = async () => {
    store.selectTable(null)
    await store.fetchData(selectedDate.value)
    showToast("Бронирование создано!", "success")
}

// При смене даты — перезагружаем данные
watch(selectedDate, async (newDate) => {
    await store.fetchData(newDate)
}, { immediate: false })

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
            <!-- 1. ЛЕВАЯ ПАНЕЛЬ -->
            <aside class="w-sidebar border-r border-white-5 flex flex-col shrink-0 bg-bg">
                <div class="p-6 space-y-8 overflow-y-auto scrollbar-thin">
                    <!-- Блок статистики -->
                    <section class="space-y-4">
                        <p class="text-2xs uppercase tracking-widest text-muted font-bold">
                            Брони на сегодня
                        </p>
                        <div class="text-3xl font-bold italic">
                            {{ store.reservations.length }}
                            <span class="text-sm text-success font-medium not-italic ml-2"
                                >↑ 15%</span
                            >
                        </div>
                    </section>
                    <ReservationSidebarList :reservations="store.reservations" />
                </div>
            </aside>

            <!-- 2. ЦЕНТРАЛЬНАЯ ЧАСТЬ -->
            <main class="flex-1 flex flex-col min-w-0">
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
