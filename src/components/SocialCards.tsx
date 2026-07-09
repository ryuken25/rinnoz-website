import { socials } from '@/content/socials';
import { BrandIcon } from './BrandIcon';
import { SectionShell } from './SectionShell';

export function SocialCards(){
  return <SectionShell id="socials" eyebrow="Official links" title="Find RinnOZ around the web">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {socials.map(s=><a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="card group flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:border-blush/40">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/12 bg-white/[.06] text-lavender shadow-[0_0_24px_rgba(216,198,255,.08)] transition group-hover:border-blush/40 group-hover:bg-white/[.1]"><BrandIcon name={s.label} className="h-6 w-6"/></span>
        <span className="min-w-0"><b className="block">{s.label}</b><span className="mt-1 block truncate text-sm text-cream/55">{s.href.replace(/^https?:\/\//,'')}</span></span>
      </a>)}
    </div>
  </SectionShell>
}
