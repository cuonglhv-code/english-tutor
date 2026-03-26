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
        "jaxtina-red": "#b7131d",
        "jaxtina-blue": "#005cab",
        "jaxtina-grey": "#404753",
        primary: {
          DEFAULT: "var(--primary)",
          container: "var(--primary-container)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          container: "var(--secondary-container)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          bright: "var(--surface-bright)",
          container: {
            DEFAULT: "var(--surface-container)",
            low: "var(--surface-container-low)",
            lowest: "var(--surface-container-lowest)",
          },
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
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
        stitched: "0px 20px 40px rgba(26, 28, 28, 0.06)",
        card: "0 4px 24px 0 rgba(0,0,0,0.04)",
        "card-hover": "0 8px 32px 0 rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
