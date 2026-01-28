<script setup lang="ts">
interface NavigationItem {
    to: string
    icon: string
    text: string
}

const routes: NavigationItem[] = [
    { to: "/admin", icon: "lucide:layout-dashboard", text: "Обзор" },
    { to: "/admin/users", icon: "lucide:users", text: "Персонал" },
]

definePageMeta({
    layout: "default",
    middleware: ["admin"],
})
</script>

<template>
    <div class="flex h-full bg-bg">
        <!-- Внутренний сайдбар админки -->
        <aside class="w-64 border-r border-white-5 flex flex-col shrink-0 bg-surface/50">
            <div class="p-6">
                <h2 class="font-display text-2xl font-semibold tracking-tight text-brand">
                    У<span class="text-white">правление</span>
                </h2>
            </div>

            <nav class="flex-1 px-4 space-y-2">
                <NuxtLink
                    v-for="router in routes"
                    :key="router.to"
                    :to="router.to"
                    class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white-5 group"
                    exact-active-class="bg-brand/10 text-brand"
                >
                    <Icon :name="router.icon" size="18" />
                    <span class="text-sm font-bold uppercase tracking-widest">{{
                        router.text
                    }}</span>
                </NuxtLink>
            </nav>
        </aside>

        <!-- Зона вложенных страниц -->
        <main class="flex-1 overflow-y-auto scrollbar-thin p-safe">
            <!-- Сюда Nuxt подставит контент из папки pages/admin/ -->
            <NuxtPage />
        </main>
    </div>
</template>
