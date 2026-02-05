<script setup lang="ts">
import type { ReservationWithDetails } from '~~/types'

interface Props {
    reservations: ReservationWithDetails[] | null
}

defineProps<Props>()
</script>

<template>
    <section class="flex flex-col h-full space-y-4">
        <!-- Заголовок списка с контрролем количества -->
        <div class="flex items-center justify-between px-1">
            <p class="text-2xs uppercase tracking-widest text-muted font-bold">Список гостей</p>
            <div
                v-if="reservations?.length"
                class="flex items-center gap-1.5 px-2 py-0.5 bg-brand/10 border border-brand/20 rounded-full"
            >
                <span class="text-[10px] font-black text-brand">{{ reservations.length }}</span>
            </div>
        </div>

        <!-- Скролл-зона для списка -->
        <div class="flex-1 space-y-3">
            <template v-if="reservations?.length">
                <ReservationListItem v-for="res in reservations" :key="res.id" :reservation="res" />
            </template>

            <!-- Пустое состояние (Empty State) -->
            <div
                v-else
                class="h-40 flex flex-col items-center justify-center border border-dashed border-white-5 rounded-3xl opacity-20 text-center px-4"
            >
                <Icon name="lucide:calendar-x" class="text-3xl mb-2" />
                <p class="text-xs font-bold uppercase tracking-tighter italic">Броней пока нет</p>
            </div>
        </div>
    </section>
</template>
