<script setup lang="ts">
const store = useDashboardStore()

/** Пункты меню */
const menuItems = [
    { icon: 'lucide:map', label: 'Схема зала' },
    { icon: 'lucide:bar-chart-2', label: 'Аналитика' },
    { icon: 'lucide:users', label: 'База гостей' },
    { icon: 'lucide:settings', label: 'Настройки' },
    { icon: 'lucide:log-out', label: 'Выход' },
] as const
</script>

<template>
    <Teleport to="body">
        <div
            class="overlay-backdrop"
            :class="{ 'is-open': store.mobileMenuOpen }"
            style="z-index: 300"
            @click.self="store.closeMobileMenu()"
        >
            <div class="menu-drawer" @click.stop>
                <!-- Header -->
                <div class="flex justify-between items-center mb-6">
                    <span class="text-lg font-bold">Меню</span>
                    <button
                        class="w-9 h-9 bg-surface-light rounded-lg flex items-center justify-center cursor-pointer"
                        @click="store.closeMobileMenu()"
                    >
                        <Icon name="lucide:x" class="w-5 h-5" />
                    </button>
                </div>

                <!-- Профиль -->
                <div class="flex items-center gap-3 p-3 bg-surface-light rounded-xl mb-6">
                    <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-sky-400 rounded-xl flex items-center justify-center text-xs font-bold text-white">
                        АН
                    </div>
                    <div>
                        <p class="text-sm font-semibold">Анна Новикова</p>
                        <p class="text-2xs text-muted uppercase tracking-widest font-semibold">Хостес</p>
                    </div>
                </div>

                <!-- Пункты меню -->
                <div
                    v-for="item in menuItems"
                    :key="item.label"
                    class="menu-item"
                >
                    <div class="menu-item-icon">
                        <Icon :name="item.icon" class="w-5 h-5" />
                    </div>
                    <span class="text-sm font-medium">{{ item.label }}</span>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.menu-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-3_5);
    padding: var(--spacing-3_5);
    background: var(--color-surface-light);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-2);
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-out);
}

.menu-item:active {
    background: var(--color-border);
}

.menu-item-icon {
    width: 40px;
    height: 40px;
    background: var(--color-bg);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-muted);
}
</style>
