import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

export default withNuxt(
  {
    rules: {
      'vue/multi-word-component-names': 'off', // Чтобы можно было называть компоненты Table.vue
      'no-console': 'warn'
    }
  },
  // Всегда последним!
  prettier 
)