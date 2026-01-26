<script setup lang="ts">
// Используем onMounted, чтобы избежать Hydration Mismatch с датами
const currentTime = ref("--:--")
const currentDate = ref("Загрузка...")

onMounted(() => {
    const update = () => {
        const now = new Date()
        currentTime.value = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
        currentDate.value = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    }
    update()
    setInterval(update, 1000)
})

const changeDate = (delta: number) => {
    console.log("Navigate date:", delta)
}
</script>

<template>
    <header
        class="h-header bg-surface border-b border-white-5 flex items-center justify-between px-6 shrink-0 z-50"
    >
        <!-- Левая часть: Logo -->
        <div class="flex items-center gap-3">
            <div
                class="w-9 h-9 bg-linear-to-br from-brand to-brand-dim rounded-lg flex items-center justify-center shadow-lg shadow-brand/10"
            >
                <span class="text-xl">🍽️</span>
            </div>
            <h1 class="font-display text-logo font-xl tracking-tight text-white">
                Resto<span class="text-brand not-italic">Admin</span>
            </h1>
        </div>

        <!-- Центр: Навигация и Время -->
        <div class="flex items-center gap-6">
            <!-- Переключатель даты -->
            <div
                class="flex items-center gap-4 bg-surface-light px-4 py-1.5 rounded-xl border border-white-5"
            >
                <button
                    @click="changeDate(-1)"
                    class="text-muted hover:text-white transition-colors cursor-pointer"
                >
                    <Icon name="lucide:chevron-left" size="18" />
                </button>
                <span
                    class="font-body font-bold text-sm min-w-[140px] text-center tracking-wide capitalize"
                >
                    Сегодня, {{ currentDate }}
                </span>
                <button
                    @click="changeDate(1)"
                    class="text-muted hover:text-white transition-colors cursor-pointer"
                >
                    <Icon name="lucide:chevron-right" size="18" />
                </button>
            </div>

            <!-- Время -->
            <div class="text-3xl font-bold font-display text-brand tracking-[0.1em] tabular-nums">
                {{ currentTime }}
            </div>
        </div>

        <!-- Правая часть: Юзер -->
        <div class="flex items-center gap-4">
            <div
                class="flex items-center gap-3 p-1 pr-3 bg-surface-light border border-white-5 rounded-xl hover:border-brand/30 transition-all cursor-pointer group"
            >
                <!-- Аватар с градиентом из прототипа -->
                <div
                    class="w-8 h-8 bg-linear-to-br from-emerald-400 to-sky-400 rounded-lg flex items-center justify-center text-white text-xs"
                >
                    АН
                </div>
                <div class="flex flex-col leading-tight">
                    <span
                        class="text-sm font-bold text-white group-hover:text-brand transition-colors"
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
/* Дополнительная страховка для шрифта, если Google Fonts не подтянулись глобально */
.font-display {
    font-family: var(--font-display);
}
.font-body {
    font-family: var(--font-body);
}
</style>
