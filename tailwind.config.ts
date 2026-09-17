import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:    "#0F1420",  // page
        panel:  "#161C2A",  // cards
        raised: "#1D2537",  // hover / inputs
        edge:   "#262F45",  // borders
        text:   "#E8ECF5",
        muted:  "#8892AA",
        heat:   "#FF7A45",  // rising / growth
        cool:   "#56A8FF",  // steady / baseline
        good:   "#3DD68C",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
