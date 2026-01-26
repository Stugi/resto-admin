<!-- app/components/AppHeader.vue -->
<script setup lang="ts">
// В будущем сюда добавим логику тикающих часов и выбора даты
const currentTime = ref("13:35")
const currentDate = ref("Сегодня, 21 января")
</script>

<template>
    <header
        class="h-header border-b border-white-5 bg-bg flex items-center justify-between px-safe shrink-0 z-50"
    >
        <!-- Левая часть: Лого -->
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20"
            >
                <span class="text-black text-2xl">🍽️</span>
            </div>
            <h1 class="text-brand text-xl font-black italic tracking-tighter uppercase">
                RestoAdmin
            </h1>
        </div>

        <!-- Центр: Навигация по дате -->
        <div class="flex items-center gap-6">
            <div
                class="flex items-center gap-4 bg-surface-light px-4 py-2 rounded-xl border border-white-5"
            >
                <button class="text-muted hover:text-white">◀</button>
                <span class="text-sm font-bold tracking-tight">{{ currentDate }}</span>
                <button class="text-muted hover:text-white">▶</button>
            </div>
            <div class="text-2xl font-black italic text-brand/80 tracking-widest">
                {{ currentTime }}
            </div>
        </div>

        <!-- Правая часть: Профиль -->
        <div class="flex items-center gap-4">
            <button class="relative p-2 text-muted hover:text-brand transition">
                <span>🔔</span>
                <span
                    class="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-bg"
                ></span>
            </button>

            <div class="flex items-center gap-3 pl-4 border-l border-white-5">
                <div class="text-right hidden sm:block">
                    <p class="text-sm font-bold uppercase">Анна Новикова</p>
                    <p class="text-2xs text-muted font-bold tracking-widest uppercase">Хостес</p>
                </div>
                <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center text-black font-black shadow-lg shadow-brand/20"
                >
                    АН
                </div>
            </div>
        </div>
    </header>
</template>
