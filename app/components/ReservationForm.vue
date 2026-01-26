<script setup lang="ts">
import type { TableWithStatus } from "~~/types"

const props = defineProps<{
    table: TableWithStatus
}>()

const emit = defineEmits<{
    (e: "success"): void
    (e: "cancel"): void
}>()

const isSubmitting = ref(false)

const form = reactive({
    guestName: "",
    guestPhone: "",
    startTime: "19:00",
    peopleCount: props.table.capacity,
})

const handleFormSubmit = async () => {
    isSubmitting.value = true
    try {
        await $fetch("/api/reservations", {
            method: "POST",
            body: {
                tableId: props.table.id,
                ...form,
            },
        })

        await refreshNuxtData()
        emit("success")
    } catch (e: any) {
        alert(e.data?.message || "Ошибка бронирования")
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <form @submit.prevent="handleFormSubmit" class="space-y-6">
        <BaseInput v-model="form.guestName" label="Имя гостя" placeholder="Иван Иванов" required />

        <BaseInput
            v-model="form.guestPhone"
            label="Телефон"
            type="tel"
            placeholder="+7 (___) ___ __ __"
            required
        />

        <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="form.startTime" label="Время" type="time" required />
            <BaseInput
                v-model="form.peopleCount"
                label="Гостей"
                type="number"
                :max="table.capacity"
            />
        </div>

        <div class="pt-4 space-y-2">
            <BaseButton type="submit" :loading="isSubmitting"> ЗАБРОНИРОВАТЬ </BaseButton>

            <BaseButton variant="ghost" @click="emit('cancel')"> ОТМЕНА </BaseButton>
        </div>
    </form>
</template>
