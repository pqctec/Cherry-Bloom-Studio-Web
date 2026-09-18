/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#020814',
          900: '#050B18',
          800: '#071B3E',
          700: '#0A2A5C',
        },
        circuit: {
          bright: '#6FC3FF',
          DEFAULT: '#4FA8FF',
          dim: '#2E75B8',
          soft: '#9FD6FF',
        },
        bloom: {
          DEFAULT: '#D98CA6',
          deep: '#B8506F',
          pale: '#F2A6C4',
        },
      },
      fontFamily: {
        display: ['"Segoe UI"', 'system-ui', 'Arial', 'sans-serif'],
        body: ['"Segoe UI"', 'system-ui', 'Arial', 'sans-serif'],
        mono: ['Consolas', '"Courier New"', 'monospace'],
      },
      backgroundImage: {
        'ink-gradient': 'radial-gradient(circle at 15% 20%, #0A2A5C 0%, #071B3E 35%, #020814 75%)',
      },
    },
  },
  plugins: [],
}
