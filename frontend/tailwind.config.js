/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "hsl(var(--base))",
        surface: "hsl(var(--surface))",
        primary: "hsl(var(--primary))",
        primaryForeground: "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        greenDark: "hsl(var(--green-dark))",
        gold: "hsl(var(--gold))",
        textPrimary: "hsl(var(--text-primary))",
      },
      boxShadow: {
        soft: "0 12px 40px -20px hsl(var(--primary) / 0.5)",
        glow: "0 0 30px -5px hsl(var(--accent) / 0.4)",
        vibrant: "0 8px 32px -8px hsl(var(--primary) / 0.6)",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'card-in': 'cardIn 0.45s ease-out both',
      },
      keyframes: {
        cardIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px) scale(0.98)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
};
