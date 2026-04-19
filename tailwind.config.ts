import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Core palette — file 61 tokens */
        page: "var(--color-bg-page)",
        surface: {
          DEFAULT: "var(--color-bg-surface)",
          strong: "var(--color-bg-surface-strong)",
        },
        fg: {
          DEFAULT: "var(--color-fg-default)",
          secondary: "var(--color-fg-secondary)",
          muted: "var(--color-fg-muted)",
        },
        border: {
          DEFAULT: "var(--color-border-default)",
          strong: "var(--color-border-strong)",
        },
        accent: {
          green: "var(--color-accent-green)",
          "green-soft": "var(--color-accent-green-soft)",
        },
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
        info: "var(--color-info)",
        primary: {
          DEFAULT: "var(--color-primary-black)",
          hover: "var(--color-primary-black-hover)",
        },
      },
      borderRadius: {
        xs:   "var(--radius-xs)",
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        "2xl":"var(--radius-2xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        xs:      "var(--shadow-xs)",
        sm:      "var(--shadow-sm)",
        md:      "var(--shadow-md)",
        lg:      "var(--shadow-lg)",
        overlay: "var(--shadow-overlay)",
      },
      fontSize: {
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["13px", { lineHeight: "1.5" }],
        base: ["14px", { lineHeight: "1.5" }],
        md: ["15px", { lineHeight: "1.4" }],
        lg: ["18px", { lineHeight: "1.35" }],
        xl: ["24px", { lineHeight: "1.25" }],
        "2xl": ["30px", { lineHeight: "1.2" }],
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
    },
  },
  plugins: [animate],
} satisfies Config;
