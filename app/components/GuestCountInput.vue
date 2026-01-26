<!-- components/GuestCountInput.vue -->
<script setup lang="ts">
const props = defineProps<{
    modelValue: number
    max: number
}>()

const emit = defineEmits(["update:modelValue"])

const update = (val: number) => {
    if (val >= 1 && val <= props.max) {
        emit("update:modelValue", val)
    }
}
</script>

<template>
    <div class="space-y-2">
        <label class="text-2xs uppercase tracking-widest text-muted font-bold block">Гостей</label>
        <div class="flex items-center gap-1 bg-surface-light border border-white-5 rounded-xl p-1">
            <button
                type="button"
                @click="update(modelValue - 1)"
                class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white-5 transition text-xl"
            >
                −
            </button>

            <div class="flex-1 text-center font-bold text-sm">{{ modelValue }}</div>

            <button
                type="button"
                @click="update(modelValue + 1)"
                class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white-5 transition text-xl"
            >
                +
            </button>
        </div>
    </div>
</template>
