import { addDays, subDays, format, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'

export const useDashboardDate = () => {
    // Глобальное состояние выбранной даты
    const selectedDate = useState<Date>('current-dashboard-date', () => new Date())

    const nextDay = () => { selectedDate.value = addDays(selectedDate.value, 1) }
    const prevDay = () => { selectedDate.value = subDays(selectedDate.value, 1) }

    // Красивая строка для хедера: "Сегодня, 21 января" или "Вторник, 22 января"
    const formattedDate = computed(() => {
        const prefix = isToday(selectedDate.value) ? 'Сегодня' : format(selectedDate.value, 'EEEE', { locale: ru })
        const datePart = format(selectedDate.value, 'd MMMM', { locale: ru })
        // Делаем первую букву заглавной
        const full = `${prefix}, ${datePart}`
        return full.charAt(0).toUpperCase() + full.slice(1)
    })

    return {
        selectedDate,
        formattedDate,
        nextDay,
        prevDay
    }
}