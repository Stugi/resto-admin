<script setup lang="ts">
const store = useDashboardStore()
</script>

<template>
    <div class="mobile-bottom-bar">
        <button
            class="cta-button"
            @click="store.openBottomSheet('booking')"
        >
            <Icon name="lucide:plus" class="w-5 h-5" />
            <span>Новое бронирование</span>
        </button>
    </div>
</template>

<style scoped>
.mobile-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: var(--spacing-3) var(--spacing-4);
    padding-bottom: calc(var(--spacing-3) + env(safe-area-inset-bottom, 0px));
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    z-index: 100;
}

.cta-button {
    width: 100%;
    padding: var(--spacing-4);
    background: linear-gradient(135deg, var(--color-brand), var(--color-brand-dim));
    border: none;
    border-radius: var(--radius-xl);
    color: var(--color-bg);
    font-size: var(--font-size-base);
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2_5);
    box-shadow: var(--shadow-glow);
    transition: all var(--duration-normal) var(--ease-out);
}

.cta-button:active {
    transform: scale(0.98);
}
</style>
