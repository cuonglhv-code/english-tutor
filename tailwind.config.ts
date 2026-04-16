import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0F14",
        surface: "#161A24",
        surfaceAlt: "#1E2330",
        border: "#2A2F3E",
        primary: {
          DEFAULT: "#6C63FF",
          hover: "#5A52E0",
          glow: "rgba(108,99,255,0.25)",
        },
        accent: {
          DEFAULT: "#00D4B1",
          hover: "#00B89A",
          glow: "rgba(0,212,177,0.20)",
        },
        band9: "#FFD700",
        band7: "#00D4B1",
        band6: "#6C63FF",
        band5: "#FF8C42",
        band4: "#FF4F6B",
        textPrimary: "#F0F2FF",
        textSecondary: "#8B92A9",
        textMuted: "#4E5469",
        "jaxtina-red": "#b7131d",
        "jaxtina-blue": "#005cab",
        "jaxtina-grey": "#404753",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        serif: ["Lora", "serif"],
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "2rem",
      },
      screens: {
        xs: "375px",
      },
      boxShadow: {
        stitched: "0px 20px 40px rgba(26, 28, 28, 0.08)",
        card: "0 4px 24px 0 rgba(0,0,0,0.04)",
        "card-hover": "0 8px 32px 0 rgba(0,0,0,0.08)",
        "card-premium": "0 20px 50px -12px rgba(0, 0, 0, 0.08)",
        primaryGlow: "0 0 20px rgba(108,99,255,0.4)",
        primaryGlowHover: "0 0 28px rgba(108,99,255,0.6)",
        accentGlow: "0 0 20px rgba(0,212,177,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
