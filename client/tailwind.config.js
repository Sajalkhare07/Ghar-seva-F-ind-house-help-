// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne:   ["Syne", "sans-serif"],
        dm:     ["DM Sans", "sans-serif"],
      },
      colors: {
        bg:       "#080810",
        surface:  "#0e0e1a",
        surface2: "#13131f",
        blue:     "#4f8ef7",
        purple:   "#9b5cff",
        cyan:     "#00d4ff",
        green:    "#00e5a0",
        orange:   "#ff7b3a",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};