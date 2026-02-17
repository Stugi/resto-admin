<script setup lang="ts">
const store = useDashboardStore()
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
        class="h-header bg-surface border-b border-white-5 flex items-center justify-between px-4 lg:px-6 shrink-0 z-50"
    >
        <!-- ЛЕВАЯ ЧАСТЬ: Логотип -->
        <div class="flex items-center gap-4 cursor-default">
            <div class="logo-icon">
                <span class="text-2xl">🍽️</span>
            </div>
            <!-- Logo: 28px (text-3xl) Cormorant -->
            <h1 class="font-display text-3xl font-semibold tracking-tight text-white">
                Resto<span class="logo-text-gradient">Admin</span>
            </h1>
        </div>

        <!-- ЦЕНТР: Навигация по дате и Время (только десктоп) -->
        <div class="hidden lg:flex items-center gap-10">
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

        <!-- ПРАВАЯ ЧАСТЬ: Профиль (только десктоп) -->
        <div class="hidden lg:flex items-center gap-4">
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

        <!-- ГАМБУРГЕР: только мобайл -->
        <button
            class="flex lg:hidden w-10 h-10 bg-surface-light border border-white-5 rounded-xl items-center justify-center cursor-pointer"
            @click="store.openMobileMenu()"
        >
            <Icon name="lucide:menu" class="w-5 h-5" />
        </button>
    </header>
</template>

<style scoped>
.logo-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-brand), var(--color-brand-dim));
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color-brand) 20%, transparent);
}

.logo-text-gradient {
    background: linear-gradient(135deg, var(--color-brand-light), var(--color-brand), var(--color-brand-dim));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
</style>
