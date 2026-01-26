<script setup lang="ts">
interface Props {
    type?: "button" | "submit"
    variant?: "primary" | "ghost"
    loading?: boolean
    disabled?: boolean
}

withDefaults(defineProps<Props>(), {
    type: "button",
    variant: "primary",
})
</script>

<template>
    <button
        :type="type"
        :disabled="disabled || loading"
        :class="[
            'w-full py-4 rounded-xl font-black transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed',
            variant === 'primary'
                ? 'bg-brand text-black hover:bg-brand-light shadow-lg shadow-brand/20'
                : 'text-muted text-xs hover:text-white',
        ]"
    >
        <span v-if="loading" class="flex items-center justify-center gap-2">
            <span
                class="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"
            ></span>
            ОБРАБОТКА...
        </span>
        <slot v-else />
    </button>
</template>
