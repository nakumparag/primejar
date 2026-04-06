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
        // Primary blue brand color
        blue: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Prime alias (used in legacy pages)
        prime: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Accent amber
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
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
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
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
        'blue': '0 4px 14px 0 rgba(37,99,235,0.30)',
        'blue-lg': '0 8px 28px 0 rgba(37,99,235,0.38)',
        'orange': '0 4px 14px 0 rgba(37,99,235,0.30)',
        'orange-lg': '0 8px 28px 0 rgba(37,99,235,0.38)',
        'nav': '0 1px 0 0 rgba(0,0,0,0.06)',
        'focus': '0 0 0 3px rgba(37,99,235,0.15)',
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
        'gradient-blue': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'gradient-blue-light': 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        'gradient-orange': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'gradient-orange-light': 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
