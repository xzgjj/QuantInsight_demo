import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        graphite: "#344054",
        line: "#D0D5DD",
        positive: "#067647",
        negative: "#B42318",
        panel: "#F8FAFC"
      }
    }
  },
  plugins: []
};

export default config;
