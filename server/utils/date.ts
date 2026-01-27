// server/utils/date.ts
export function parseViewTime(date: Date, viewTime?: string): Date {
    if (!viewTime) return new Date()

    const [hours, minutes] = viewTime.split(':')
    const result = new Date(date)
    result.setHours(Number(hours), Number(minutes), 0, 0)
    return result
}