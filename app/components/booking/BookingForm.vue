<script setup lang="ts">
import type { TableWithStatus } from "~~/types"

const { showToast } = useToast()
const store = useDashboardStore()

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
    startTime: "19:00",
    peopleCount: 2,
    comment: "",
})

// ── Ошибки валидации (inline, под полями) ──
const errors = reactive({
    guestName: '',
    guestPhone: '',
})

// Сброс ошибки при вводе
watch(() => form.guestName, () => { errors.guestName = '' })

// ── Маска телефона ──
const {
    displayPhone,
    rawPhone,
    isPhoneValid,
    onPhoneInput,
    onPhoneKeydown,
    onPhoneFocus,
} = usePhoneMask()

watch(rawPhone, () => { errors.guestPhone = '' })

// ── Название зоны для карточки стола ──
const zoneName = computed(() => {
    const zone = store.zones.find(z =>
        z.tables.some(t => t.id === props.table.id)
    )
    return zone?.name ?? ''
})

// ── Варианты гостей (динамически по capacity) ──
const guestOptions = computed((): (number | '5+')[] => {
    const max = props.table.capacity
    const options: (number | '5+')[] = []
    for (let i = 1; i <= Math.min(max, 4); i++) {
        options.push(i)
    }
    if (max > 4) options.push('5+')
    return options
})

const showCustomPeopleInput = ref(false)

function selectGuests(option: number | '5+') {
    if (option === '5+') {
        showCustomPeopleInput.value = true
        form.peopleCount = 5
    } else {
        showCustomPeopleInput.value = false
        form.peopleCount = option
    }
}

function isGuestSelected(option: number | '5+') {
    if (option === '5+') return showCustomPeopleInput.value
    return !showCustomPeopleInput.value && form.peopleCount === option
}

// ── Слоты времени (18:00–22:30, шаг 30 мин) ──
const timeSlots = computed(() => {
    const slots: string[] = []
    for (let h = 18; h <= 22; h++) {
        slots.push(`${h}:00`)
        slots.push(`${h}:30`)
    }
    return slots
})

// ── Занятые слоты (пересечение с существующими бронями на столе) ──
const occupiedSlots = computed(() => {
    const reservations = props.table.reservations ?? []
    return new Set(
        timeSlots.value.filter(slot => {
            const parts = slot.split(':').map(Number)
            const slotStart = parts[0]! + parts[1]! / 60
            const slotEnd = slotStart + 2 // бронь = 2 часа

            return reservations.some(res => {
                const resStart = new Date(res.startTime)
                const resEnd = new Date(res.endTime)
                const resStartH = resStart.getHours() + resStart.getMinutes() / 60
                const resEndH = resEnd.getHours() + resEnd.getMinutes() / 60
                return slotStart < resEndH && slotEnd > resStartH
            })
        })
    )
})

function isSlotOccupied(slot: string) {
    return occupiedSlots.value.has(slot)
}

function selectTime(slot: string) {
    if (isSlotOccupied(slot)) return
    form.startTime = slot
}

// Если текущий выбранный слот стал занят — сбрасываем на первый свободный
watch(occupiedSlots, (occupied) => {
    if (occupied.has(form.startTime)) {
        const freeSlot = timeSlots.value.find(s => !occupied.has(s))
        if (freeSlot) form.startTime = freeSlot
    }
})

// ── Валидация ──
function validate(): boolean {
    errors.guestName = ''
    errors.guestPhone = ''

    if (!form.guestName.trim()) {
        errors.guestName = 'Введите имя гостя'
    }
    if (!isPhoneValid.value) {
        errors.guestPhone = rawPhone.value.length <= 1
            ? 'Введите номер телефона'
            : 'Введите номер полностью'
    }

    return !errors.guestName && !errors.guestPhone
}

