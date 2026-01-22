<!-- components/TableMap.vue -->
<script setup lang="ts">
    defineProps<{
      tables: any[]
    }>()
    </script>
    
    <template>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          <TableCard 
            v-for="table in tables" 
            :key="table.id" 
            :table="table" 
          />
        </div>
      </template>