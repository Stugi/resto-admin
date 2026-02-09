<script setup lang="ts">
/**
 * Мобильная форма бронирования
 *
 * Отличие от десктопной BookingForm:
 * - Включает выбор стола (на десктопе стол выбирается на схеме)
 * - Порядок: гости → время → стол → контакт
 */
const store = useDashboardStore()
const { showToast } = useToast()

const emit = defineEmits<{
    (e: 'success'): void
}>()

const isSubmitting = ref(false)

const form = reactive({
    guestName: '',
    guestPhone: '',
    startTime: '19:00',
    peopleCount: 2,
    comment: '',
    selectedTableId: null as string | null,
})

// ── Маска телефона ──
const {
    displayPhone,
    rawPhone,
    isPhoneValid,
    onPhoneInput,
    onPhoneKeydown,
    onPhoneFocus,
} = usePhoneMask()

// ── Варианты гостей ──
const guestOptions = [1, 2, 3, 4, '5+'] as const

function selectGuests(opt: number | '5+') {
    form.peopleCount = opt === '5+' ? 5 : opt
}

// ── Слоты времени (12:00–22:30, шаг 1 час) ──
const timeSlots = computed(() => {
    const slots: string[] = []
    for (let h = 12; h <= 22; h++) {
        slots.push(`${h}:00`)
    }
    return slots
})

// ── Доступные столы ──
const availableTables = computed(() => {
    return store.allTables.map(table => {
        // Проверяем занят ли стол в выбранное время
        const [hours] = form.startTime.split(':').map(Number)
        const isOccupied = store.reservations.some(res => {
            const resStart = new Date(res.startTime)
            const resEnd = new Date(res.endTime)
            const slotStart = hours!
            const slotEnd = slotStart + 2
            const resStartH = resStart.getHours() + resStart.getMinutes() / 60
            const resEndH = resEnd.getHours() + resEnd.getMinutes() / 60
            return res.tableId === table.id && slotStart < resEndH && slotEnd > resStartH
        })

        return { ...table, isOccupied }
    })
})

// ── Валидация ──
const errors = reactive({
    guestName: '',
    guestPhone: '',
    table: '',
})

function validate(): boolean {
    errors.guestName = ''
    errors.guestPhone = ''
    errors.table = ''

    if (!form.guestName.trim()) errors.guestName = 'Введите имя гостя'
    if (!isPhoneValid.value) {
        errors.guestPhone = rawPhone.value.length <= 1
            ? 'Введите номер телефона'
            : 'Введите номер полностью'
    }
    if (!form.selectedTableId) errors.table = 'Выберите стол'

    return !errors.guestName && !errors.guestPhone && !errors.table
}

// Сброс ошибок при вводе
watch(() => form.guestName, () => { errors.guestName = '' })
watch(rawPhone, () => { errors.guestPhone = '' })
watch(() => form.selectedTableId, () => { errors.table = '' })

