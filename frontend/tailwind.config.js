/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f9',
          100: '#ffe4f3',
          200: '#ffcae9',
          300: '#ff9fd5',
          400: '#3dadff', // Sky Blue
          500: '#f468c0', // Deep Pink
          600: '#e4369f', 
          700: '#c51d7e',
          800: '#a31b67',
          900: '#881b58',
          950: '#530931',
        },
        // Deep cosmic background palette
        cosmos: {
          50: '#f0eeff',
          100: '#ddd9ff',
          200: '#bcb3ff',
          300: '#9281ff',
          400: '#7c5cff',
          500: '#6c3aff',
          600: '#5e1bf5',
          700: '#4f0fd1',
          800: '#420eab',
          900: '#1a1035',
          950: '#0a0618',
        },
        // Neon accent colors
        neon: {
          purple: '#a855f7',
          blue: '#6366f1',
          pink: '#ec4899',
          cyan: '#22d3ee',
          green: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.2), 0 0 20px rgba(99, 102, 241, 0.1)' },
          '100%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
