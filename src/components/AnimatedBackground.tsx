export function AnimatedBackground() {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute left-[7%] top-28 h-[34vw] max-h-72 w-[34vw] max-w-72 rounded-full bg-lavender/10 blur-3xl" />
    <div className="absolute right-0 top-44 h-[38vw] max-h-80 w-[38vw] max-w-80 rounded-full bg-blush/10 blur-3xl" />
    <div className="absolute bottom-20 left-1/3 h-[42vw] max-h-96 w-[42vw] max-w-96 rounded-full bg-violet/10 blur-3xl" />
    {Array.from({ length: 18 }).map((_, i) => <span key={i} className="absolute h-1 w-1 animate-twinkle rounded-full bg-cream/70" style={{ left: `${(i*37)%100}%`, top: `${8 + ((i*53)%82)}%`, animationDelay: `${i*.19}s` }} />)}
  </div>;
}
