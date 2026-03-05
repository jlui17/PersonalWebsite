module.exports = {
  content: ["./**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      heading: ['var(--font-heading)', 'Quicksand', 'sans-serif'],
      body: ['var(--font-body)', 'Work Sans', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
    extend: {
      colors: {
        // Theme-aware colors using CSS variables
        theme: {
          main: "var(--bg-main)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)",
          hover: "var(--bg-hover)",
        },
        text: {
          main: "var(--text-main)",
          muted: "var(--text-muted)",
          subtle: "var(--text-subtle)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-primary-hover)",
          secondary: "var(--accent-secondary)",
        },
        heading: "var(--heading-color)",
      },
    },
  },
  plugins: [],
};
