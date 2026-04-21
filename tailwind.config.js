/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  safelist: [
    // Variance column (Complete, Summary, Combined): ensure these are always in the build
    "!bg-[#c6efce]",
    "dark:!bg-green-900/50",
    "!bg-[#ffc7ce]",
    "dark:!bg-red-950/50",
    "text-green-800",
    "dark:text-green-300",
    "font-semibold",
    "text-red-800",
    "dark:text-red-300"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

