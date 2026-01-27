import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/icon', '@nuxt/fonts'],

  components: [
    {
      path: '~/components',
      pathPrefix: false, // Это позволит не добавлять имя папки к названию компонента
    },
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // Remove postcss config - not needed with Vite plugin
})