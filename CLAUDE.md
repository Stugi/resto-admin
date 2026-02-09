# Resto Admin — Restaurant Management Dashboard

## Tech Stack
- **Framework:** Nuxt 4.2 + Vue 3.5 + TypeScript
- **Styling:** Tailwind CSS v4 (через `@tailwindcss/vite`, НЕ tailwind.config)
- **State:** Pinia 3
- **DB:** PostgreSQL + Prisma 6
- **Validation:** Zod 4
- **Icons:** @nuxt/icon с Lucide (`lucide:icon-name`)
- **Fonts:** Cormorant Garamond (display), DM Sans (body)

## Commands
- `npm run dev` — dev server
- `npm run build` — prisma generate + migrate + nuxt build
- `npx nuxi typecheck` — проверка типов

## Architecture Rules

### Components
- Все компоненты лежат в `app/components/` в папках по фичам: `base/`, `booking/`, `floor-map/`, `sidebar/`, `reservations/`, `dashboard/`, `layout/`
- `pathPrefix: false` — компоненты авто-импортируются без префикса папки (`BaseButton`, не `BaseBaseButton`)
- Пропсы через `defineProps<Type>()`, модели через `defineModel<Type>()`
- Компоненты должны быть переиспользуемыми. Не хардкодить данные внутри — всё через props/slots
- Используй `<slot>` для гибкости контента. НЕ используй `<Teleport>` если можно обойтись слотами

### TypeScript
- Все типы в `types/index.ts` — НЕ в компонентах
- Prisma-типы расширяй через `extends` или `&` (`TableWithStatus extends Table`)
- Для констант используй `as const` + вывод типов (`typeof X[number]['key']`)

### Styling — Design System
- Все кастомные переменные объявлены в `app/assets/css/main.css` через `@theme {}`
- Цвета: `brand` (#d4a853), `brand-dim`, `brand-light`, `bg`, `surface`, `surface-light`, `border`, `success`, `warning`, `danger`, `muted`
- **НИКОГДА не хардкодь цвета** (`text-[#FF5733]` — ЗАПРЕЩЕНО). Используй дизайн-токены: `text-brand`, `bg-surface`, `text-muted`
- Если нужен новый цвет — добавь переменную в `@theme {}`, не пиши инлайн
- Spacing: 4px grid (spacing-1 = 4px, spacing-2 = 8px и т.д.)
- Border-radius: `radius-sm` (4px) → `radius-full` (9999px)
- Тени: `shadow-sm` → `shadow-xl`, `shadow-glow` (золотое свечение)
- Transitions: `duration-fast` (150ms), `duration-normal` (200ms), `duration-slow` (300ms)

### Responsive
- Mobile-first: базовые стили = мобильные, расширяем через `sm:`, `md:`, `lg:`
- Breakpoints определены в `@theme {}`: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px)
- `lg` (1024px) — точка перехода mobile → desktop layout
- Мобильные: bottom-sheet модалки, bottom bar с CTA, горизонтальный скролл для фильтров/дат
- Десктоп: sidebar layout, centered модалки, hover-состояния
- Для приподнятых элементов (карточки, кнопки на тёмном фоне) используй `surface-light`, НЕ создавай `surface-elevated`

### Icons
- ТОЛЬКО Lucide через @nuxt/icon: `<Icon name="lucide:icon-name" />`
- НЕ подключай другие библиотеки иконок (heroicons, phosphor и т.д.)
- Если нужной иконки нет в Lucide — спроси, не ставь вторую либу

### Tailwind CSS v4
- Конфиг через `@theme {}` в CSS, НЕ через tailwind.config.js (его нет!)
- Утилиты: `@layer utilities {}` в main.css
- НЕ ставь tailwind v3 и НЕ создавай tailwind.config

### File Structure
- Constants: `app/constants/` (floorElements.ts, tableStatuses.ts)
- Composables: `app/composables/` (useDashboardDate, usePhoneMask, useToast)
- Stores: `app/stores/`
- Pages: `app/pages/`
- Server API: `server/api/`
- DB Schema: `prisma/schema.prisma`

### Prisma
- Мягкое удаление через `deletedAt` + audit fields (`createdBy`, `updatedBy`, `deletedBy`)
- После изменения schema: `npx prisma migrate dev --name описание`

## Prototypes
- HTML прототипы (макеты страниц) лежат в `docs/prototypes/`
- Перед вёрсткой нового экрана — посмотри прототип в этой папке
- Прототип = референс по структуре, не по точным пикселям
- `resto-admin-mobile.html` — мобильная версия: список бронирований, date picker, bottom-sheet модалки, форма нового бронирования

## Code Style
- Язык комментариев: русский
- Vue SFC: `<script setup lang="ts">` всегда первым блоком
- Не используй Options API
- Деструктуризация импортов
