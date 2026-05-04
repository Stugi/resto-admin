import { createHash, randomBytes } from 'node:crypto'

const KEY_PREFIX = 'rk_' // resto-key

/**
 * Генерирует новый API-ключ. Возвращает plain (показывается пользователю один раз) и hash (хранится в БД).
 */
export function generateApiKey(): { plain: string; hash: string; prefix: string } {
    const random = randomBytes(24).toString('base64url')
    const plain = `${KEY_PREFIX}${random}`
    const hash = hashApiKey(plain)
    const prefix = plain.slice(0, 11) // rk_ + 8 символов
    return { plain, hash, prefix }
}

export function hashApiKey(key: string): string {
    return createHash('sha256').update(key).digest('hex')
}
