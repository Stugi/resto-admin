<!-- app/components/sidebar/StatsCards.vue -->
<!--
  🎓 Заглушка для блока статистики
  TODO: В будущем здесь будет реальная статистика от worker'а

  Используем CSS переменные из main.css:
  - --color-brand для акцентного цвета
  - --color-surface-light для фона
  - --color-muted для приглушённого текста
-->
<script setup lang="ts">
// Пока компонент не требует пропсов — это заглушка
// В будущем сюда придут данные из API: { totalGuests, averageCheck, occupancy }
</script>

<template>
    <div class="stats-placeholder">
        <!-- Иконка "в разработке" -->
        <div class="placeholder-icon">
            <Icon name="lucide:construction" class="text-2xl" />
        </div>

        <!-- Текст -->
        <p class="placeholder-text">Статистика</p>
        <p class="placeholder-subtext">В разработке</p>

        <!-- Декоративные "карточки" для визуального представления -->
        <div class="placeholder-cards">
            <div class="placeholder-card" />
            <div class="placeholder-card" />
            <div class="placeholder-card" />
        </div>
    </div>
</template>

<style scoped>
.stats-placeholder {
    position: relative;
    padding: 24px 16px;
    border-radius: var(--radius-xl);
    overflow: hidden;
    text-align: center;

    /* Штриховка — диагональные полоски */
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
    width: 3rem;
    height: 3rem;
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

/* Декоративные карточки внизу */
.placeholder-cards {
    display: flex;
    gap: 8px;
    margin-top: var(--spacing-4);
    justify-content: center;
}

.placeholder-card {
    width: 3.5rem;
    height: 2rem;
    border-radius: var(--radius-md);
    background: var(--color-white-5);
    border: 1px dashed color-mix(in srgb, white 8%, transparent);
}
</style>
