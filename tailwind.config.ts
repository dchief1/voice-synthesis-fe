import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'sarpanch' : ['Sarpanch', 'sans-serif'],
        'sourgummy' : ['Sour Gummy', 'sans-serif'],
      },
      screens: {
        'mobile': '340px',
        'pad': '640px',
        'pc': '1024px',
      },
    },
  },
  plugins: [],
};
export default config;
