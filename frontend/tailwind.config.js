/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          accent: '#ff6500',
        }
      }
    },
  },
  plugins: [],
}
