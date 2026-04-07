/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '390px',
        '3xl': '1600px',
      },
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
        quran: ['Amiri', 'serif'],
      },
    },
  },
  plugins: [],
};
