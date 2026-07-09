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
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '76';
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 76;
}

function storyTopGapPx() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--story-top-gap') || '16';
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 16;
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
  const rangeRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useI18n();

  const titleClass =
    locale === 'id'
      ? 'text-[clamp(1.85rem,2.45vw,3.05rem)] leading-[1.04]'
      : 'text-[clamp(2rem,2.65vw,3.35rem)] leading-[1.02]';

  // Keep pin travel compact — avoid giant blank after last chapter.
  const minHeightSvh = Math.max(320, chapters.length * 64);

  useGSAP(
    () => {
      if (!rangeRef.current || !stageRef.current) return;
      const cards = cardsRef.current.filter(Boolean);
      if (!cards.length) return;

      ScrollTrigger.getAll()
        .filter((tr) => tr.vars.id === 'artworks-story')
        .forEach((tr) => tr.kill());

      gsap.set(cards, {
        autoAlpha: 0,
        yPercent: 10,
        xPercent: 3,
        scale: 0.94,
        rotate: 1.5,
        filter: 'none',
        transformOrigin: '50% 50%',
      });
      gsap.set(cards[0], { autoAlpha: 1, yPercent: 0, xPercent: 0, scale: 1, rotate: -0.8 });
      gsap.set(progressRef.current, { scaleX: 0, transformOrigin: '0% 50%' });

      const chapterTravel = Math.min(window.innerHeight * 0.58, 480);

      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'artworks-story',
          trigger: rangeRef.current,
          // Pin flush under navbar + small top gap (not +28/+48 which sits too low).
          start: () => `top top+=${navPx() + storyTopGapPx()}`,
          end: () => `+=${Math.max(chapterTravel * Math.max(1, chapters.length - 1), chapterTravel)}`,
          scrub: 0.65,
          pin: stageRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: false,
          onUpdate: (self) => {
            const next = Math.min(chapters.length - 1, Math.max(0, Math.round(self.progress * (chapters.length - 1))));
            setActiveIndex(next);
            gsap.set(progressRef.current, { scaleX: self.progress });
          },
          onRefresh: (self) => {
            if (self.progress < 0.02) setActiveIndex(0);
          },
        },
      });

      triggerRef.current = tl.scrollTrigger || null;

      cards.forEach((card, index) => {
        if (index === 0) return;
        tl.to(cards[index - 1], {
          autoAlpha: 0.12,
          yPercent: -6,
          xPercent: -4,
          scale: 0.92,
          rotate: -3,
          duration: 0.38,
          ease: 'power2.out',
        });
        tl.to(
          card,
          {
            autoAlpha: 1,
            yPercent: 0,
            xPercent: 0,
            scale: 1,
            rotate: index % 2 ? 0.8 : -0.8,
            duration: 0.46,
            ease: 'power2.out',
          },
          '<0.05',
        );
      });

      const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 350);
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
    const st = triggerRef.current || ScrollTrigger.getById('artworks-story');
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
        ref={rangeRef}
        id="artworks-story-stage"
        className="relative isolate overflow-visible scroll-mt-[calc(var(--nav-height)+4px)]"
        style={{ minHeight: `${minHeightSvh}svh` }}
        aria-labelledby="artworks-story-title"
      >
        {/* decorative only — clip this layer, not sticky parent */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 bottom-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-pink-300/10 blur-[120px]" />
          <div className="absolute right-[-10%] top-[10%] h-[520px] w-[520px] rounded-full bg-violet-400/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,158,216,.12),transparent_28%),radial-gradient(circle_at_20%_70%,rgba(216,198,255,.1),transparent_34%)]" />
        </div>

        {/* Center-biased slightly upper via CSS --story-visual-shift */}
        <div
          ref={stageRef}
          className="story-sticky sticky flex items-center overflow-visible py-0"
        >
          <div className="story-stage-grid mx-auto grid w-full max-w-[1180px] grid-cols-[0.84fr_1.16fr] items-center gap-[clamp(1.25rem,2.4vw,2.5rem)] px-[clamp(1rem,2.5vw,2.5rem)]">
            <aside className="story-panel story-panel-frame flex flex-col overflow-hidden rounded-[1.75rem] border border-white/12 bg-ink/70 p-[clamp(1rem,1.55vw,1.45rem)] shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_20px_60px_rgba(0,0,0,.28)] backdrop-blur-2xl">
              <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-blush">{storyEyebrow}</p>
              <motion.div key={`${active.id}-${meta.kicker}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="min-h-0 flex-1">
                <p className="mt-2.5 text-[0.72rem] font-black uppercase tracking-[0.12em] text-blush">{meta.kicker}</p>
                <h3 className={`story-title mt-2 font-display tracking-[-.04em] ${titleClass}`}>{meta.title}</h3>
                <p className="story-body mt-2.5 text-[clamp(.86rem,.88vw,.98rem)] leading-[1.55] text-cream/68">{meta.body}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {meta.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[.7rem] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-2 truncate text-[clamp(.74rem,.76vw,.88rem)] font-black text-lavender">
                  {active.title} • {sourceLabel(active.source)}
                </p>
              </motion.div>

              <div className="story-steps mt-2 space-y-1.5">
                {chapters.map((c, i) => {
                  const isActive = activeIndex === i;
                  return (
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      key={c.id}
                      className={`story-step-card flex w-full items-start gap-2.5 rounded-2xl border px-3 py-2 text-left transition ${
                        isActive
                          ? 'border-lavender/70 bg-lavender/12 shadow-[0_0_20px_rgba(216,198,255,.12)]'
                          : 'border-white/10 bg-white/5 opacity-55 hover:opacity-100'
                      }`}
                    >
                      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? 'animate-pulse bg-blush' : 'bg-white/25'}`} />
                      <div className="min-w-0">
                        <p className="text-[0.66rem] font-black uppercase tracking-[0.08em] text-blush">{chapterMeta[i]?.kicker}</p>
                        <p className="line-clamp-2 text-[clamp(.72rem,.72vw,.84rem)] font-bold leading-snug">{chapterMeta[i]?.title}</p>
                        {isActive ? (
                          <p className="story-step-body mt-0.5 line-clamp-2 text-[0.7rem] leading-snug text-cream/65">{chapterMeta[i]?.body}</p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div ref={progressRef} className="h-full w-full bg-gradient-to-r from-lavender to-blush" />
              </div>
            </aside>

            <div className="story-panel-frame relative flex items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/12 bg-gradient-to-br from-white/[.08] to-white/[.03] p-[clamp(1rem,1.8vw,1.75rem)] shadow-atelier">
              {chapters.map((item, i) => {
                const isActive = i === activeIndex;
                return (
                  <article
                    ref={(el) => {
                      if (el) cardsRef.current[i] = el;
                    }}
                    key={item.id}
                    className="absolute inset-[clamp(0.75rem,1.2vw,1.15rem)] grid place-items-center"
                    style={{ zIndex: isActive ? 30 : 10 }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className="group relative flex h-full w-full items-center justify-center rounded-[1.5rem] bg-ink/25 p-[clamp(.5rem,.9vw,.75rem)]"
                    >
                      {/* decorative blur only behind active art */}
                      <div className="pointer-events-none absolute inset-6 opacity-25 blur-2xl" aria-hidden>
                        <Image src={item.imageUrl} alt="" width={item.width} height={item.height} className="h-full w-full object-contain" />
                      </div>
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={item.width}
                        height={item.height}
                        sizes="(max-width:1024px) 70vw, 48vw"
                        className="relative z-10 h-auto max-h-[min(48svh,460px)] w-auto max-w-[min(90%,560px)] rounded-[1.35rem] object-contain opacity-100 shadow-[0_24px_80px_rgba(255,155,213,.16)]"
                        style={{ filter: 'none' }}
                        priority={i < 1}
                      />
                      <span className="absolute left-3 top-3 z-20 rounded-full border border-white/15 bg-ink/70 px-3 py-1 text-[.7rem] font-black text-lavender backdrop-blur">
                        {sourceLabel(item.source)}
                      </span>
                      <span className="absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-white/12 bg-ink/72 p-3 text-left opacity-0 backdrop-blur-xl transition group-hover:opacity-100">
                        <b className="text-sm">{item.title}</b>
                        <br />
                        <small className="text-cream/60">{t('artworks.openFull')}</small>
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
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
    <section
      id="artworks-story-stage"
      className="space-y-5 scroll-mt-[calc(var(--nav-height)+4px)] px-4 lg:hidden"
      aria-labelledby="artworks-story-title"
    >
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

  if (isDesktop && !reduceMotion) {
    return (
      <ArtworkStoryDesktop
        chapters={chapters}
        onSelect={onSelect}
        chapterMeta={chapterMeta}
        storyEyebrow={t('artworks.storyEyebrow')}
        locale={locale}
      />
    );
  }

  return <ArtworkStoryMobile chapters={chapters} onSelect={onSelect} chapterMeta={chapterMeta} />;
}
