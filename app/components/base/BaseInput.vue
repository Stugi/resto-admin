<script setup lang="ts">
const modelValue = defineModel<string | number>()

interface Props {
    label?: string
    type?: "text" | "tel" | "number" | "time"
    placeholder?: string
    required?: boolean
    max?: number | string
}

defineProps<Props>()
</script>

<template>
    <div class="space-y-2">
        <label v-if="label" class="block text-2xs font-bold text-muted uppercase tracking-widest">
            {{ label }}
        </label>
        <input
            v-model="modelValue"
            :type="type || 'text'"
            :placeholder="placeholder"
            :required="required"
            :max="max"
            class="w-full bg-surface-light border border-white-5 rounded-xl px-4 py-3 focus:border-brand outline-none transition placeholder:text-muted/40"
        />
    </div>
</template>
