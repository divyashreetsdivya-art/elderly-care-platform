import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        senior: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          text: "#0F172A",
          muted: "#475569",
          border: "#CBD5E1",
          primary: "#1D4ED8", // High-contrast accessible blue (WCAG AAA)
          primaryHover: "#1E40AF",
          success: "#15803D", // Deep emerald green for "I took it"
          successHover: "#166534",
          warning: "#B45309", // Warm amber for snooze / reminder
          warningHover: "#92400E",
          alert: "#B91C1C",   // High-vis emergency red
          alertHover: "#991B1B",
        },
      },
      fontSize: {
        // Senior-optimized readable font scales
        "elder-sm": ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        "elder-base": ["1.25rem", { lineHeight: "2rem" }],     // 20px
        "elder-lg": ["1.5rem", { lineHeight: "2.25rem" }],      // 24px
        "elder-xl": ["1.875rem", { lineHeight: "2.5rem" }],     // 30px
        "elder-2xl": ["2.25rem", { lineHeight: "2.75rem" }],    // 36px
        "elder-3xl": ["3rem", { lineHeight: "3.5rem" }],        // 48px
      },
      minHeight: {
        "touch": "64px", // Minimum accessible touch target size
      },
      minWidth: {
        "touch": "64px",
      },
    },
  },
  plugins: [],
};

export default config;
