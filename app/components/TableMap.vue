<!-- components/TableMap.vue -->
<script setup lang="ts">
    defineProps<{
      tables: any[]
    }>()
    </script>
    
<!-- components/TableMap.vue -->
<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      <div 
        v-for="table in tables" 
        :key="table.id"
        class="group relative aspect-square bg-surface border border-white-5 rounded-3xl flex flex-col items-center justify-center p-6 hover:border-brand/40 transition-all cursor-pointer shadow-sm hover:shadow-2xl"
      >
        <!-- Динамический индикатор статуса -->
        <div 
          class="absolute top-4 right-4 w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          :class="{
            'bg-success shadow-success/40': table.status === 'free',
            'bg-warning shadow-warning/40': table.status === 'reserved',
            'bg-danger shadow-danger/40': table.status === 'busy'
          }"
        ></div>
        
        <span class="text-4xl font-black mb-2">{{ table.name }}</span>
        <div class="flex items-center gap-1.5 text-muted text-2xs font-bold uppercase tracking-widest">
          {{ table.capacity }} места
        </div>
      </div>
    </div>
  </template>