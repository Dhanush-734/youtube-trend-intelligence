import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core YouTube Design System
        "yt-red": "#FF0000",
        "yt-red-dark": "#CC0000",
        "yt-bg": "#0F0F0F",
        "yt-card": "#181818",
        "yt-elevated": "#212121",
        "yt-border": "#303030",
        "yt-text": "#FFFFFF",
        "yt-secondary": "#AAAAAA",
        "yt-muted": "#717171",

        // Semantic & backward-compatible tokens aligned to YouTube palette
        ink: "#0F0F0F",
        panel: "#181818",
        raised: "#212121",
        edge: "#303030",
        text: "#FFFFFF",
        muted: "#AAAAAA",
        heat: "#FF0000",
        cool: "#FF3333",
        good: "#22C55E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
