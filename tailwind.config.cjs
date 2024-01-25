module.exports = {
  mode: "jit",
  important: true,
  content: ["./**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      heading: ["Quicksand", "sans-serif"],
      body: ["Work Sans", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],
};
