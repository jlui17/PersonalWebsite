module.exports = {
  mode: "jit",
  important: true,
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    fontFamily: {
      heading: ["Quicksand", "sans-serif"],
      body: ["Work Sans", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],
};
