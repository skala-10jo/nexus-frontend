/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          primary: '#FF6B3D',
          medium: '#FF8A5C',
          light: '#FFA07A',
        }
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(180deg, #FF6B3D 0%, #FF8A5C 50%, #FFA07A 100%)',
      }
    },
  },
  plugins: [],
}
