const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // --- INICIO DE NUEVAS UTILIDADES ---
      colors: {
        'brand-dark': '#1A1A1A',
        'brand-surface': '#2C2C2C',
        'brand-bubble': '#333333',
      },
      boxShadow: {
        'inner-light': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.08)',
        'avatar-glow': '0 0 15px rgba(192, 132, 252, 0.6)', // Usaremos un morado sutil para el brillo
      },
      // --- FIN DE NUEVAS UTILIDADES ---
      
      // El resto de tu configuración original
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // --- INICIO DE NUEVO PLUGIN ---
    plugin(function({ addUtilities }) {
      addUtilities({
        '.text-glow': {
          textShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
        },
      })
    })
    // --- FIN DE NUEVO PLUGIN ---
  ],
};