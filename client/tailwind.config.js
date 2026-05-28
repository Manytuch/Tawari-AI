/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rescue: {
          // new semantic names
          primary: '#6366F1',
          accent:  '#06B6D4',
          dark:    '#0B1220',
          panel:   '#0f1724',
          border:  '#1f2937',
          muted:   '#94a3b8',
          // legacy keys kept for existing classnames
          red:    '#6366F1',
          // keep old dark/panel/border/muted keys for compatibility
          // (they match the semantic colors above)
          panel:  '#0f1724',
          border: '#1f2937',
          muted:  '#94a3b8',
          dark:   '#0B1220',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up':    'fadeUp 0.5s ease forwards',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
