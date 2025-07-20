/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'term-black': '#000000',
        'term-white': '#E0E0E0',
        'term-gray': '#808080',
        'term-gray-dark': '#333333',
        'term-gray-light': '#CCCCCC',
        'term-green': '#00CC00',
        'term-yellow': '#FFD700',
        'term-red': '#FF0000',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
        'logo': ['Bitcount', 'monospace'],
      },
      animation: {
        'typewriter': 'typewriter 0.1s steps(1) infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scanlines': 'scanlines 8s linear infinite',
      },
      keyframes: {
        typewriter: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            filter: 'brightness(1)',
          },
          '50%': { 
            opacity: '0.8',
            filter: 'brightness(1.2)',
          },
        },
        scanlines: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}