<!-- pages/index.vue -->
<script setup lang="ts">

    // Используем именованные слоты лейаута через DefinePageMeta или обычные слоты
    // Для начала оставим логику данных здесь
    const { data: zones, pending } = await useFetch('/api/zones')
    const activeZoneId = ref<string | null>(null)
    
    watchEffect(() => {
      if (zones.value?.length && !activeZoneId.value) {
        activeZoneId.value = zones.value[0]?.id ?? null
      }
    })
    
    const currentZone = computed(() => zones.value?.find(z => z.id === activeZoneId.value))
    
    const isMounted = ref<boolean>(false)

onMounted(() => {
  isMounted.value = true
})
    // SEO-оптимизация (Senior-подход)
    useHead({
      title: 'RestoAdmin — Карта столов'
    })
    </script>
    
<template>
    <div class="space-y-8">
      <!-- Переключатель зон -->
      <div class="flex gap-2 p-1 bg-surface-light w-fit rounded-2xl border border-white-5">
        <button 
          v-for="zone in zones" 
          :key="zone.id"
          @click="activeZoneId = zone.id"
          :class="[
            'px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300',
            activeZoneId === zone.id 
              ? 'bg-brand text-black shadow-lg shadow-brand/10' 
              : 'text-muted hover:text-white'
          ]"
        >
          {{ zone.name }}
        </button>
      </div>
  
      <TableMap v-if="currentZone" :tables="currentZone.tables" />
    </div>
  
<ClientOnly>  
      <Teleport v-if="isMounted" to="#layout-sidebar">
       <div class="p-6 space-y-8">
          <div>
            <p class="text-2xs uppercase tracking-widest text-muted mb-4 font-bold">Брони</p>
            <div class="text-3xl font-bold">24 <span class="text-sm text-success font-medium">↑ 15%</span></div>
          </div>
          <div>
            <p class="text-2xs uppercase tracking-widest text-muted mb-4 font-bold">Загрузка</p>
            <div class="text-3xl font-bold">78% TODO: calculate load</div>
          </div>
        </div>
</Teleport>
</ClientOnly>

  </template>
