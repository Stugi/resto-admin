<!-- app/components/floor-map/FloorElement.vue -->
<!--
  Декоративный элемент на схеме зала

  Позиционируется абсолютно через posX/posY
  Разные стили для разных типов (кухня, бар, растения, VIP-зона)
-->
<script setup lang="ts">
import type { ZoneElement } from '~~/types'
import { getElementConfig } from '~/constants/floorElements'

interface Props {
    element: ZoneElement
}

const props = defineProps<Props>()

const config = computed(() => getElementConfig(props.element.type))

/**
 * Позиция элемента на схеме
 */
const positionStyle = computed(() => ({
    left: `${props.element.posX}%`,
    top: `${props.element.posY}%`,
    zIndex: config.value.zIndex,
}))

/**
 * Размеры элемента
 */
const sizeStyle = computed(() => {
    const width = props.element.width ?? config.value.defaultWidth ?? 50
    const height = props.element.height ?? config.value.defaultHeight ?? 50

    return {
        width: `${width}px`,
        height: `${height}px`,
    }
})

/**
 * VIP-зона рендерится как полупрозрачная область
 */
const isZone = computed(() => props.element.type === 'vip_zone')

/**
 * Стены рендерятся без иконки
 */
const isWall = computed(() =>
    props.element.type === 'wall_h' || props.element.type === 'wall_v'
)
</script>

<template>
    <div
        class="floor-element"
        :class="[config.bgColor, { 'is-zone': isZone, 'is-wall': isWall }]"
        :style="[positionStyle, sizeStyle]"
    >
        <!-- VIP-зона: только лейбл в углу -->
        <template v-if="isZone">
            <div class="zone-label" :class="config.textColor">
                <Icon :name="config.icon" class="w-4 h-4" />
                <span>{{ element.label || config.label }}</span>
            </div>
        </template>

        <!-- Стена: просто линия -->
        <template v-else-if="isWall">
            <!-- Пустой элемент, стиль задаётся через CSS -->
        </template>

        <!-- Обычный элемент: иконка + лейбл -->
        <template v-else>
            <Icon :name="config.icon" class="element-icon" :class="config.textColor" />
            <span v-if="element.label" class="element-label">
                {{ element.label }}
            </span>
        </template>
    </div>
</template>

<style scoped>
.floor-element {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border-radius: var(--radius-md);
    transition: all var(--duration-fast) var(--ease-out);
}

/* VIP-зона — большая область */
.floor-element.is-zone {
    border: 2px dashed color-mix(in srgb, var(--color-brand) 40%, transparent);
    border-radius: var(--radius-xl);
}

.zone-label {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--font-size-2xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
    opacity: 0.8;
}

/* Стена — просто линия */
.floor-element.is-wall {
    border-radius: 2px;
}

/* Обычные элементы */
.element-icon {
    width: 1.25rem;
    height: 1.25rem;
}

.element-label {
    font-size: var(--font-size-3xs);
    font-weight: 600;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
    white-space: nowrap;
}
</style>
