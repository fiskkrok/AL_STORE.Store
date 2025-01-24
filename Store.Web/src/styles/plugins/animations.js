// src/styles/plugins/animations.js
const plugin = require('tailwindcss/plugin')

module.exports = plugin(function ({ addUtilities })
{
    addUtilities({
        // Hover animations
        '.hover-lift': {
            '@apply transition-transform duration-200': {},
            '&:hover': {
                '@apply -translate-y-1': {},
            }
        },
        '.hover-scale': {
            '@apply transition-transform duration-200': {},
            '&:hover': {
                '@apply scale-105': {},
            }
        },

        // Loading states
        '.loading-skeleton': {
            '@apply animate-pulse bg-muted': {},
        },
        '.loading-spinner': {
            '@apply animate-spin': {},
        },

        // Fade animations
        '.fade-in': {
            '@apply animate-[fadeIn_200ms_ease-out]': {},
        },
        '.slide-up': {
            '@apply animate-[slideUp_200ms_ease-out]': {},
        },
        '.slide-down': {
            '@apply animate-[slideDown_200ms_ease-out]': {},
        },

        // Interactive feedback
        '.press-effect': {
            '@apply transition-transform active:scale-95': {},
        },
        '.click-bounce': {
            '@apply transition-transform active:scale-95 hover:scale-105': {},
        }
    })
})