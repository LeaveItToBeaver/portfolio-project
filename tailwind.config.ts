import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        'muted-foreground': "hsl(var(--muted-foreground))"
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.25rem"
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.35)",
      },
      fontFamily: {
        sans: ["ui-sans-serif","system-ui","-apple-system","Segoe UI","Roboto","Inter","Arial","sans-serif"]
      },
      backgroundImage: {
        'gradient-noise': `
          linear-gradient(91deg, rgba(156,127,171,0.8), rgba(200,253,201,0)),
          linear-gradient(0deg, rgba(200,253,201,0.8), rgba(0,255,0,0)),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 278 278' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.31' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
        `,
        'text-gradient-noise': `
          linear-gradient(91deg, rgba(156,127,171,1), rgba(200,253,201,1)),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 278 278' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.31' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
        `
      },
      borderWidth: {
        '3': '3px',
        '4': '4px'
      },
      filter: {
        'noise': 'contrast(120%) brightness(100%)'
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: any) {
      addUtilities({
        '.gradient-border': {
          'background': `
            linear-gradient(91deg, rgba(156,127,171,0.8), rgba(200,253,201,0)),
            linear-gradient(0deg, rgba(200,253,201,0.8), rgba(0,255,0,0)),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 278 278' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.31' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
          `,
          'filter': 'contrast(120%) brightness(100%)',
          'padding': '3px'
        },
        '.gradient-border-hover:hover': {
          'background': `
            linear-gradient(91deg, rgba(156,127,171,0.9), rgba(200,253,201,0.1)),
            linear-gradient(0deg, rgba(200,253,201,0.9), rgba(0,255,0,0.1)),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 278 278' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.31' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
          `,
          'filter': 'contrast(120%) brightness(100%)'
        }
      })
    }
  ],
};

export default config;
