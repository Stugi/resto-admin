<!-- app/components/sidebar/DashboardSidebar.vue -->
<!--
  🎓 Левый сайдбар дашборда

  Структура:
  1. StatsCards — статистика (пока заглушка)
  2. TableStatusLegend — легенда цветов статусов
  3. TableList — список столов с фильтрами

  Компонент не принимает props — все данные берёт из store
-->
<script setup lang="ts">
// Компонент использует автоимпорты из ~/components/sidebar/
// StatsCards, TableStatusLegend, TableList
</script>

<template>
    <aside class="dashboard-sidebar">
        <!-- 1. Статистика (заглушка) -->
        <section class="sidebar-section">
            <StatsCards />
        </section>

        <!-- 2. Легенда статусов -->
        <!-- <section class="sidebar-section">
            <h3 class="section-title">Статусы столов</h3>
            <TableStatusLegend />
        </section> -->

        <!-- 3. Список столов (растягивается) -->
        <section class="sidebar-section flex-1 min-h-0 flex flex-col">
            <h3 class="section-title mb-3">Столы</h3>
            <TableList class="flex-1 min-h-0" />
        </section>
    </aside>
</template>

<style scoped>
.dashboard-sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
    height: 100%;
    padding: var(--spacing-4);
    overflow: hidden;
}

.sidebar-section {
    /* Секции не сжимаются по умолчанию */
    flex-shrink: 0;
}

.section-title {
    font-size: var(--font-size-2xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-widest);
    color: var(--color-muted);
    margin-bottom: var(--spacing-2);
}
</style>
