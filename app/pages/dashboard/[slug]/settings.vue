<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface ApiKeyItem {
    id: string
    name: string
    prefix: string
    scope: string
    lastUsedAt: string | null
    revokedAt: string | null
    createdAt: string
}

const route = useRoute()
const slug = computed(() => (route.params as { slug: string }).slug)

const keys = ref<ApiKeyItem[]>([])
const allowedOrigins = ref<string[]>([])
const loading = ref(false)
const error = ref('')

// Создание ключа
const newKeyName = ref('')
const newKeyScope = ref<'server' | 'public_widget'>('server')
const creating = ref(false)
// plain-ключ показывается ровно один раз после создания
const justCreatedKey = ref<{ id: string; name: string; key: string } | null>(null)

// Origins
const originsDraft = ref('')
const savingOrigins = ref(false)

async function loadKeys() {
    loading.value = true
    error.value = ''
    try {
        const data = await $fetch<{ keys: ApiKeyItem[]; allowedOrigins: string[] }>(
            `/api/restaurants/${slug.value}/api-keys`
        )
        keys.value = data.keys
        allowedOrigins.value = data.allowedOrigins
        originsDraft.value = data.allowedOrigins.join('\n')
    } catch (e: any) {
        error.value = e?.statusMessage ?? 'Ошибка загрузки'
    } finally {
        loading.value = false
    }
}

async function createKey() {
    if (!newKeyName.value.trim()) return
    creating.value = true
    error.value = ''
    try {
        const created = await $fetch<{ id: string; name: string; key: string; prefix: string; scope: string; createdAt: string }>(
            `/api/restaurants/${slug.value}/api-keys`,
            {
                method: 'POST',
                body: { name: newKeyName.value.trim(), scope: newKeyScope.value }
            }
        )
        justCreatedKey.value = { id: created.id, name: created.name, key: created.key }
        newKeyName.value = ''
        newKeyScope.value = 'server'
        await loadKeys()
    } catch (e: any) {
        error.value = e?.statusMessage ?? 'Не удалось создать ключ'
    } finally {
        creating.value = false
    }
}

async function revokeKey(id: string) {
    if (!confirm('Отозвать ключ? После отзыва его нельзя восстановить.')) return
    try {
        await $fetch(`/api/restaurants/${slug.value}/api-keys/${id}`, { method: 'DELETE' })
        await loadKeys()
    } catch (e: any) {
        error.value = e?.statusMessage ?? 'Не удалось отозвать ключ'
    }
}

async function copyKey(key: string) {
    try {
        await navigator.clipboard.writeText(key)
    } catch { /* пользователь скопирует руками */ }
}

async function saveOrigins() {
    savingOrigins.value = true
    error.value = ''
    try {
        const list = originsDraft.value
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        const updated = await $fetch<{ allowedOrigins: string[] }>(
            `/api/restaurants/${slug.value}/allowed-origins`,
            { method: 'PATCH', body: { allowedOrigins: list } }
        )
        allowedOrigins.value = updated.allowedOrigins
        originsDraft.value = updated.allowedOrigins.join('\n')
    } catch (e: any) {
        error.value = e?.statusMessage ?? 'Не удалось сохранить origins'
    } finally {
        savingOrigins.value = false
    }
}

function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(loadKeys)
</script>

