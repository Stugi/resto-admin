<script setup lang="ts">
import type { TableWithStatus } from '~~/types'

    const props = defineProps<{
      table: TableWithStatus,
    }>()
    
    const statusClasses = computed(() => ({
  'bg-success shadow-success/40': props.table.status === 'free',
  'bg-warning shadow-warning/40': props.table.status === 'reserved',
  'bg-danger shadow-danger/40': props.table.status === 'busy'
}))
    </script>
    
    <template>
      <div class="group relative aspect-square bg-surface border border-white-5 rounded-3xl flex flex-col items-center justify-center p-6 hover:border-brand/40 transition-all cursor-pointer shadow-sm hover:shadow-2xl">
        <!-- Индикатор статуса через computed -->
        <div 
          class="absolute top-4 right-4 w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors duration-500"
          :class="statusClasses"
        ></div>
        
        <span class="text-4xl font-black mb-2">{{ table.name }}</span>
        <div class="text-muted text-2xs font-bold uppercase tracking-widest">
          {{ table.capacity }} места
        </div>
      </div>
    </template>