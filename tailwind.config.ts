import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from logo - flat, no gradients
        brand: {
          navy: {
            50: '#F0F3F7',
            100: '#E1E7EF',
            200: '#C3CFE0',
            300: '#A5B7D0',
            400: '#879FC1',
            500: '#1A3756', // Main navy from logo
            600: '#152D47',
            700: '#102238',
            800: '#0B1729',
            900: '#050B14',
          },
          teal: {
            50: '#E6F9F6',
            100: '#CCF3ED',
            200: '#99E7DB',
            300: '#66DBC9',
            400: '#33CFB7',
            500: '#00AF9B', // Main teal from logo
            600: '#008C7C',
            700: '#00695D',
            800: '#00463E',
            900: '#00231F',
          },
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          },
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',  // 4px
        'DEFAULT': '0.5rem',  // 8px
        'md': '0.5rem',  // 8px
        'lg': '0.5rem',  // 8px max
        'xl': '0.5rem',  // 8px max
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'md': '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        'lg': '0 4px 6px 0 rgba(0, 0, 0, 0.08)',
        'xl': '0 8px 12px 0 rgba(0, 0, 0, 0.08)',
        'none': 'none',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