<template>
    <div class="max-w-4xl mx-auto p-6 lg:p-10 space-y-10 text-white">
        <header>
            <h1 class="text-3xl font-display font-bold">Настройки</h1>
            <p class="text-muted mt-1">Управление публичным API и интеграциями</p>
        </header>

        <!-- Уведомление об ошибке -->
        <div v-if="error" class="bg-danger/10 border border-danger/30 rounded-xl p-4 text-danger">
            {{ error }}
        </div>

        <!-- Только что созданный ключ -->
        <div v-if="justCreatedKey" class="bg-brand/10 border border-brand/40 rounded-xl p-5 space-y-3">
            <div class="flex items-start gap-3">
                <Icon name="lucide:key-round" class="text-brand mt-1 size-5" />
                <div class="flex-1">
                    <h3 class="font-bold">Ключ создан: {{ justCreatedKey.name }}</h3>
                    <p class="text-2xs text-muted mt-1">
                        Скопируйте сейчас — после закрытия его нельзя будет восстановить.
                    </p>
                </div>
            </div>
            <div class="flex gap-2">
                <code class="flex-1 bg-surface px-3 py-2 rounded-lg font-mono text-sm break-all">{{ justCreatedKey.key }}</code>
                <button
                    type="button"
                    class="px-4 py-2 bg-brand text-black rounded-lg font-bold hover:bg-brand-light transition"
                    @click="copyKey(justCreatedKey.key)"
                >
                    Копировать
                </button>
            </div>
            <button
                type="button"
                class="text-2xs text-muted hover:text-white transition"
                @click="justCreatedKey = null"
            >
                Я скопировал, закрыть
            </button>
        </div>

        <!-- API ключи -->
        <section class="space-y-5">
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold">API ключи</h2>
            </div>

            <!-- Создание -->
            <div class="bg-surface rounded-2xl p-5 space-y-4 border border-white-5">
                <h3 class="font-bold">Создать новый ключ</h3>
                <div class="grid lg:grid-cols-[1fr_200px_auto] gap-3 items-end">
                    <BaseInput v-model="newKeyName" label="Название" placeholder="Например: Сайт ресторана" />
                    <div class="space-y-2">
                        <label class="block text-2xs font-bold text-muted uppercase tracking-widest">Тип</label>
                        <select
                            v-model="newKeyScope"
                            class="w-full bg-surface-light border border-white-5 rounded-xl px-4 py-3 focus:border-brand outline-none transition"
                        >
                            <option value="server">Server (полный)</option>
                            <option value="public_widget">Public widget</option>
                        </select>
                    </div>
                    <button
                        type="button"
                        class="px-6 py-3 bg-brand text-black rounded-xl font-bold hover:bg-brand-light transition disabled:opacity-30"
                        :disabled="creating || !newKeyName.trim()"
                        @click="createKey"
                    >
                        {{ creating ? 'Создание...' : 'Создать' }}
                    </button>
                </div>
            </div>

            <!-- Список -->
            <div v-if="loading" class="text-muted text-center py-8">Загрузка...</div>
            <div v-else-if="keys.length === 0" class="text-muted text-center py-8">
                Ключей пока нет
            </div>
            <ul v-else class="space-y-2">
                <li
                    v-for="k in keys"
                    :key="k.id"
                    class="bg-surface rounded-xl p-4 border border-white-5 flex items-center gap-4"
                    :class="{ 'opacity-50': k.revokedAt }"
                >
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-bold">{{ k.name }}</span>
                            <span class="text-2xs text-muted bg-surface-light px-2 py-0.5 rounded">{{ k.scope }}</span>
                            <span v-if="k.revokedAt" class="text-2xs text-danger">отозван</span>
                        </div>
                        <div class="text-2xs text-muted mt-1 font-mono">{{ k.prefix }}…</div>
                        <div class="text-2xs text-muted mt-0.5">
                            Использован: {{ formatDate(k.lastUsedAt) }} · Создан: {{ formatDate(k.createdAt) }}
                        </div>
                    </div>
                    <button
                        v-if="!k.revokedAt"
                        type="button"
                        class="text-danger text-2xs font-bold hover:underline"
                        @click="revokeKey(k.id)"
                    >
                        Отозвать
                    </button>
                </li>
            </ul>
        </section>

        <!-- Allowed origins -->
        <section class="space-y-5">
            <div>
                <h2 class="text-xl font-bold">Разрешённые домены (CORS)</h2>
                <p class="text-2xs text-muted mt-1">
                    Список origin'ов, с которых браузер может вызывать публичный API.
                    Один origin на строку. Например: https://restaurant.com
                </p>
            </div>
            <div class="bg-surface rounded-2xl p-5 space-y-3 border border-white-5">
                <textarea
                    v-model="originsDraft"
                    rows="4"
                    placeholder="https://restaurant.com&#10;https://www.restaurant.com"
                    class="w-full bg-surface-light border border-white-5 rounded-xl px-4 py-3 focus:border-brand outline-none transition placeholder:text-muted/40 font-mono text-sm"
                />
                <button
                    type="button"
                    class="px-6 py-3 bg-brand text-black rounded-xl font-bold hover:bg-brand-light transition disabled:opacity-30"
                    :disabled="savingOrigins"
                    @click="saveOrigins"
                >
                    {{ savingOrigins ? 'Сохранение...' : 'Сохранить' }}
                </button>
            </div>
        </section>
    </div>
</template>
