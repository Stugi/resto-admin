export const useToast = () => {
    const message = useState<string | null>('toast-message', () => null)
    const type = useState<'success' | 'error'>('toast-type', () => 'success')

    const showToast = (msg: string, t: 'success' | 'error' = 'success') => {
        message.value = msg
        type.value = t
        setTimeout(() => {
            message.value = null
        }, 3000)
    }

    return { message, type, showToast }
}