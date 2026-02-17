/**
 * SSR-безопасный composable для работы с localStorage
 *
 * Проблема: В Nuxt код выполняется и на сервере (SSR), где нет localStorage.
 * Решение: useState хранит значение реактивно (работает и на сервере),
 * а синхронизация с localStorage происходит только на клиенте (onMounted).
 *
 * Использование:
 *   const viewMode = useLocalStorage<'grid' | 'schema'>('viewMode', 'schema')
 *   viewMode.value = 'grid' // автоматически сохранит в localStorage
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
    // useState — Nuxt-хелпер, работает и на SSR, и на клиенте
    // Гарантирует единый state между сервером и клиентом (гидрация без мисматча)
    const state = useState<T>(key, () => defaultValue)

    if (import.meta.client) {
        // Читаем сохранённое значение при монтировании на клиенте
        onMounted(() => {
            try {
                const stored = localStorage.getItem(key)
                if (stored !== null) {
                    state.value = JSON.parse(stored) as T
                }
            } catch {
                // Если JSON невалидный — оставляем default
            }
        })

        // Записываем в localStorage при каждом изменении
        watch(state, (newValue) => {
            try {
                localStorage.setItem(key, JSON.stringify(newValue))
            } catch {
                // localStorage может быть недоступен (private mode, quota exceeded)
            }
        }, { deep: true })
    }

    return state
}
