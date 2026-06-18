/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        zelux: {
          black: '#0A0A0A',
          white: '#FAFAFA',
          gold: '#C9A84C',
          'gold-light': '#E8C97A',
          gray: '#6B6B6B',
          'gray-light': '#F2F2F2',
          'gray-mid': '#D4D4D4',
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest-xl': '0.25em',
      }
    },
  },
  plugins: [],
}
