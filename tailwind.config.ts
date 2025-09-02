import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  safelist: [
    "bg-green-100", "border-green-300", "text-green-800",
    "bg-red-100", "border-red-300", "text-red-700",
    "bg-yellow-100", "border-yellow-300", "text-yellow-800",
    "bg-blue-100", "border-blue-300", "text-blue-800",
    "bg-purple-100", "border-purple-300", "text-purple-800",
    "bg-gray-200", "border-gray-300", "text-gray-700",
    "bg-white", "border-gray-200", "text-gray-700"
  ],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        brand: {
          sky: "#0ea5e9",
          gold: "#facc15",
          dark: "#0f172a",
        },
        yellow: {
          base: "bg-yellow-300",
          hover: "hover:bg-yellow-400",
          head: "bg-yellow-100",
        },
        emerald: {
          base: "bg-emerald-300",
          hover: "hover:bg-emerald-400",
          head: "bg-emerald-100",
        },
        lime: {
          base: "bg-lime-300",
          hover: "hover:bg-lime-400",
          head: "bg-lime-100",
        },
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
