import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink-black': '#1b1c1c',
        'paper-base': '#fbf9f8',
        'blood-red': '#bb181e',
        'kodak-yellow': '#FFDD00',
        'silver-halide': '#e4e2e2',
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
        'body': ['"Hanken Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'hard': '8px 8px 0px 0px #1b1c1c',
        'hard-sm': '4px 4px 0px 0px #1b1c1c',
        'hard-hover': '10px 10px 0px 0px #1b1c1c',
        'hard-none': '0px 0px 0px 0px #1b1c1c',
      },
    },
  },
  plugins: [],
} satisfies Config;
