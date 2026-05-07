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
        "border-subtle": "hsl(var(--border-subtle) / <alpha-value>)",
        "border-default": "hsl(var(--border-default) / <alpha-value>)",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary) / <alpha-value>)",
        "text-tertiary": "hsl(var(--text-tertiary) / <alpha-value>)",
        brand: {
          DEFAULT: "hsl(var(--brand))",
          hover: "hsl(var(--brand-hover))",
          muted: "hsl(var(--brand) / 0.1)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        input: "12px",
        card: "16px",
        large: "20px",
        pill: "999px",
      },
      fontSize: {
        h1: ["36px", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        h3: ["18px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        body: ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "section-label": ["11px", { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "600" }],
        button: ["15px", { lineHeight: "1.2", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      boxShadow: {
        "brand-glow": "0 0 40px hsl(var(--brand) / 0.4)",
        "brand-glow-lg": "0 0 60px hsl(var(--brand) / 0.5)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--brand-hover)) 100%)",
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
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 30px hsl(var(--brand) / 0.35)" },
          "50%": { boxShadow: "0 0 50px hsl(var(--brand) / 0.55)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
