/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#04040a',
        'obsidian-radial': '#000a1a',
        primary: '#ff4d00',
        secondary: '#00e5ff',
        accent: '#7000ff',
        success: '#00e87a',
        'king-gold': '#ffd700',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      animation: {
        'pulse-king': 'pulseKing 2s ease-in-out infinite',
        'glow-predator': 'glowPredator 3s ease-in-out infinite',
        'flame-flicker': 'flameFlicker 0.8s ease-in-out infinite alternate',
        'spin-wheel': 'spinWheel 4s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'god-ray': 'godRay 6s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'screen-shake': 'screenShake 0.4s ease-out',
      },
      keyframes: {
        pulseKing: {
          '0%, 100%': { boxShadow: '0 0 20px #ff4d00, 0 0 40px #ff4d0060' },
          '50%': { boxShadow: '0 0 40px #ff4d00, 0 0 80px #ff4d0080' },
        },
        glowPredator: {
          '0%, 100%': { boxShadow: '0 0 15px #7000ff, 0 0 30px #00e5ff40' },
          '50%': { boxShadow: '0 0 30px #7000ff, 0 0 60px #00e5ff60' },
        },
        flameFlicker: {
          '0%': { opacity: '0.6', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '1', transform: 'translateY(-4px) scale(1.1)' },
        },
        spinWheel: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(var(--spin-degrees, 1800deg))' },
        },
        glitch: {
          '0%': { transform: 'translate(0)', textShadow: '2px 0 #ff4d00, -2px 0 #00e5ff' },
          '25%': { transform: 'translate(-2px, 1px)', textShadow: '-2px 0 #ff4d00, 2px 0 #00e5ff' },
          '50%': { transform: 'translate(1px, -1px)', textShadow: '1px 0 #ff4d00, -1px 0 #00e5ff' },
          '75%': { transform: 'translate(-1px, 2px)', textShadow: '-1px 0 #ff4d00, 1px 0 #00e5ff' },
          '100%': { transform: 'translate(0)', textShadow: '2px 0 #ff4d00, -2px 0 #00e5ff' },
        },
        godRay: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        screenShake: {
          '0%, 100%': { transform: 'translate(0)' },
          '10%': { transform: 'translate(-4px, 2px)' },
          '30%': { transform: 'translate(4px, -2px)' },
          '50%': { transform: 'translate(-2px, 4px)' },
          '70%': { transform: 'translate(2px, -4px)' },
          '90%': { transform: 'translate(-1px, 1px)' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 15px #00e5ff, 0 0 30px #00e5ff40',
        'neon-violet': '0 0 15px #7000ff, 0 0 30px #7000ff40',
        'neon-orange': '0 0 20px #ff4d00, 0 0 40px #ff4d0060',
        'neon-green': '0 0 10px #00e87a, 0 0 20px #00e87a40',
      },
    },
  },
  plugins: [],
};
