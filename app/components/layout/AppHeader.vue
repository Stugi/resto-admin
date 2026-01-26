<script setup lang="ts">
// Используем onMounted, чтобы избежать Hydration Mismatch с датами
const currentTime = ref("--:--")
const currentDate = ref("Загрузка...")

const { formattedDate, nextDay, prevDay } = useDashboardDate()

const changeDate = (delta: number) => {
    console.log("Navigate date:", delta)
}

onMounted(() => {
    const update = () => {
        currentTime.value = new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }
    update()
    setInterval(update, 1000)
})
</script>

<template>
    <header
        class="h-header bg-surface border-b border-white-5 flex items-center justify-between px-6 shrink-0 z-50"
    >
        <!-- ЛОГОТИП: Serif, Resto(white) Admin(gold) -->
        <div class="flex items-center gap-4 cursor-default">
            <div
                class="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/10"
            >
                <span class="text-2xl">🍽️</span>
            </div>
            <h1 class="font-display text-logo font-medium tracking-tight text-white leading-none">
                Resto<span class="text-brand">Admin</span>
            </h1>
        </div>

        <!-- ЦЕНТР: Навигация по дате и Время -->
        <div class="flex items-center gap-10">
            <!-- Контейнер даты: DM Sans -->
            <div
                class="flex items-center gap-4 bg-[#0F0F10] px-4 py-2 rounded-xl border border-white-5 shadow-inner"
            >
                <button
                    @click="prevDay"
                    class="text-muted hover:text-white transition-colors cursor-pointer p-1"
                >
                    <Icon name="bi:caret-left-fill" size="16" />
                </button>

                <span
                    class="font-body font-bold text-sm min-w-[200px] text-center tracking-wide text-white whitespace-nowrap"
                >
                    {{ formattedDate }}
                </span>

                <button
                    @click="nextDay"
                    class="text-muted hover:text-white transition-colors cursor-pointer p-1"
                >
                    <Icon name="bi:caret-right-fill" size="16" />
                </button>
            </div>

            <!-- ВРЕМЯ: Cormorant, Gold, Bold -->
            <div
                class="text-[36px] font-bold font-display text-brand tracking-widest tabular-nums leading-none"
            >
                {{ currentTime }}
            </div>
        </div>

        <!-- ПРАВАЯ ЧАСТЬ: Профиль (DM Sans) -->
        <div class="flex items-center gap-4 font-body">
            <div
                class="flex items-center gap-3 p-1.5 pr-4 bg-surface-light border border-white-5 rounded-2xl hover:border-brand/30 transition-all cursor-pointer group"
            >
                <div
                    class="w-8 h-8 bg-linear-to-br from-emerald-400 to-sky-400 rounded-xl flex items-center justify-center text-[11px] font-white shadow-sm"
                >
                    АН
                </div>
                <div class="flex flex-col leading-tight">
                    <span
                        class="text-[13px] font-bold text-white group-hover:text-brand transition-colors"
                        >Анна Новикова</span
                    >
                    <span class="text-[10px] text-muted font-bold uppercase tracking-widest"
                        >Хостес</span
                    >
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
.font-display {
    font-family: var(--font-display);
}
.font-body {
    font-family: var(--font-body);
}
</style>
<style scoped>
/* Дополнительная страховка для шрифта, если Google Fonts не подтянулись глобально */
.font-display {
    font-family: var(--font-display);
}
.font-body {
    font-family: var(--font-body);
}
</style>
