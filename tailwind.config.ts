import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Inter Tight"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Source Serif 4"', "Georgia", "ui-serif", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Lehrly semantic tokens
        "bg-base": "hsl(var(--bg-base))",
        "bg-elevated": "hsl(var(--bg-elevated))",
        surface: "hsl(var(--surface))",
        "surface-elevated": "hsl(var(--surface-elevated))",
        "surface-1": "hsl(var(--surface-1))",
        "surface-2": "hsl(var(--surface-2))",
        "surface-3": "hsl(var(--surface-3))",
        hairline: "hsl(var(--hairline) / <alpha-value>)",
        "border-subtle": "hsl(var(--border-subtle) / <alpha-value>)",
        "border-default": "hsl(var(--border-default) / <alpha-value>)",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-tertiary": "hsl(var(--text-tertiary))",
        brand: {
          DEFAULT: "hsl(var(--brand))",
          hover: "hsl(var(--brand-hover))",
          soft: "hsl(var(--brand-soft))",
          muted: "hsl(var(--brand) / 0.10)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "10px",
        sm: "8px",
        input: "12px",
        card: "16px",
        large: "20px",
        pill: "999px",
      },
      fontSize: {
        h1: ["26px", { lineHeight: "1.15", letterSpacing: "-0.022em", fontWeight: "600" }],
        h2: ["19px", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" }],
        h3: ["15px", { lineHeight: "1.35", letterSpacing: "-0.005em", fontWeight: "600" }],
        body: ["14.5px", { lineHeight: "1.55", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "section-label": ["10.5px", { lineHeight: "1.2", letterSpacing: "0.1em", fontWeight: "600" }],
        button: ["14px", { lineHeight: "1.2", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.18)",
        soft: "0 1px 0 0 hsl(0 0% 100% / 0.04) inset, 0 2px 8px -4px rgb(0 0 0 / 0.35)",
        elevated: "0 1px 0 0 hsl(0 0% 100% / 0.05) inset, 0 24px 48px -24px rgb(0 0 0 / 0.55)",
        "brand-glow": "0 8px 24px -10px hsl(var(--brand) / 0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(180deg, hsl(var(--brand-hover)) 0%, hsl(var(--brand)) 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.32s cubic-bezier(0.22, 0.61, 0.36, 1)",
        "soft-pulse": "soft-pulse 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

