/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF8F2',
          100: '#F6EFE0',
          200: '#EBDDBF',
          300: '#DEC699',
          400: '#CEA96E',
          500: '#B8955A', // Primary brand gold
          600: '#A17D46',
          700: '#846235',
          800: '#684B2B',
          900: '#523A23',
          950: '#2E1F11',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#FAF7F2', // Primary background
          300: '#F3ECE2',
          400: '#E8E0D6', // Border
          500: '#DDD2C3',
          600: '#C4B5A1',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#CECDCC',
          300: '#AFAEA9',
          400: '#77716B', // Secondary text
          500: '#56504A',
          600: '#3D3835',
          700: '#2E2A27',
          800: '#24211F', // Primary text
          900: '#1A1816',
          950: '#0E0D0C',
        },
        brand: {
          gold: '#B8955A',
          'gold-light': '#D4B77D',
          'gold-dark': '#96743A',
          ivory: '#FAF7F2',
          charcoal: '#24211F',
          border: '#E8E0D6',
          success: '#24845D',
          error: '#C74646',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(184, 149, 90, 0.15)',
        'luxury-lg': '0 20px 40px -15px rgba(36, 33, 31, 0.08), 0 0 20px -5px rgba(184, 149, 90, 0.1)',
        'card': '0 4px 20px -2px rgba(36, 33, 31, 0.05)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #CEA96E 0%, #B8955A 50%, #96743A 100%)',
        'gold-shimmer': 'linear-gradient(90deg, rgba(184,149,90,0.1) 0%, rgba(212,183,125,0.3) 50%, rgba(184,149,90,0.1) 100%)',
        'hero-overlay': 'linear-gradient(180deg, rgba(26,24,22,0.45) 0%, rgba(26,24,22,0.8) 100%)',
      }
    },
  },
  plugins: [],
}
