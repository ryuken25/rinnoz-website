'use client';

import Image from 'next/image';
import type { SocialArtwork } from '@/content/artworks';
import { useI18n } from '@/i18n/useI18n';
import { scrollToSection } from '@/lib/scrollToSection';

type Props = {
  xCount: number;
  visibleCount: number;
  thumbnails: SocialArtwork[];
};

export function ArtworkLandingIntro({ xCount, visibleCount, thumbnails }: Props) {
  const { t } = useI18n();

  return (
    <section
      id="artworks"
      className="relative isolate scroll-mt-[calc(var(--nav-height)+36px)] px-4 pb-[clamp(2rem,5vh,3.5rem)] pt-[calc(var(--nav-height)+36px)]"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="card paper-card overflow-hidden p-5 shadow-atelier md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
            <div>
              <p className="eyebrow">{t('artworks.eyebrow')}</p>
              <h2 id="artworks-story-title" className="mt-2 font-display text-[clamp(2.1rem,4.2vw,3.8rem)] leading-[1.02] tracking-[-0.04em]">
                {t('artworks.landingTitle')}
              </h2>
              <p className="mt-4 max-w-2xl text-[clamp(.95rem,1.1vw,1.08rem)] leading-7 text-cream/72">
                {t('artworks.landingIntro')}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3">
                  <p className="text-xs font-black uppercase tracking-[.12em] text-blush">{t('artworks.primaryEyebrow')}</p>
                  <p className="mt-1 font-display text-2xl">{t('artworks.statX', { count: xCount })}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3">
                  <p className="text-xs font-black uppercase tracking-[.12em] text-blush">{t('artworks.curationEyebrow')}</p>
                  <p className="mt-1 font-display text-2xl">{t('artworks.statVisible', { count: visibleCount })}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3">
                  <p className="text-xs font-black uppercase tracking-[.12em] text-blush">{t('artworks.igEyebrow')}</p>
                  <p className="mt-1 font-display text-2xl">{t('artworks.statIg')}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary" onClick={() => scrollToSection('artworks-story-stage')}>
                  {t('artworks.startStory')}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => scrollToSection('artworks-browse')}>
                  {t('artworks.browseAll')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {thumbnails.slice(0, 6).map((item, i) => (
                <div
                  key={item.id}
                  className={`overflow-hidden rounded-[1.2rem] border border-white/12 bg-ink/40 ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={item.width}
                    height={item.height}
                    className={`h-full w-full object-cover ${i === 0 ? 'min-h-[180px] sm:min-h-[220px]' : 'aspect-square'}`}
                    sizes="(max-width:768px) 40vw, 180px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
