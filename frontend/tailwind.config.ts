import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: '#ff6b35',
          light: '#fff7f0',
          dark: '#e55a2b',
        },
        navy: {
          DEFAULT: '#1e293b',
          dark: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['var(--font-be-vietnam-pro)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
