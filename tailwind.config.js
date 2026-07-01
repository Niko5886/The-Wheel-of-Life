/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Брандови акценти (§6)
        brand: {
          green: '#43A047',
          red: '#E94F37',
          orange: '#F5A623',
          yellow: '#F7E463',
        },
        ink: '#2E2E2E',
        softbg: '#FBFAD1',
        // Цветове на 7-те сектора (§6) — топла → студена ротация
        sphere: {
          health: '#E94F37',
          mind: '#F5731F',
          relationships: '#F5A623',
          time: '#F7E463',
          mission: '#C6E063',
          finance: '#7FC241',
          joy: '#43A047',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(46, 46, 46, 0.25)',
      },
    },
  },
  plugins: [],
}