// ── Отправка формы ──
const handleFormSubmit = async () => {
    if (!validate()) return

    isSubmitting.value = true
    try {
        await $fetch("/api/reservations", {
            method: "POST",
            body: {
                tableId: props.table.id,
                guestName: form.guestName.trim(),
                guestPhone: rawPhone.value,
                startTime: form.startTime,
                peopleCount: form.peopleCount,
            },
        })

        await refreshNuxtData()
        emit("success")
        showToast("Бронь успешно создана", "success")
    } catch (e: any) {
        showToast(e.data?.message || "Ошибка бронирования", "error")
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <form @submit.prevent="handleFormSubmit" class="booking-form">
        <!-- ═══ ВЫБРАННЫЙ СТОЛ ═══ -->
        <section>
            <p class="section-label">Выбранный стол</p>
            <div class="table-card">
                <div class="table-card-icon is-selected">
                    {{ table.name }}
                </div>
                <div>
                    <p class="table-card-title">Стол №{{ table.name }}</p>
                    <p class="table-card-sub">{{ table.capacity }} мест<span v-if="zoneName"> · {{ zoneName }}</span></p>
                </div>
            </div>
        </section>

        <!-- ═══ ГОСТИ ═══ -->
        <section>
            <p class="section-label">Гости</p>
            <div class="chip-grid" :class="'cols-' + guestOptions.length">
                <button
                    v-for="opt in guestOptions"
                    :key="opt"
                    type="button"
                    class="chip"
                    :class="{ 'is-active': isGuestSelected(opt) }"
                    @click="selectGuests(opt)"
                >
                    {{ opt }}
                </button>
            </div>
            <!-- Инпут для 5+ -->
            <div v-if="showCustomPeopleInput" class="mt-2 flex items-center gap-2">
                <input
                    v-model.number="form.peopleCount"
                    type="number"
                    :min="5"
                    :max="table.capacity"
                    class="field-input custom-people-input"
                />
                <span class="text-xs text-muted">макс. {{ table.capacity }}</span>
            </div>
        </section>

        <!-- ═══ ВРЕМЯ ═══ -->
        <section>
            <p class="section-label">Время</p>
            <div class="chip-grid cols-4">
                <button
                    v-for="slot in timeSlots"
                    :key="slot"
                    type="button"
                    class="chip"
                    :class="{
                        'is-active': form.startTime === slot && !isSlotOccupied(slot),
                        'is-occupied': isSlotOccupied(slot),
                    }"
                    :disabled="isSlotOccupied(slot)"
                    @click="selectTime(slot)"
                >
                    {{ slot }}
                </button>
            </div>
        </section>

        <!-- ═══ КОНТАКТ ═══ -->
        <section>
            <p class="section-label">Контакт</p>
            <div class="grid grid-cols-2 gap-3">
                <div class="field">
                    <label class="field-label">Имя</label>
                    <input
                        v-model="form.guestName"
                        type="text"
                        class="field-input"
                        :class="{ 'has-error': errors.guestName }"
                        placeholder="Иван Петров"
                    />
                    <p v-if="errors.guestName" class="field-error">{{ errors.guestName }}</p>
                </div>
                <div class="field">
                    <label class="field-label">Телефон</label>
                    <input
                        :value="displayPhone"
                        type="tel"
                        class="field-input"
                        :class="{ 'has-error': errors.guestPhone }"
                        placeholder="+7 (___) ___-__-__"
                        @input="onPhoneInput"
                        @keydown="onPhoneKeydown"
                        @focus="onPhoneFocus"
                    />
                    <p v-if="errors.guestPhone" class="field-error">{{ errors.guestPhone }}</p>
                </div>
            </div>
            <div class="field mt-3">
                <label class="field-label">Комментарий</label>
                <input
                    v-model="form.comment"
                    type="text"
                    class="field-input"
                    placeholder="День рождения, аллергии..."
                />
            </div>
        </section>

        <!-- ═══ КНОПКИ ═══ -->
        <div class="actions">
            <button
                type="button"
                class="btn-cancel"
                @click="emit('cancel')"
            >
                Отмена
            </button>
            <button
                type="submit"
                class="btn-submit"
                :disabled="isSubmitting"
            >
                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ...
                </span>
                <span v-else>✓ Забронировать</span>
            </button>
        </div>
    </form>
</template>

<style scoped>
.booking-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-6);
}

