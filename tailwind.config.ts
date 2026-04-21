import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#070b14",
        panel: "#0f1728",
        muted: "#7f8ea3",
        border: "rgba(148, 163, 184, 0.16)",
        accent: "#62e4b5",
        danger: "#fb7185",
        warning: "#fbbf24",
        info: "#60a5fa"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(98, 228, 181, 0.15), 0 20px 80px rgba(5, 12, 24, 0.45)"
      },
      backgroundImage: {
        grid: "radial-gradient(circle at top, rgba(98, 228, 181, 0.12), transparent 28%), linear-gradient(180deg, rgba(15, 23, 40, 0.96) 0%, rgba(7, 11, 20, 1) 100%)"
      }
    }
  },
  plugins: []
};

export default config;
