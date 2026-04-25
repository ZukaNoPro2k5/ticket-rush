import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#d97706',
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f',
        },
        ink: { DEFAULT: '#1c1917', 900: '#1c1917', 700: '#44403c', 500: '#78716c', 300: '#a8a29e' },
        surface: { DEFAULT: '#fafaf9', 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4' },
        line: { DEFAULT: '#e7e5e4', 200: '#e7e5e4', 300: '#d6d3d1' },
      },
      fontFamily: {
        sans: ['var(--font-be-vietnam-pro)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'var(--font-be-vietnam-pro)', 'sans-serif'],
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(28, 25, 23, 0.08)',
        lift: '0 12px 32px -8px rgba(28, 25, 23, 0.18)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
