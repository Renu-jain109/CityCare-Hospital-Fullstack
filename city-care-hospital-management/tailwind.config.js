/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css,scss}"
  ],
  theme: {
    extend: {
      colors: {
       'primary': '#005EB8',
       'secondary': '#00AEEF',
       'accent': '#FFD700',
       'light-blue': '#00A3E0',
       'success': '#28A745',
       'danger': '#D32F2F',
       'neutral': '#F8FAF9',
       'appointment-blue': '#2D6CDF',
       'medicine-green': '#27A776',
       'emergency-red': '#E94A47',
       'doctor-sky-blue': '#4AA3F0'
      },

      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
