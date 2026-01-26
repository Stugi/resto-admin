<!-- components/BookingForm.vue -->
<script setup lang="ts">
import type { TableWithStatus } from "~~/types"

const props = defineProps<{
    table: TableWithStatus
}>()

const emit = defineEmits(["success", "close"])

const isSubmitting = ref(false)
const form = reactive({
    guestName: "",
    guestPhone: "",
    startTime: "19:00",
    peopleCount: 2,
})

const submitForm = async () => {
    isSubmitting.value = true
    try {
        await $fetch("/api/reservations", {
            method: "POST",
            body: { tableId: props.table.id, ...form },
        })
        emit("success")
    } catch (e: any) {
        alert(e.data?.message || "Ошибка")
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="flex flex-col h-full">
        <div class="mb-8 flex justify-between items-start">
            <div>
                <h2 class="text-2xl font-black italic tracking-tighter uppercase">
                    СТОЛ {{ table.name }}
                </h2>
                <p class="text-muted text-2xs uppercase tracking-widest font-bold mt-1">
                    MAX: {{ table.capacity }} чел. • {{ table.status }}
                </p>
            </div>
            <button @click="$emit('close')" class="p-2 hover:bg-white-5 rounded-full transition">
                ✕
            </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-6 flex-1 flex flex-col">
            <BaseInput
                v-model="form.guestName"
                label="Имя гостя"
                placeholder="Александр"
                required
            />

            <BaseInput
                v-model="form.guestPhone"
                label="Телефон"
                type="tel"
                placeholder="+7..."
                required
            />

            <div class="grid grid-cols-2 gap-4">
                <BaseInput v-model="form.startTime" label="Время" type="time" required />

                <GuestCountInput v-model="form.peopleCount" :max="table.capacity" />
            </div>

            <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full py-4 bg-brand text-black font-black rounded-xl hover:bg-brand-light transition-all shadow-lg shadow-brand/20 disabled:opacity-50 mt-auto"
            >
                {{ isSubmitting ? "ОФОРМЛЕНИЕ..." : "ЗАБРОНИРОВАТЬ" }}
            </button>
        </form>
    </div>
</template>
