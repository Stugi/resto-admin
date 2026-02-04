/**
 * 🎓 Единый конфиг статусов столов
 *
 * Используется в:
 * - TableStatusLegend.vue — легенда
 * - TableList.vue — фильтры
 * - TableListItem.vue — отображение статуса
 */

export const TABLE_STATUSES = [
    { key: 'free', label: 'Свободен', color: 'bg-success' },
    { key: 'reserved', label: 'Бронь', color: 'bg-brand' },
    { key: 'busy', label: 'Занят', color: 'bg-danger' },
    { key: 'soon', label: 'Скоро освободится', color: 'bg-violet-500' },
] as const

/**
 * 🎓 Тип статуса на основе конфига
 * Автоматически: 'free' | 'reserved' | 'busy' | 'soon'
 */
export type TableStatusKey = typeof TABLE_STATUSES[number]['key']

/**
 * 🎓 Хелпер для получения данных статуса по ключу
 */
export function getStatusConfig(key: string) {
    return TABLE_STATUSES.find(s => s.key === key)
}
