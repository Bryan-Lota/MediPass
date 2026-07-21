import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1A1A",
        "ink-deep": "#152626",
        muted: "#5A6B6B",
        line: "#E2ECEC",
        teal: {
          50: "#F4FAFA",
          100: "#EAF6F6",
          200: "#A8DDDD",
          600: "#2E9E9E",
          700: "#176B6B",
        },
        indigo: {
          50: "#EEEEFC",
          100: "#E1E1FA",
          200: "#C2C2F5",
          500: "#5B54E0",
          600: "#4C44D6",
          700: "#3B34AE",
        },
        navy: {
          DEFAULT: "#211C55",
          deep: "#171341",
        },
        amber: {
          bg: "#FDF3DC",
          text: "#8A6400",
          border: "#F2B705",
        },
        danger: {
          bg: "#FBEAEA",
          text: "#B3352E",
          border: "#D98C86",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        display: ["var(--font-display)", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(14,26,26,.05)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 500ms ease-out both",
      },
      backgroundImage: {
        grid: "linear-gradient(#2E9E9E 1px, transparent 1px), linear-gradient(90deg, #2E9E9E 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
