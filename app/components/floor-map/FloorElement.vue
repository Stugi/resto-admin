<!-- app/components/floor-map/FloorElement.vue -->
<!--
  Декоративный элемент на схеме зала

  Позиционируется абсолютно через posX/posY
  Разные стили для разных типов (кухня, бар, растения, VIP-зона)
-->
<script setup lang="ts">
import type { ZoneElement } from "~~/types"
import { getElementConfig } from "~/constants/floorElements"

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
 * Зоны-оверлеи рендерятся как полупрозрачные области с лейблом
 */
const isZone = computed(
    () => props.element.type === "vip_zone" || props.element.type === "terrace_zone",
)

/**
 * Стены рендерятся без иконки
 */
const isWall = computed(() => props.element.type === "wall_h" || props.element.type === "wall_v")
</script>

<template>
    <div
        class="floor-element"
        :class="[
            config.bgColor,
            {
                'is-zone': isZone,
                'is-wall': isWall,
                'zone-vip': element.type === 'vip_zone',
                'zone-window': element.type === 'terrace_zone',
            },
        ]"
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
            <Icon
                :name="config.icon"
                class="element-icon"
                :class="config.textColor"
                :size="config.iconSize ?? 16"
            />
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

/* Зоны-оверлеи — только пунктирная рамка, БЕЗ фона */
.floor-element.is-zone {
    border: 2px dashed var(--color-white-10);
    border-radius: var(--radius-xl);
    background: transparent;
}

/* VIP-зона — золотая пунктирная рамка */
.floor-element.is-zone.zone-vip {
    border: 2px dashed var(--color-brand);
}

/* Зона у окна — голубая пунктирная рамка */
.floor-element.is-zone.zone-window {
    border: 2px dashed var(--color-sky);
}

/* Лейбл зоны — сидит на рамке и «разрывает» её фоном */
.zone-label {
    position: absolute;
    top: -9px;
    left: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 6px;
    background: var(--color-bg);
    font-size: var(--font-size-2xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
    line-height: 1;
}

/* Стена — просто линия */
.floor-element.is-wall {
    border-radius: 2px;
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
