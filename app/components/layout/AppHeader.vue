<script setup lang="ts">
const currentTime = ref("--:--")

const { formattedDate, nextDay, prevDay } = useDashboardDate()

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
        <!-- ЛЕВАЯ ЧАСТЬ: Логотип -->
        <div class="flex items-center gap-4 cursor-default">
            <div
                class="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/10"
            >
                <span class="text-2xl">🍽️</span>
            </div>
            <!-- Logo: 28px (text-3xl) Cormorant -->
            <h1 class="font-display text-3xl font-semibold tracking-tight text-white">
                Resto<span class="text-brand">Admin</span>
            </h1>
        </div>

        <!-- ЦЕНТР: Навигация по дате и Время -->
        <div class="flex items-center gap-10">
            <!-- Дата -->
            <div class="flex items-center gap-4 bg-bg px-4 py-2 rounded-xl border border-white-5">
                <button
                    @click="prevDay"
                    class="text-muted hover:text-white transition-colors cursor-pointer p-1"
                >
                    <Icon name="bi:caret-left-fill" size="16" />
                </button>

                <!-- Date text: 14px (text-sm) DM Sans -->
                <span
                    class="text-sm font-semibold min-w-[200px] text-center text-white whitespace-nowrap"
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

            <!-- Время: 32px (text-4xl) Cormorant Gold -->
            <time class="font-display text-4xl font-bold text-brand tracking-tight tabular-nums">
                {{ currentTime }}
            </time>
        </div>

        <!-- ПРАВАЯ ЧАСТЬ: Профиль -->
        <div class="flex items-center gap-4">
            <div
                class="flex items-center gap-3 p-1.5 pr-4 bg-surface-light border border-white-5 rounded-2xl hover:border-brand/30 transition-all cursor-pointer group"
            >
                <!-- Avatar -->
                <div
                    class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-sky-400 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm"
                >
                    АН
                </div>
                <div class="flex flex-col">
                    <!-- Name: 14px (text-sm) -->
                    <span
                        class="text-sm font-semibold text-white group-hover:text-brand transition-colors"
                    >
                        Анна Новикова
                    </span>
                    <!-- Role: 10px (text-2xs) uppercase -->
                    <span class="text-2xs font-semibold text-muted uppercase tracking-widest">
                        Хостес
                    </span>
                </div>
            </div>
        </div>
    </header>
</template>
