const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite-datepicker/dist/**/*.js",
  ],
  theme: {
    extend: {},
    screens: {
      xs: "475px",
      ...defaultTheme.screens,
    },
  },
  darkMode: "class",
  plugins: [require("flowbite/plugin")],
};
