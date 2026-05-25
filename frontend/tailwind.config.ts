import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          accent: '#B85B5B',
          'accent-bright': '#C86A6A',
          'accent-dim': '#9F4F4F',
          'accent-glow': 'rgba(184, 91, 91, 0.12)',
          ink: '#181414',
          surface: '#FFFFFF',
          'surface-alt': '#FAF7F7',
          muted: '#6F6868',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'accent-glow': 'radial-gradient(ellipse at center, rgba(184,91,91,0.12) 0%, transparent 70%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(184,91,91,0.08) 0%, transparent 60%)',
        'card-gradient': 'linear-gradient(135deg, rgba(184,91,91,0.05) 0%, transparent 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'number-count': 'numberCount 2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(184,91,91,0.18)' },
          '50%': { boxShadow: '0 0 38px rgba(184,91,91,0.28)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        numberCount: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'accent-glow': '0 0 30px rgba(184, 91, 91, 0.16)',
        'accent-glow-sm': '0 0 15px rgba(184, 91, 91, 0.12)',
        'accent-glow-lg': '0 0 60px rgba(184, 91, 91, 0.18)',
        'card': '0 10px 30px rgba(66,42,42,0.08)',
        'card-hover': '0 16px 42px rgba(66,42,42,0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