/* ── Section label ── */
.section-label {
    font-size: var(--font-size-2xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-widest);
    color: var(--color-muted);
    margin-bottom: var(--spacing-3);
}

/* ── Table Card ── */
.table-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
    padding: var(--spacing-4);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-white-5);
    background: var(--color-surface-light);
}

.table-card-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    background: var(--color-white-5);
    font-size: var(--font-size-lg);
    font-weight: 800;
    color: white;
    flex-shrink: 0;
}

.table-card-icon.is-selected {
    background: var(--color-brand);
    color: var(--color-bg);
}

.table-card-title {
    font-size: var(--font-size-sm);
    font-weight: 700;
    color: white;
}

.table-card-sub {
    font-size: var(--font-size-xs);
    color: var(--color-muted);
    margin-top: 2px;
}

/* ── Chips grid ── */
.chip-grid {
    display: grid;
    gap: var(--spacing-2);
}

.chip-grid.cols-1 { grid-template-columns: repeat(1, 1fr); }
.chip-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
.chip-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
.chip-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
.chip-grid.cols-5 { grid-template-columns: repeat(5, 1fr); }

.chip {
    padding: var(--spacing-2_5) var(--spacing-2);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-white-5);
    background: var(--color-surface-light);
    color: var(--color-muted);
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    text-align: center;
}

.chip:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--color-brand) 40%, transparent);
    color: white;
}

.chip.is-active {
    background: var(--color-brand);
    border-color: var(--color-brand);
    color: var(--color-bg);
    font-weight: 700;
}

.chip.is-occupied {
    opacity: 0.25;
    cursor: not-allowed;
    text-decoration: line-through;
}

/* ── Custom people input ── */
.custom-people-input {
    width: 80px;
    text-align: center;
    padding: var(--spacing-2) var(--spacing-3);
}

/* ── Form fields ── */
.field-label {
    display: block;
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-muted);
    margin-bottom: var(--spacing-1_5);
}

.field-input {
    width: 100%;
    background: var(--color-surface-light);
    border: 1px solid var(--color-white-5);
    border-radius: var(--radius-lg);
    padding: var(--spacing-3) var(--spacing-4);
    font-size: var(--font-size-sm);
    color: white;
    outline: none;
    transition: border-color var(--duration-fast) var(--ease-out);
}

.field-input::placeholder {
    color: color-mix(in srgb, var(--color-muted) 50%, transparent);
}

.field-input:focus {
    border-color: var(--color-brand);
}

.field-input.has-error {
    border-color: var(--color-danger);
}

.field-input.has-error:focus {
    border-color: var(--color-danger);
}

/* ── Inline error ── */
.field-error {
    font-size: var(--font-size-2xs);
    color: var(--color-danger);
    margin-top: var(--spacing-1);
    font-weight: 500;
}

/* ── Action buttons ── */
.actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-3);
    padding-top: var(--spacing-2);
}

.btn-cancel {
    padding: var(--spacing-3_5) var(--spacing-4);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-white-5);
    background: var(--color-surface-light);
    color: white;
    font-size: var(--font-size-sm);
    font-weight: 700;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
}

.btn-cancel:hover {
    border-color: color-mix(in srgb, var(--color-muted) 40%, transparent);
    background: var(--color-surface);
}

.btn-submit {
    padding: var(--spacing-3_5) var(--spacing-4);
    border-radius: var(--radius-xl);
    background: var(--color-brand);
    color: var(--color-bg);
    font-size: var(--font-size-sm);
    font-weight: 800;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    box-shadow: 0 0 20px color-mix(in srgb, var(--color-brand) 30%, transparent);
}

.btn-submit:hover {
    background: var(--color-brand-light);
}

.btn-submit:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>
