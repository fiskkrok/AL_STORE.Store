// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,ts}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Brand colors
        brand: {
          navy: "#1A2238",
          gray: "#9BA0A8",
          copper: "#C17F59",
        },
        // Semantic colors
        primary: {
          DEFAULT: "hsl(var(--primary))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... existing shadcn colors ...
      },
      spacing: {
        // Custom spacing scale
        '4.5': '1.125rem',
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
      fontSize: {
        // Typography scale
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        'display': ['3.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
        display: ["Inter Tight", ...fontFamily.sans],
      },
      borderRadius: {
        // ... existing radius config ...
      },
      animation: {
        // Custom animations
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addBase, theme })
    {
      addBase({
        // CSS Custom Properties for dynamic values
        ':root': {
          '--header-height': '4rem',
          '--sidebar-width': '16rem',
        },
        // Base styles
        'html': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
        'body': {
          backgroundColor: theme('colors.background'),
          color: theme('colors.foreground'),
        },
      });
    },
  ],
}