/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './contexts/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './layouts/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // "Drafting paper" — cool technical off-white, never warm cream.
        bg: '#EEF0F2',
        surface: '#F8F9FA',
        // Graphite gridline, the tone of pencil lines on a blueprint grid.
        border: '#CDD3D6',
        ink: '#1B2030',
        sub: '#5B6270',
        // Signal — a burnt redline-orange, the markup color on a technical drawing.
        // Replaces the generic indigo/blue every SaaS dashboard reaches for.
        accent: '#C4491B',
        'accent-hover': '#A83913',
        'accent-soft': '#FBEBE1',
        success: '#3F7D5C',
        'success-soft': '#E5F0EA',
        warning: '#AD8A34',
        'warning-soft': '#F6EFDD',
        danger: '#B23A2E',
        'danger-soft': '#F7E7E4',
        story: '#3F7D5C',
        task: '#35618C',
        bug: '#B23A2E',
        epic: '#6E4F8C'
      },
      borderRadius: {
        DEFAULT: '0.1875rem',
        md: '0.1875rem',
        lg: '0.25rem',
        xl: '0.3125rem',
        '2xl': '0.375rem',
      },
    },
  },
  plugins: [],
};