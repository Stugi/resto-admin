/**
 * Обработка CORS preflight (OPTIONS) для /api/public/v1/*.
 * На preflight нет тела/auth — отвечаем сразу 204 с разрешающими хедерами.
 * Полная проверка origin для реальных запросов идёт в authenticatePublicRequest.
 */
export default defineEventHandler((event) => {
    const url = getRequestURL(event)
    if (!url.pathname.startsWith('/api/public/v1/')) return

    if (event.method === 'OPTIONS') {
        const origin = getHeader(event, 'origin')
        if (origin) {
            setHeader(event, 'Access-Control-Allow-Origin', origin)
            setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
            setHeader(event, 'Access-Control-Allow-Headers', 'Authorization, Content-Type')
            setHeader(event, 'Access-Control-Max-Age', 600)
            setHeader(event, 'Vary', 'Origin')
        }
        setResponseStatus(event, 204)
        return ''
    }
})
