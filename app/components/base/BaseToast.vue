<!-- app/components/base/BaseToast.vue -->
<script setup lang="ts">
defineProps<{
    message: string
    type: "success" | "error"
}>()
</script>

<template>
    <div
        :class="[
            'fixed top-safe right-safe px-6 py-4 rounded-2xl shadow-xl z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300 flex items-center gap-3 border',
            type === 'success'
                ? 'bg-surface-light border-success/30 text-success shadow-success/10'
                : 'bg-surface-light border-danger/30 text-danger shadow-danger/10',
        ]"
    >
        <!-- Иконки из сета Lucide -->
        <Icon
            :name="type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'"
            class="text-xl"
        />

        <span class="font-bold text-2xs uppercase tracking-widest text-white">
            {{ message }}
        </span>
    </div>
</template>
