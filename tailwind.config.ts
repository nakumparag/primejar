import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary orange brand color
        orange: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
          700: '#c2510a',
          800: '#9a3e10',
          900: '#7c3410',
          950: '#431709',
        },
        // Neutral grays
        gray: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        // Success green
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Dribbble-inspired accent colors
        rose: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        violet: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // Dark mode palette
        dark: {
          50:  '#1A2030',
          100: '#161B25',
          200: '#0F1117',
          300: '#0A0D14',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px', // Dribbble card radius
        '4xl': '28px',
        '5xl': '40px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 12px 32px -8px rgba(0,0,0,0.10), 0 4px 8px -2px rgba(0,0,0,0.04)',
        'card-hover-dark': '0 12px 32px -8px rgba(0,0,0,0.50), 0 4px 8px -2px rgba(0,0,0,0.3)',
        'orange': '0 4px 14px 0 rgba(249,115,22,0.30)',
        'orange-lg': '0 8px 28px 0 rgba(249,115,22,0.38)',
        'nav': '0 1px 0 0 rgba(0,0,0,0.06)',
        'focus': '0 0 0 3px rgba(249,115,22,0.15)',
        'shot': '0 4px 20px rgba(0,0,0,0.08)',
        'shot-hover': '0 16px 40px rgba(0,0,0,0.14)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.35s ease-out both',
        'slide-in-right': 'slideInRight 0.3s ease-out both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out both',
        'shimmer': 'shimmer 1.5s infinite',
        'bounce-soft': 'bounceSoft 0.6s ease both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSoft: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      // Background patterns
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #F97316 0%, #EA6C0A 100%)',
        'gradient-orange-light': 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
