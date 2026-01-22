export default {
    theme: {
      extend: {
        // Типографика в rem
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],   // 10px
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      },
      
      // Кастомные отступы и размеры (Spacing)
      spacing: {
        'safe': '2rem',      // 32px — стандартный внешний отступ страницы
        'sidebar': '16rem',  // 256px — ширина сайдбара
        'panel': '20rem',    // 320px — ширина правой панели
        'header': '4rem',    // 64px — высота хедера
      },
        colors: {
          brand: {
            DEFAULT: 'var(--color-brand)',
            light: 'var(--color-brand-light)',
          },
          bg: 'var(--color-bg)',
          surface: {
            DEFAULT: 'var(--color-surface)',
            light: 'var(--color-surface-light)',
          },
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
          muted: 'var(--color-muted)',
          'white-5': 'var(--color-border)',
        }
      }
    }
  }