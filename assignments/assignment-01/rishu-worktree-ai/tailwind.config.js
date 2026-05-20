/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "BIZ UDPGothic",
          "Yu Gothic UI",
          "Hiragino Sans",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
