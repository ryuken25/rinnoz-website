import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)', midnight: 'var(--midnight)', violet: 'var(--violet)', lavender: 'var(--lavender)', blush: 'var(--blush)', rose: 'var(--rose)', cream: 'var(--cream)', mint: 'var(--mint)'
      },
      fontFamily: { display: ['var(--font-display)', 'serif'], sans: ['var(--font-sans)', 'sans-serif'] },
      boxShadow: { atelier: '0 24px 80px rgba(8,7,20,.42)', glow: '0 0 60px rgba(216,198,255,.24)', blush: '0 0 42px rgba(255,158,216,.2)' },
      keyframes: { floaty: {'0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-14px)'}}, twinkle:{'0%,100%':{opacity:'.35'}, '50%':{opacity:'1'}} },
      animation: { floaty: 'floaty 7s ease-in-out infinite', twinkle: 'twinkle 3.8s ease-in-out infinite' }
    }
  },
  plugins: [],
} satisfies Config;
