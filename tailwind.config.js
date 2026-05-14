/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        blush: '#E88CA8',
        peach: '#F6D1C1',
        lavender: '#C9B6FF',
        ivory: '#FFF9F7',
        charcoal: '#1E1E1E',
        mist: '#7D7D7D',
        mint: '#7ED6A5',
        roseDeep: '#D96B8C',
        panel: 'rgba(255,255,255,0.75)'
      },
      fontFamily: {
        sans: ['PlusJakartaSans_500Medium'],
        medium: ['PlusJakartaSans_600SemiBold'],
        bold: ['PlusJakartaSans_700Bold'],
        extra: ['PlusJakartaSans_800ExtraBold']
      },
      boxShadow: {
        glow: '0px 12px 40px rgba(232, 140, 168, 0.22)',
        soft: '0px 10px 30px rgba(64, 34, 40, 0.10)'
      },
      borderRadius: {
        card: '28px',
        pill: '999px'
      }
    }
  },
  plugins: []
};
