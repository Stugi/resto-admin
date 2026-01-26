import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Remove @nuxtjs/tailwindcss from modules
  modules: ['@nuxt/icon'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // Remove postcss config - not needed with Vite plugin
})