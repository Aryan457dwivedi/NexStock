/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      colors: {
        canvas:  'var(--canvas)',
        surface: 'var(--surface)',
        sunken:  'var(--surface-sunken)',
        ink:     'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        line:    'var(--line)',
        accent:  'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        ok:      'var(--ok)',
        'ok-soft': 'var(--ok-soft)',
        warn:    'var(--warn)',
        'warn-soft': 'var(--warn-soft)',
        danger:  'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
      },
      boxShadow: {
        soft:    '0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.03)',
        'soft-md': '0 4px 12px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'soft-lg': '0 12px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
