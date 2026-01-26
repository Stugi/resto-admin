<template>
    <div class="h-screen flex flex-col bg-bg text-white overflow-hidden selection:bg-brand/30">
        <AppHeader />

        <div class="flex-1 relative min-h-0">
            <slot />
        </div>
    </div>
</template>