// ── Отправка ──
async function handleSubmit() {
    if (!validate()) return

    isSubmitting.value = true
    try {
        await $fetch('/api/reservations', {
            method: 'POST',
            body: {
                tableId: form.selectedTableId,
                guestName: form.guestName.trim(),
                guestPhone: rawPhone.value,
                startTime: form.startTime,
                peopleCount: form.peopleCount,
                comment: form.comment.trim() || undefined,
            },
        })
        emit('success')
    } catch (e: any) {
        showToast(e.data?.message || 'Ошибка бронирования', 'error')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
        <!-- Гости -->
        <section>
            <p class="section-label">Количество гостей</p>
            <div class="grid grid-cols-5 gap-2">
                <button
                    v-for="opt in guestOptions"
                    :key="opt"
                    type="button"
                    class="chip"
                    :class="{ 'is-active': form.peopleCount === (opt === '5+' ? 5 : opt) }"
                    @click="selectGuests(opt)"
                >
                    {{ opt }}
                </button>
            </div>
        </section>

        <!-- Время -->
        <section>
            <p class="section-label">Время</p>
            <div class="grid grid-cols-4 gap-2">
                <button
                    v-for="slot in timeSlots"
                    :key="slot"
                    type="button"
                    class="chip"
                    :class="{ 'is-active': form.startTime === slot }"
                    @click="form.startTime = slot"
                >
                    {{ slot }}
                </button>
            </div>
        </section>

        <!-- Стол -->
        <section>
            <p class="section-label">
                Стол
                <span v-if="errors.table" class="text-danger text-2xs ml-2 normal-case">{{ errors.table }}</span>
            </p>
            <div class="grid grid-cols-4 gap-2">
                <button
                    v-for="table in availableTables"
                    :key="table.id"
                    type="button"
                    class="table-chip"
                    :class="{
                        'is-active': form.selectedTableId === table.id,
                        'is-unavailable': table.isOccupied,
                    }"
                    :disabled="table.isOccupied"
                    @click="form.selectedTableId = table.id"
                >
                    <span class="table-chip-number">{{ table.name }}</span>
                    <span class="table-chip-seats">{{ table.capacity }} мест</span>
                </button>
            </div>
        </section>

        <!-- Имя -->
        <section>
            <p class="section-label">Имя гостя</p>
            <input
                v-model="form.guestName"
                type="text"
                class="field-input"
                :class="{ 'has-error': errors.guestName }"
                placeholder="Иван Петров"
            />
            <p v-if="errors.guestName" class="field-error">{{ errors.guestName }}</p>
        </section>

        <!-- Телефон -->
        <section>
            <p class="section-label">Телефон</p>
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
        </section>

        <!-- Комментарий -->
        <section>
            <p class="section-label">Комментарий</p>
            <input
                v-model="form.comment"
                type="text"
                class="field-input"
                placeholder="День рождения, аллергии..."
            />
        </section>

        <!-- Кнопка -->
        <button
            type="submit"
            class="submit-btn"
            :disabled="isSubmitting"
        >
            <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <span class="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            </span>
            <span v-else>Забронировать</span>
        </button>
    </form>
</template>

<style scoped>
.section-label {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-muted);
    margin-bottom: var(--spacing-2);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-widest);
}

.chip {
    padding: var(--spacing-3_5) var(--spacing-2);
    background: var(--color-surface-light);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    color: white;
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    text-align: center;
}

.chip.is-active {
    background: var(--color-brand);
    border-color: var(--color-brand);
    color: var(--color-bg);
}

.table-chip {
    padding: var(--spacing-3) var(--spacing-2);
    background: var(--color-surface-light);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    color: white;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    text-align: center;
}

.table-chip.is-active {
    background: var(--color-brand);
    border-color: var(--color-brand);
    color: var(--color-bg);
}

.table-chip.is-active .table-chip-seats {
    color: var(--color-bg);
    opacity: 0.7;
}

.table-chip.is-unavailable {
    opacity: 0.3;
    pointer-events: none;
}

.table-chip-number {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.table-chip-seats {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--color-muted);
    margin-top: 2px;
}

.field-input {
    width: 100%;
    padding: var(--spacing-3_5) var(--spacing-4);
    background: var(--color-surface-light);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    color: white;
    font-size: var(--font-size-base);
    font-family: inherit;
    outline: none;
    transition: border-color var(--duration-fast) var(--ease-out);
}

.field-input:focus {
    border-color: var(--color-brand);
}

.field-input::placeholder {
    color: var(--color-muted);
}

.field-input.has-error {
    border-color: var(--color-danger);
}

.field-error {
    font-size: var(--font-size-2xs);
    color: var(--color-danger);
    margin-top: var(--spacing-1);
    font-weight: 500;
}

.submit-btn {
    width: 100%;
    padding: var(--spacing-4);
    background: var(--color-brand);
    border: none;
    border-radius: var(--radius-xl);
    color: var(--color-bg);
    font-size: var(--font-size-base);
    font-weight: 700;
    cursor: pointer;
    box-shadow: var(--shadow-glow);
    transition: all var(--duration-fast) var(--ease-out);
}

.submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.submit-btn:active:not(:disabled) {
    transform: scale(0.98);
}
</style>
