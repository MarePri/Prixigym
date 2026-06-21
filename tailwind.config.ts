import type { Config } from 'tailwindcss'

// Theme tokens live as CSS variables in src/styles/globals.css.
// This file just wires Tailwind utilities to those variables so the
// palette can be tuned in one place without touching components.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
        },
        xp: 'rgb(var(--color-xp) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        glow: '0 0 24px -4px rgb(var(--color-primary) / 0.45)',
      },
    },
  },
  plugins: [],
} satisfies Config
