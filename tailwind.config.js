/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF9',
          100: '#FDF8F3',
          200: '#FAF0E6',
          300: '#F5E6D3',
        },
        gold: {
          300: '#E8C9A0',
          400: '#D4A574',
          500: '#C4934A',
          600: '#A67C3D',
        },
        burgundy: {
          500: '#8B3A42',
          600: '#722F37',
          700: '#5C262D',
          800: '#461D23',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
