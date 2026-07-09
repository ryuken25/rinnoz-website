type Props = { id: string; eyebrow?: string; title: string; intro?: string; children: React.ReactNode };
export function SectionShell({ id, eyebrow, title, intro, children }: Props) {
  return <section id={id} className="section-shell mx-auto max-w-7xl">
    <div className="mb-9 max-w-3xl">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-display text-4xl leading-tight md:text-6xl">{title}</h2>
      {intro && <p className="mt-4 text-lg leading-8 text-cream/70">{intro}</p>}
    </div>
    {children}
  </section>;
}
