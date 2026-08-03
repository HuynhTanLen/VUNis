/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './contexts/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './layouts/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: '#F8F9FA',
        surface: '#FFFFFF',
        border: '#D1D5DB',
        ink: '#0F172A',
        sub: '#64748B',
        accent: '#334155',
        'accent-soft': '#F1F5F9',
        success: '#166534',
        'success-soft': '#F0FDF4',
        warning: '#9A3412',
        'warning-soft': '#FFF7ED',
        danger: '#991B1B',
        'danger-soft': '#FEF2F2',
      },
    },
  },
  plugins: [],
};