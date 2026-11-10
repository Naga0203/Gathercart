/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9f2',
          100: '#d7f1e0',
          200: '#b1e3c3',
          500: '#15803d',
          600: '#166534',
          700: '#14532d',
          800: '#0f3f22',
          900: '#0c331c',
        }
      }
    },
  },
  plugins: [],
}
