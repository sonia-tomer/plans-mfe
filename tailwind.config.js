/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#673ab7',
          light: '#9575cd',
          dark: '#512da8',
        },
        success: '#4caf50',
        warning: '#ffc107',
        danger: '#f44336',
      },
      fontFamily: {
        'sf-pro-regular': ['SFProDisplay-Regular', 'sans-serif'],
        'sf-pro-medium': ['SFProDisplay-Medium', 'sans-serif'],
        'sf-pro-bold': ['SFProDisplay-Bold', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

