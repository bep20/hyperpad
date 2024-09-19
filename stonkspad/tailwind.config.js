/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    fontFamily: {
      Bebas: "'Bebas Neue', sans-serif",
    },
    extend: {
      colors: {
        'main-background-color': 'var(--main-background-color)',
        'main-border-color': 'var(--main-border-color)',
        'primary-color': 'var(--primary-color)',
      },
      screens: {
        '2xl': { max: '1535px' },
        xl: { max: '1279px' },
        lg: { max: '1023px' },
        md: { max: '767px' },
        sm: { max: '639px' },
      },
    },
  },
  plugins: [],

  important: true,

  //   important: true,
};
