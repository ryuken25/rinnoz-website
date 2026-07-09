import type { Config } from 'tailwindcss';
export default { content: ['./src/**/*.{ts,tsx,mdx}'], theme: { extend: { colors: { midnight:'#0b0914', lavender:'#c6a7ff', blush:'#ff8bd4', cream:'#fff3cf' }, fontFamily: { display:['var(--font-display)','serif'], sans:['var(--font-sans)','sans-serif'] }, boxShadow:{ glow:'0 0 50px rgba(198,167,255,.22)' } } }, plugins: [] } satisfies Config;
