<!-- app/components/ReservationListItem.vue -->
<script setup lang="ts">
// В идеале тут должен быть расширенный тип из types/index.ts
const props = defineProps<{
    reservation: any //TODO
}>()

// Форматируем время "19:30"
const formattedTime = computed(() => {
    return new Date(props.reservation.startTime).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    })
})
</script>

<template>
    <div
        class="group p-4 bg-surface-light/30 border border-white-5 rounded-2xl hover:border-brand/40 hover:bg-surface-light/60 transition-all cursor-pointer"
    >
        <div class="flex justify-between items-start mb-3">
            <div class="space-y-0.5">
                <p class="font-bold text-sm text-white group-hover:text-brand transition-colors">
                    {{ reservation.guest.name }}
                </p>
                <p class="text-2xs text-muted font-medium tracking-tight">
                    {{ reservation.guest.phone }}
                </p>
            </div>
            <div class="px-2 py-1 bg-brand/10 border border-brand/20 rounded-lg">
                <span class="text-[10px] font-black italic text-brand uppercase tracking-tighter">
                    Стол {{ reservation.table.name }}
                </span>
            </div>
        </div>

        <div class="flex items-center gap-4 text-muted">
            <div class="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-widest">
                <Icon name="lucide:clock" class="text-brand/60" />
                {{ formattedTime }}
            </div>
            <div class="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-widest">
                <Icon name="lucide:users" class="text-brand/60" />
                {{ reservation.peopleCount }} чел
            </div>
        </div>
    </div>
</template>
