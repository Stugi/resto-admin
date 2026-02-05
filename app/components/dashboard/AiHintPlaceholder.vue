<!-- app/components/dashboard/AiHintPlaceholder.vue -->
<!--
  Заглушка для блока AI-подсказок
  Паттерн идентичен StatsCards.vue — штриховка, dashed border, brand-tint
  TODO: В будущем здесь будут рекомендации от AI (оптимальная рассадка, прогноз загрузки)
-->
<script setup lang="ts">
// Пока компонент не требует пропсов — это заглушка
</script>

<template>
    <div class="ai-placeholder">
        <div class="placeholder-icon">
            <Icon name="lucide:sparkles" class="text-xl" />
        </div>
        <p class="placeholder-text">AI Подсказка</p>
        <p class="placeholder-subtext">В разработке</p>
    </div>
</template>

<style scoped>
.ai-placeholder {
    position: relative;
    padding: var(--spacing-5) var(--spacing-4);
    border-radius: var(--radius-xl);
    overflow: hidden;
    text-align: center;

    /* Штриховка — диагональные полоски (как StatsCards) */
    background: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            var(--color-white-5) 8px,
            var(--color-white-5) 16px
        ),
        linear-gradient(
            135deg,
            color-mix(in srgb, var(--color-brand) 5%, transparent),
            color-mix(in srgb, var(--color-brand) 2%, transparent)
        );

    border: 1px dashed color-mix(in srgb, var(--color-brand) 30%, transparent);
}

.placeholder-icon {
    width: 2.5rem;
    height: 2.5rem;
    margin: 0 auto var(--spacing-2);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--color-brand) 10%, transparent);
    color: color-mix(in srgb, var(--color-brand) 60%, transparent);
}

.placeholder-text {
    font-size: var(--font-size-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-widest);
    color: var(--color-muted);
    margin-bottom: var(--spacing-1);
}

.placeholder-subtext {
    font-size: var(--font-size-2xs);
    font-weight: 500;
    color: color-mix(in srgb, var(--color-brand) 50%, transparent);
    font-style: italic;
}
</style>
