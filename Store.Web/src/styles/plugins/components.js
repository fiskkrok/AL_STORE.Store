// src/styles/plugins/components.js
const plugin = require('tailwindcss/plugin')

module.exports = plugin(function ({ addComponents, theme })
{
    addComponents({
        // Product Card Patterns
        '.product-card': {
            '@apply rounded-lg border bg-card overflow-hidden transition-all duration-200 hover:shadow-md': {},
            '&:hover': {
                '@apply transform -translate-y-1': {},
            },
            '.product-image': {
                '@apply aspect-square w-full object-cover': {},
            },
            '.product-content': {
                '@apply p-4 space-y-2': {},
            },
            '.product-title': {
                '@apply font-medium text-lg text-foreground line-clamp-2': {},
            },
            '.product-price': {
                '@apply text-lg font-bold text-foreground': {},
            },
            '.product-description': {
                '@apply text-sm text-muted-foreground line-clamp-2': {},
            }
        },

        // Form Patterns
        '.form-group': {
            '@apply space-y-2': {},
            '.form-label': {
                '@apply block text-sm font-medium text-foreground': {},
            },
            '.form-input': {
                '@apply w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent': {},
            },
            '.form-helper': {
                '@apply text-sm text-muted-foreground': {},
            },
            '.form-error': {
                '@apply text-sm text-destructive': {},
            }
        },

        // Button Variations
        '.btn': {
            '@apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none': {},
            '&.btn-lg': {
                '@apply h-11 px-8 text-base': {},
            },
            '&.btn-sm': {
                '@apply h-8 px-4 text-xs': {},
            },
            '&.btn-icon': {
                '@apply h-10 w-10': {},
            }
        },

        // Grid Layout Patterns
        '.product-grid': {
            '@apply grid gap-4 sm:gap-6': {},
            '@apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4': {},
        },

        // Section Patterns
        '.section': {
            '@apply py-8 md:py-12': {},
            '.section-header': {
                '@apply mb-8': {},
                'h2': {
                    '@apply text-2xl font-bold tracking-tight': {},
                },
                'p': {
                    '@apply mt-2 text-muted-foreground': {},
                }
            }
        },

        // Modal Patterns
        '.modal': {
            '@apply fixed inset-0 z-50 bg-background/80 backdrop-blur-sm': {},
            '.modal-content': {
                '@apply fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg': {},
            },
            '.modal-header': {
                '@apply flex items-center justify-between': {},
            },
            '.modal-close': {
                '@apply rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100': {},
            }
        }
    })
})