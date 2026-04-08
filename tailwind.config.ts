import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#030711',
        neon: '#29f7c0',
        ember: '#ff6f4a',
        hud: '#9fd3ff'
      },
      boxShadow: {
        glow: '0 0 0.8rem rgba(41,247,192,0.45)'
      }
    }
  },
  plugins: []
} satisfies Config;
