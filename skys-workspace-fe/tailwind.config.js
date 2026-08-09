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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: '#F4F5F7',
        surface: '#FFFFFF',
        border: '#DFE1E6',
        ink: '#172B4D',
        sub: '#5E6C84',
        accent: '#0C66E4',
        'accent-hover': '#0052CC',
        'accent-soft': '#DEEBFF',
        success: '#00875A',
        'success-soft': '#E3FCEF',
        warning: '#FF991F',
        'warning-soft': '#FFFAE6',
        danger: '#DE350B',
        'danger-soft': '#FFEBE6',
        story: '#36B37E',
        task: '#4C9AFF',
        bug: '#FF5630',
        epic: '#6554C0'
      },
    },
  },
  plugins: [],
};