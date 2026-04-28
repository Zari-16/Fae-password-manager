/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fae: {
          purple: '#9333ea',
          'purple-light': '#c084fc',
          'purple-dark': '#6b21a8',
          pink: '#ec4899',
          'pink-light': '#f9a8d4',
          blue: '#3b82f6',
          'blue-light': '#93c5fd',
          dark: '#0f0a1e',
          mid: '#1a1032',
          surface: '#1e1540',
          border: 'rgba(255,255,255,0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'fae-gradient': 'linear-gradient(135deg, #0f0a1e 0%, #1a1032 50%, #0f1a2e 100%)',
        'fae-hero': 'radial-gradient(ellipse at top, #2d1b69 0%, #0f0a1e 60%)',
        'fae-card': 'linear-gradient(135deg, rgba(147,51,234,0.1), rgba(236,72,153,0.05))',
        'fae-button': 'linear-gradient(135deg, #9333ea, #ec4899)',
        'fae-button-hover': 'linear-gradient(135deg, #a855f7, #f472b6)',
        'aurora': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      },
      boxShadow: {
        'fae': '0 4px 20px rgba(147,51,234,0.3)',
        'fae-lg': '0 8px 40px rgba(147,51,234,0.4)',
        'fae-pink': '0 4px 20px rgba(236,72,153,0.3)',
        'glass': '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        'inner-glow': 'inset 0 0 20px rgba(147,51,234,0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'butterfly': 'butterfly 8s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'gradient': 'gradient-shift 4s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(2deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(147,51,234,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(236,72,153,0.5), 0 0 60px rgba(147,51,234,0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        butterfly: {
          '0%, 100%': { transform: 'translateX(0) translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateX(30px) translateY(-20px) rotate(5deg)' },
          '50%': { transform: 'translateX(60px) translateY(0) rotate(0deg)' },
          '75%': { transform: 'translateX(30px) translateY(20px) rotate(-5deg)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
