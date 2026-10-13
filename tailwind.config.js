/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1a7532',
          lightGreen: '#e6f4ea',
          accent: '#c8e6c9'
        }
      }
    },
  },
  plugins: [],
}