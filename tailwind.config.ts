import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#00E676",
        "accent-dark": "#00C853",
        surface: "#1A1A2E",
        "surface-light": "#16213E",
        "surface-card": "#0F3460",
      },
      minHeight: {
        "btn": "56px",
      },
    },
  },
  plugins: [],
}
export default config
