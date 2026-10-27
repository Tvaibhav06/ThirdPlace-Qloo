import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '390px', // Mobile baseline screen width
      },
      colors: {
        parchment: {
          50: '#faf9f5',
          100: '#f6f4ee',
          200: '#efeae1',
          300: '#e6e0d4',
          400: '#ded7c7',
          500: '#c5bba7',
          800: '#57534e',
          900: '#1c1917',
          950: '#121212',
        },
        obsidian: '#121212',
        ink: {
          primary: '#18181b',
          secondary: '#57534e',
          muted: '#857f72',
          border: '#1c1917',
          borderMuted: '#d4cdbe',
        },
        editorial: {
          crimson: '#b91c1c',
          crimsonBg: '#fee2e2',
          sage: '#15803d',
          sageBg: '#dcfce7',
          ochre: '#b45309',
          ochreBg: '#fef3c7',
        },
        brand: {
          50: '#f6f4ee',
          100: '#efeae1',
          500: '#121212',
          600: '#000000',
          700: '#1c1917',
          900: '#121212',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Playfair Display', 'Times New Roman', 'serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
