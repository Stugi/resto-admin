<!-- layouts/default.vue -->
<template>
    <div class="flex h-screen bg-bg text-white overflow-hidden">
      <!-- С использованием w-sidebar -->
      <aside class="w-sidebar border-r border-white-5 flex flex-col shrink-0">
        <div class="h-header flex items-center px-6 border-b border-white-5">
          <h1 class="text-brand text-xl font-bold tracking-tight">RestoAdmin</h1>
        </div>
        <div id="layout-sidebar" class="flex-1 overflow-y-auto scrollbar-thin"></div>
      </aside>
  
      <main class="flex-1 flex flex-col min-w-0">
        <!-- С использованием h-header -->
        <header class="h-header border-b border-white-5 flex items-center justify-between px-safe shrink-0">
          <div id="layout-header"></div>
          
          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-sm font-bold">Анна Новикова</p>
              <p class="text-2xs text-muted uppercase font-bold tracking-widest">Хостес</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center text-black font-bold">
              АН
            </div>
          </div>
        </header>
  
        <!-- С использованием p-safe -->
        <div class="flex-1 overflow-y-auto p-safe scrollbar-thin">
          <slot />
        </div>
      </main>
  
      <!-- С использованием w-panel -->
      <aside class="w-panel border-l border-white-5 bg-surface shrink-0 overflow-y-auto p-safe">
        <div id="layout-right-panel"></div>
      </aside>
    </div>
  </template>