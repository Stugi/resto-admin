/**
 * Конфигурация элементов схемы зала
 *
 * Используется в FloorElement.vue для рендеринга
 */
import type { ElementType } from '~~/types'

interface ElementConfig {
    icon: string            // lucide иконка
    label: string           // Название для UI
    defaultWidth?: number   // Ширина по умолчанию (px)
    defaultHeight?: number  // Высота по умолчанию (px)
    bgColor: string         // Tailwind класс фона
    textColor: string       // Tailwind класс текста
    zIndex: number          // Слой (VIP-зоны ниже столов)
}

export const FLOOR_ELEMENTS: Record<ElementType, ElementConfig> = {
    // Объекты
    kitchen: {
        icon: 'lucide:chef-hat',
        label: 'Кухня',
        defaultWidth: 100,
        defaultHeight: 60,
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-400',
        zIndex: 5,
    },
    bar: {
        icon: 'lucide:wine',
        label: 'Бар',
        defaultWidth: 120,
        defaultHeight: 50,
        bgColor: 'bg-amber-500/20',
        textColor: 'text-amber-400',
        zIndex: 5,
    },
    entrance: {
        icon: 'lucide:door-open',
        label: 'Вход',
        defaultWidth: 60,
        defaultHeight: 40,
        bgColor: 'bg-blue-500/20',
        textColor: 'text-blue-400',
        zIndex: 5,
    },
    toilet: {
        icon: 'lucide:bath',
        label: 'WC',
        defaultWidth: 50,
        defaultHeight: 50,
        bgColor: 'bg-cyan-500/20',
        textColor: 'text-cyan-400',
        zIndex: 5,
    },
    hostess: {
        icon: 'lucide:user-circle',
        label: 'Хостес',
        defaultWidth: 50,
        defaultHeight: 50,
        bgColor: 'bg-pink-500/20',
        textColor: 'text-pink-400',
        zIndex: 5,
    },

    // Декор
    plants: {
        icon: 'lucide:leaf',
        label: 'Растение',
        defaultWidth: 30,
        defaultHeight: 30,
        bgColor: 'bg-green-500/20',
        textColor: 'text-green-400',
        zIndex: 4,
    },

    // Архитектура
    wall_h: {
        icon: 'lucide:minus',
        label: 'Стена гориз.',
        defaultWidth: 100,
        defaultHeight: 8,
        bgColor: 'bg-white/10',
        textColor: 'text-white/40',
        zIndex: 2,
    },
    wall_v: {
        icon: 'lucide:minus',
        label: 'Стена верт.',
        defaultWidth: 8,
        defaultHeight: 100,
        bgColor: 'bg-white/10',
        textColor: 'text-white/40',
        zIndex: 2,
    },
    column: {
        icon: 'lucide:square',
        label: 'Колонна',
        defaultWidth: 14,
        defaultHeight: 14,
        bgColor: 'bg-white/10',
        textColor: 'text-white/30',
        zIndex: 3,
    },
    window: {
        icon: 'lucide:square',
        label: 'Окно',
        defaultWidth: 60,
        defaultHeight: 12,
        bgColor: 'bg-sky-400/30',
        textColor: 'text-sky-300',
        zIndex: 2,
    },

    // Зоны
    vip_zone: {
        icon: 'lucide:star',
        label: 'VIP-зона',
        defaultWidth: 150,
        defaultHeight: 150,
        bgColor: 'bg-brand/5',
        textColor: 'text-brand',
        zIndex: 1, // Ниже всех — это фон
    },
    terrace_zone: {
        icon: 'lucide:sun',
        label: 'У окна',
        defaultWidth: 100,
        defaultHeight: 300,
        bgColor: 'bg-sky-400/5',
        textColor: 'text-sky-300',
        zIndex: 1,
    },
}

/**
 * Получить конфиг элемента по типу
 */
export function getElementConfig(type: ElementType): ElementConfig {
    return FLOOR_ELEMENTS[type]
}
