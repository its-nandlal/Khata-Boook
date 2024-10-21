/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.ejs", // Add this line to include EJS files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
