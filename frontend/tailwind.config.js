/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lime: {
          accent: '#c8ff2e',
        }
      }
    },
  },
  plugins: [],
}
