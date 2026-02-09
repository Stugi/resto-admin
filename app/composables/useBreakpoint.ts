/**
 * Реактивный трекинг viewport breakpoint
 *
 * SSR-safe: на сервере дефолтит в desktop,
 * на клиенте подхватывает реальный размер в onMounted
 */
export const useBreakpoint = () => {
    const isDesktop = ref(true)
    const isMobile = computed(() => !isDesktop.value)

    onMounted(() => {
        const mql = window.matchMedia('(min-width: 1024px)')
        isDesktop.value = mql.matches

        const handler = (e: MediaQueryListEvent) => {
            isDesktop.value = e.matches
        }

        mql.addEventListener('change', handler)
        onUnmounted(() => mql.removeEventListener('change', handler))
    })

    return { isDesktop, isMobile }
}
