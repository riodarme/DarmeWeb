/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./pages/**/*.{html,js,ts,jsx,tsx}",
    "./components/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Times New Roman", "Times", "serif"],
        mono: ["Courier New", "Courier", "monospace"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // tambahkan plugin lainnya
  ],
};
