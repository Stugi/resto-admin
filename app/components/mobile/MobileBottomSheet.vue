<script setup lang="ts">
/**
 * Переиспользуемый bottom-sheet компонент
 *
 * Teleport оправдан — нужен overlay поверх всей страницы
 */
const props = defineProps<{
    isOpen: boolean
    title: string
}>()

const emit = defineEmits<{
    (e: "close"): void
}>()
</script>

<template>
    <Teleport to="body">
        <div class="overlay-backdrop" :class="{ 'is-open': isOpen }" @click.self="emit('close')">
            <div class="bottom-sheet" @click.stop>
                <!-- Handle -->
                <div class="w-9 h-1 bg-white-5 rounded-full mx-auto my-2.5" />

                <!-- Header -->
                <div class="px-5 pb-4 pt-3 border-b border-border">
                    <h3 class="text-xl font-bold text-center text-white">{{ title }}</h3>
                </div>

                <!-- Body -->
                <div class="flex-1 overflow-y-auto px-5 py-5">
                    <slot />
                </div>

                <!-- Footer (опционально) -->
                <div v-if="$slots.footer" class="sheet-footer">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.sheet-footer {
    padding: var(--spacing-4) var(--spacing-5);
    padding-bottom: calc(var(--spacing-4) + env(safe-area-inset-bottom, 0px));
    border-top: 1px solid var(--color-border);
    display: flex;
    gap: var(--spacing-3);
}
</style>
