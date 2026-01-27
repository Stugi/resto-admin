<script setup lang="ts">
import type { NuxtError } from "#app"

defineProps<{
    error: NuxtError
}>()

const handleError = () => {
    clearError({ redirect: "/dashboard" })
}
</script>

<template>
    <div class="min-h-screen bg-bg flex items-center justify-center font-body">
        <div class="text-center">
            <!-- Код ошибки -->
            <h1 class="font-display text-5xl font-bold text-brand mb-4">
                {{ error.statusCode }}
            </h1>

            <!-- Сообщение -->
            <p class="text-xl text-white mb-2">
                {{ error.statusCode === 404 ? "Страница не найдена" : "Произошла ошибка" }}
            </p>

            <p class="text-sm text-muted mb-8">
                {{ error.message }}
            </p>

            <!-- Кнопка возврата -->
            <button
                @click="handleError"
                class="px-6 py-3 bg-brand text-bg font-semibold rounded-xl hover:bg-brand-light transition-colors"
            >
                ← На главную
            </button>
        </div>
    </div>
</template>
