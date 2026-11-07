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
        // Official Palette
        gold: {
          DEFAULT: '#FFBF00',
          hover: '#E5AC00',
          active: '#CC9900',
          light: '#FFF5D6',
        },
        champagne: {
          DEFAULT: '#F2CF7E',
          soft: '#FBF3DF',
          border: '#E8C570',
        },
        lemon: {
          DEFAULT: '#FFE642',
          light: '#FFF9D9',
        },
        orange: {
          DEFAULT: '#FF7900',
          hover: '#E66D00',
          active: '#CC6100',
          light: '#FFF1E5',
        },
        // Neutral System
        charcoal: {
          DEFAULT: '#202020',
          muted: '#666666',
          light: '#888888',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#FFFDF7',
          dark: '#242018',
          border: '#EDE7D9',
          subtle: '#F8F5EE',
        },
        // Mapped existing token keys for backward compatibility
        pb: {
          bg: '#FFFDF7',
          bg2: '#F8F5EE',
          card: '#FFFFFF',
          gold: '#FFBF00',
          orange: '#FF7900',
          blue: '#FF7900', // remap to brand accent
          cyan: '#FFBF00',
          text: '#202020',
          muted: '#666666',
          line: '#EDE7D9',
        },
        brand: {
          50: '#FFFDF7',
          100: '#FBF3DF',
          200: '#F2CF7E',
          300: '#FFE642',
          400: '#FFBF00',
          500: '#FFBF00',
          600: '#FF7900',
          700: '#E66D00',
          800: '#242018',
          900: '#202020',
          950: '#14120E',
        },
        coral: {
          50: '#FFF1E5',
          100: '#FFE2CC',
          200: '#FFC699',
          300: '#FFA966',
          400: '#FF8D33',
          500: '#FF7900',
          600: '#E66D00',
          700: '#CC6100',
        },
        amber: {
          50: '#FFFDF7',
          100: '#FBF3DF',
          200: '#F2CF7E',
          300: '#FFE642',
          400: '#FFBF00',
          500: '#FFBF00',
          600: '#E5AC00',
        },
        emerald: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          400: '#4ADE80',
          500: '#16A34A',
          600: '#15803D',
          700: '#166534',
        },
      },
      fontFamily: {
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgba(36, 32, 24, 0.04)',
        'warm-card': '0 4px 20px -2px rgba(36, 32, 24, 0.05), 0 1px 3px 0 rgba(36, 32, 24, 0.03)',
        'warm-hover': '0 16px 36px -6px rgba(36, 32, 24, 0.1), 0 4px 12px -2px rgba(36, 32, 24, 0.04)',
        'warm-elevated': '0 20px 48px -10px rgba(36, 32, 24, 0.14), 0 6px 16px -3px rgba(36, 32, 24, 0.06)',
        'gold-glow': '0 4px 20px -2px rgba(255, 191, 0, 0.35)',
        'orange-glow': '0 4px 20px -2px rgba(255, 121, 0, 0.32)',
      },
      borderRadius: {
        'lg': '0.625rem',
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
