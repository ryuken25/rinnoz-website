"use client";
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { SocialArtwork } from '@/content/artworks';
import { sourceLabel } from '@/content/artworks';
import { useI18n } from '@/i18n/useI18n';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function makeChapters(items: SocialArtwork[]) {
  return [
    items.find((i) => i.id.includes('206479')),
    items.find((i) => i.tags.includes('Chibi')),
    items.find((i) => i.tags.includes('Mascot / Vtuber')),
    items.find((i) => i.id.includes('202409')) || items.find((i) => i.id.includes('196204')),
    items.find((i) => i.id.includes('198489')),
  ].filter(Boolean) as SocialArtwork[];
}

function useIsDesktop() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = matchMedia('(min-width:1024px)');
    const sync = () => setOk(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return ok;
}

function navPx() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '88';
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 88;
}

function ArtworkStoryDesktop({
  chapters,
  onSelect,
  chapterMeta,
  storyEyebrow,
  locale,
}: {
  chapters: SocialArtwork[];
  onSelect: (id: string) => void;
  chapterMeta: { kicker: string; title: string; body: string; tags: string[] }[];
  storyEyebrow: string;
  locale: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useI18n();

  const titleClass =
    locale === 'id'
      ? 'text-[clamp(1.85rem,2.7vw,3.35rem)] leading-[0.98]'
      : 'text-[clamp(2rem,2.95vw,3.65rem)] leading-[0.98]';

  useGSAP(
    () => {
      if (!pinRef.current) return;
      const cards = cardsRef.current.filter(Boolean);
      if (!cards.length) return;

      gsap.set(cards, {
        autoAlpha: 0,
        yPercent: 14,
        xPercent: 5,
        scale: 0.9,
        rotate: 3,
        filter: 'blur(6px)',
        transformOrigin: '50% 50%',
      });
      gsap.set(cards[0], { autoAlpha: 1, yPercent: 0, xPercent: 0, scale: 1, rotate: -1.5, filter: 'blur(0px)' });
      gsap.set(progressRef.current, { scaleX: 0, transformOrigin: '0% 50%' });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'rinnoz-artwork-story',
          trigger: pinRef.current,
          start: () => `top+=${navPx() + 28} top`,
          end: () => `+=${Math.max(2400, window.innerHeight * Math.max(1, chapters.length - 1))}`,
          scrub: 0.65,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: false,
          onUpdate: (self) => {
            const next = Math.min(chapters.length - 1, Math.max(0, Math.round(self.progress * (chapters.length - 1))));
            setActiveIndex(next);
            gsap.set(progressRef.current, { scaleX: self.progress });
          },
        },
      });

      triggerRef.current = tl.scrollTrigger || null;

      cards.forEach((card, index) => {
        if (index === 0) return;
        tl.to(cards[index - 1], {
          autoAlpha: 0.14,
          yPercent: -10,
          xPercent: -8,
          scale: 0.84,
          rotate: -6,
          filter: 'blur(4px)',
          duration: 0.42,
          ease: 'power2.out',
        });
        tl.to(
          card,
          {
            autoAlpha: 1,
            yPercent: 0,
            xPercent: 0,
            scale: 1,
            rotate: index % 2 ? 1.5 : -1.5,
            filter: 'blur(0px)',
            duration: 0.52,
            ease: 'power2.out',
          },
          '<0.08',
        );
      });

      const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 450);
      return () => window.clearTimeout(refresh);
    },
    { scope: rootRef, dependencies: [chapters.length, locale], revertOnUpdate: true },
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [locale, chapterMeta]);

  function jumpTo(index: number) {
    setActiveIndex(index);
    const st = triggerRef.current || ScrollTrigger.getById('rinnoz-artwork-story');
    if (st) {
      const target = st.start + (st.end - st.start) * (index / Math.max(1, chapters.length - 1));
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }

  const active = chapters[activeIndex] || chapters[0];
  const meta = chapterMeta[activeIndex] || chapterMeta[0];
  if (!active || !meta) return null;

  return (
    <div ref={rootRef} className="hidden lg:block">
      <div
        ref={pinRef}
        className="relative min-h-[calc(100svh-var(--nav-height,88px)-56px)] overflow-hidden bg-ink/20 pt-[clamp(0.75rem,1.6vh,1.5rem)] pb-[clamp(0.75rem,1.4vh,1.25rem)]"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,158,216,.16),transparent_28%),radial-gradient(circle_at_20%_70%,rgba(216,198,255,.13),transparent_34%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-var(--nav-height,88px)-72px)] w-full max-w-[1280px] grid-cols-[0.82fr_1.18fr] items-center gap-[clamp(1.5rem,3vw,3rem)] px-[clamp(1rem,3vw,3rem)]">
          <aside className="story-panel max-h-[calc(100svh-var(--nav-height,88px)-72px)] overflow-hidden rounded-[1.8rem] border border-white/12 bg-ink/66 p-[clamp(1.1rem,1.8vw,1.65rem)] shadow-glow backdrop-blur-2xl">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-blush">{storyEyebrow}</p>
            <motion.div key={`${active.id}-${meta.kicker}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
              <p className="mt-[clamp(.7rem,1.4vh,1.1rem)] text-[0.72rem] font-black uppercase tracking-[0.12em] text-blush">{meta.kicker}</p>
              <h3 className={`story-title mt-2 font-display tracking-[-.045em] ${titleClass}`}>{meta.title}</h3>
              <p className="story-body-long mt-[clamp(.6rem,1.2vh,0.95rem)] text-[clamp(.86rem,.88vw,.98rem)] leading-[1.55] text-cream/68">{meta.body}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {meta.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[.7rem] font-bold">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-2.5 truncate text-[clamp(.75rem,.76vw,.88rem)] font-black text-lavender">
                {active.title} • {sourceLabel(active.source)}
              </p>
            </motion.div>

            <div className="story-steps mt-[clamp(.7rem,1.4vh,1.05rem)] space-y-1.5">
              {chapters.map((c, i) => {
                const isActive = activeIndex === i;
                return (
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    key={c.id}
                    className={`flex w-full items-start gap-2.5 rounded-2xl border px-3 py-2 text-left transition ${
                      isActive
                        ? 'border-lavender/70 bg-lavender/12 shadow-[0_0_24px_rgba(216,198,255,.12)]'
                        : 'border-white/10 bg-white/5 opacity-58 hover:opacity-100'
                    }`}
                  >
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? 'animate-pulse bg-blush' : 'bg-white/25'}`} />
                    <div className="min-w-0">
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-blush">{chapterMeta[i]?.kicker}</p>
                      <p className="line-clamp-2 text-[clamp(.72rem,.72vw,.86rem)] font-bold leading-snug">{chapterMeta[i]?.title}</p>
                      {isActive ? (
                        <p className="story-step-body mt-0.5 line-clamp-2 text-[0.72rem] leading-snug text-cream/65">{chapterMeta[i]?.body}</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-[clamp(.7rem,1.4vh,1.05rem)] h-1.5 overflow-hidden rounded-full bg-white/10">
              <div ref={progressRef} className="h-full w-full bg-gradient-to-r from-lavender to-blush" />
            </div>
          </aside>

          <div className="story-art-frame relative flex max-h-[calc(100svh-var(--nav-height,88px)-72px)] min-h-[calc(100svh-var(--nav-height,88px)-96px)] items-center justify-center overflow-hidden rounded-[2rem] border border-white/12 bg-gradient-to-br from-white/[.09] to-white/[.03] p-[clamp(1rem,1.8vw,1.5rem)] shadow-atelier">
            {chapters.map((item, i) => (
              <article
                ref={(el) => {
                  if (el) cardsRef.current[i] = el;
                }}
                key={item.id}
                className="story-card absolute inset-[clamp(0.9rem,1.4vw,1.35rem)] grid place-items-center"
              >
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="group relative flex h-full w-full items-center justify-center rounded-[1.5rem] bg-ink/42 p-[clamp(.65rem,1.1vw,.9rem)]"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={item.width}
                    height={item.height}
                    sizes="(max-width:1024px) 70vw, 48vw"
                    className="h-auto max-h-[min(54svh,560px)] w-auto max-w-[min(620px,46vw)] rounded-[1.2rem] object-contain shadow-atelier"
                    priority={i < 1}
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-ink/70 px-3 py-1 text-[.7rem] font-black text-lavender backdrop-blur">
                    {sourceLabel(item.source)}
                  </span>
                  <span className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/12 bg-ink/72 p-3 text-left opacity-0 backdrop-blur-xl transition group-hover:opacity-100">
                    <b className="text-sm">{item.title}</b>
                    <br />
                    <small className="text-cream/60">{t('artworks.openLightbox')}</small>
                  </span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtworkStoryMobile({
  chapters,
  onSelect,
  chapterMeta,
}: {
  chapters: SocialArtwork[];
  onSelect: (id: string) => void;
  chapterMeta: { kicker: string; title: string; body: string; tags: string[] }[];
}) {
  return (
    <section id="artworks-mobile-story" className="space-y-5 lg:hidden">
      {chapters.map((item, i) => (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="card w-full overflow-hidden p-3 text-left"
        >
          <div className="rounded-[1.5rem] bg-ink/38 p-2">
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={item.width}
              height={item.height}
              sizes="(max-width:640px) 92vw, (max-width:1024px) 70vw, 48vw"
              className="h-auto max-h-[48svh] w-full rounded-[1.25rem] object-contain"
              priority={i === 0}
            />
          </div>
          <div className="p-3">
            <p className="text-[.72rem] font-black uppercase tracking-[.14em] text-blush">{chapterMeta[i]?.kicker}</p>
            <h3 className="mt-2 font-display text-[clamp(1.45rem,7vw,2.15rem)] leading-[1.05] tracking-[-.035em]">{chapterMeta[i]?.title}</h3>
            <p className="mt-2 text-[.92rem] leading-[1.55] text-cream/65">{chapterMeta[i]?.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(chapterMeta[i]?.tags || []).map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[.7rem] font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.button>
      ))}
    </section>
  );
}

export function ArtworkStory({ items, onSelect }: { items: SocialArtwork[]; onSelect: (id: string) => void }) {
  const chapters = useMemo(() => makeChapters(items), [items]);
  const isDesktop = useIsDesktop();
  const reduceMotion = useReducedMotion();
  const { t, ta, locale } = useI18n();
  const chapterMeta = ta<{ kicker: string; title: string; body: string; tags: string[] }>('artworks.chapters');

  return (
    <div className="mt-8">
      {isDesktop && !reduceMotion ? (
        <ArtworkStoryDesktop
          chapters={chapters}
          onSelect={onSelect}
          chapterMeta={chapterMeta}
          storyEyebrow={t('artworks.storyEyebrow')}
          locale={locale}
        />
      ) : (
        <ArtworkStoryMobile chapters={chapters} onSelect={onSelect} chapterMeta={chapterMeta} />
      )}
    </div>
  );
}
