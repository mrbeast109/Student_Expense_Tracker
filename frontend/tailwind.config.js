/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Design system tokens from design.md
        ink: "#16262A",           // primary text, headers, borders, active nav
        paper: "#F5F3EC",         // page background
        "paper-2": "#EFEBDF",     // secondary surface (chips, scan zone)
        card: "#FFFFFF",          // card/panel background
        marigold: "#F2A93B",      // primary accent — CTAs, highlights, AI badges
        "marigold-ink": "#7A4E0C", // text on marigold surfaces
        teal: "#1F8A70",          // positive / success / credit
        coral: "#E2583E",         // negative / warning / debit / error
        line: "#DAD4C4",          // borders, dividers
        muted: "#6B7472",         // secondary text, labels, timestamps
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        // Cut-paper feel: flat 2px step + soft diffuse
        card: "2px 2px 0px #DAD4C4, 0 4px 16px rgba(22,38,42,0.07)",
        raised: "3px 3px 0px #DAD4C4, 0 8px 24px rgba(22,38,42,0.12)",
        // Hard 1px lift for button hover (no blur)
        "btn-hover": "2px 2px 0px #16262A",
      },
      borderRadius: {
        DEFAULT: "14px",
        card: "14px",
        btn: "9px",
        pill: "999px",
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [],
};
