/**
 * Форматирует строку цифр в маску +7 (XXX) XXX-XX-XX
 * Экспортируется отдельно для использования в компонентах (отображение телефона)
 */
export function formatPhone(digits: string): string {
    // Убираем всё кроме цифр
    digits = digits.replace(/\D/g, '')
    // Всегда начинаем с 7
    if (!digits.startsWith('7')) {
        digits = '7' + digits
    }
    // Обрезаем до 11 цифр
    digits = digits.slice(0, 11)

    let result = '+7'
    if (digits.length > 1) result += ' (' + digits.slice(1, 4)
    if (digits.length >= 4) result += ')'
    if (digits.length > 4) result += ' ' + digits.slice(4, 7)
    if (digits.length > 7) result += '-' + digits.slice(7, 9)
    if (digits.length > 9) result += '-' + digits.slice(9, 11)

    return result
}

/**
 * 🎓 Composable для маски телефона +7 (___) ___-__-__
 *
 * Форматирует ввод пользователя в маску на лету.
 * Возвращает отображаемое значение, «чистый» номер и валидность.
 */
export function usePhoneMask() {
    /** Отображаемое значение (с маской) */
    const displayPhone = ref('+7 ')

    /** Чистые 11 цифр: 79991234567 (для отправки на API) */
    const rawPhone = computed(() => {
        const digits = displayPhone.value.replace(/\D/g, '')
        return digits
    })

    /** Валиден ли номер (ровно 11 цифр, начинается с 7) */
    const isPhoneValid = computed(() => {
        return rawPhone.value.length === 11 && rawPhone.value.startsWith('7')
    })

    /** Текст ошибки (пустой если всё ок или ещё не начали вводить) */
    const phoneError = computed(() => {
        const digits = rawPhone.value
        // Пока не начали вводить — не показываем ошибку
        if (digits.length <= 1) return ''
        if (digits.length < 11) return 'Введите номер полностью'
        return ''
    })

    /**
     * Обработчик @input для инпута телефона.
     * Вызывать напрямую: `@input="onPhoneInput"`
     */
    function onPhoneInput(event: Event) {
        const input = event.target as HTMLInputElement
        const cursorPos = input.selectionStart ?? 0

        // Извлекаем цифры из текущего значения
        let digits = input.value.replace(/\D/g, '')

        // Если пользователь удалил всё — оставляем +7
        if (digits.length === 0) {
            digits = '7'
        }

        // Если не начинается с 7, добавляем
        if (!digits.startsWith('7')) {
            // Если начинается с 8 — заменяем на 7 (рос. формат)
            if (digits.startsWith('8')) {
                digits = '7' + digits.slice(1)
            } else {
                digits = '7' + digits
            }
        }

        const formatted = formatPhone(digits)
        displayPhone.value = formatted

        // Восстанавливаем курсор (ставим в конец)
        nextTick(() => {
            input.value = formatted
            const newPos = formatted.length
            input.setSelectionRange(newPos, newPos)
        })
    }

    /**
     * Обработчик @keydown — блокируем удаление +7
     */
    function onPhoneKeydown(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement
        const pos = input.selectionStart ?? 0

        // Не даём удалить +7 (первые 3 символа)
        if ((event.key === 'Backspace' && pos <= 3) ||
            (event.key === 'Delete' && pos < 3)) {
            event.preventDefault()
        }
    }

    /**
     * Обработчик @focus — если пустое, ставим +7
     */
    function onPhoneFocus() {
        if (!displayPhone.value || displayPhone.value.length < 3) {
            displayPhone.value = '+7 '
        }
    }

    return {
        displayPhone,
        rawPhone,
        isPhoneValid,
        phoneError,
        onPhoneInput,
        onPhoneKeydown,
        onPhoneFocus,
    }
}
