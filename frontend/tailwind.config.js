/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        corporativo: {
          fondo: '#F1F5F9',      // Blanco/Gris muy claro de fondo
          claro1: '#C6E7FF',     // Celeste muy claro
          claro2: '#7EA0C5',     // Azul grisáceo intermedio
          oscuro: '#011025',     // Azul marino casi negro (ideal para barras/textos fuertes)
          principal: '#052659',  // Azul institucional principal
          boton: '#5482B4',      // Tono azul medio para acentos
          borde: '#071952',      // Azul marino profundo para contrastes o bordes
        }
      },
      // Animaciones y transiciones suaves opcionales para las tarjetas y modales
      animation: {
        fadeIn: 'fadeIn 0.25s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}