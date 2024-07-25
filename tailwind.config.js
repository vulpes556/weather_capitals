/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./frontend/*.{html,js}"],
  theme: {
    container:{
      center:true
    },
    extend: {
      colors: {
        'green': '#688D6E',
        'cat-orange': '#D07D4B',
        'cat-brown': '#925D4B',
        'cat-blue': '#B8DEF3',
        'banana-yellow': '#EEFA40',
        'cat-dark-gray': '#2E2E2E',
      },
      backgroundImage: theme => ({
        'custom-gradient': 'linear-gradient(to right, #EEFA40, #D07D4B)',
      }),
      spacing: {
        'map': '180px' 
      },
      borderRadius: {
        'abstract-shape-1': '9999px 0 9999px 0',
        'abstract-shape-2': '0 9999px 0 9999px',
        'abstract-shape-3': '0 9999px 9999px 0',
        'abstract-shape-4': '9999px 0 0 9999px',
        'abstract-shape-5': '7000px 7000px 1rem 1rem',
        'oval': '50%'
      }
    },
  },
  plugins: [],
}

