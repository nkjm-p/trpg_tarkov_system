/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tarkov: {
          bg: '#15171a',
          panel: '#1d2023',
          panelLight: '#262a2e',
          border: '#3a3f44',
          grid: '#22262a',
          gridLine: '#3a3f44',
          accent: '#8a9a5b',
          accentDim: '#5c6b3f',
          danger: '#b3402f',
          warn: '#c9a13b',
          text: '#d8dad5',
          textDim: '#8b9089',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
        sans: ['"Rajdhani"', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        cell: 'inset 0 0 0 1px rgba(58,63,68,0.6)',
      },
    },
  },
  plugins: [],
}
